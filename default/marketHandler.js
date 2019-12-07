/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('marketHandler');
 * mod.thing == 'a thing'; // true
 */

 // TODOs
 // better average calculation to avoid gaming with amount = 1 transactions
 // handle compounds elements (not just X, U, etc)

 /**
  * Finds someone buying minerals and sells to them.
  * @param {string} mineral - type of mineral to sell
  * @param {number} amount - (maximum) amount of mineral to sell 
  * @param {number} floor - minimum price to sell mineral for
  */
 Room.prototype.sellToHighestBidder = function (mineral, amount, floor) {
     if (this.terminal.cooldown > 0) {
         console.log(this.name + ' wants to sell minerals but terminal is in cooldown');
         return;
     }
     const orders = Game.market.getAllOrders({resourceType: mineral, type: ORDER_BUY});
     _.remove(orders, (o) => { return o.price < floor || o.amount < 50});
     if (orders.length == 0) {
        return 0;
    }
     orders.sort((a,b) => (b.price - a.price));
     //console.log(this.name + ' found ' + orders.length + ' potential buyers for ' + mineral);
     //console.log('highest price ' + orders[0].price);
     const amountToSell = Math.min(amount,orders[0].amount);
     try {
     if (orders[0].price > floor) {
         const cost = Game.market.calcTransactionCost(amountToSell,this.name,orders[0].roomName); // in energy
         const revenue = orders[0].price * orders[0].amount ; // in credits
         const EnergyExchangeRate = 1 // how many credits to buy 1 energy
         const costInCredits = cost * EnergyExchangeRate ;
         const profit = revenue - costInCredits ; 
         if (profit < 0) {
             return false;
            
        }
         else {
            if (this.terminal.store[RESOURCE_ENERGY] >= cost) {
                console.log(this.name + ' selling ' + amountToSell + ' to room ' + orders[0].roomName + ' at price ' + orders[0].price + ' with profit ' + profit);
                Game.market.deal(orders[0].id,amountToSell,this.name);
            }
            else {
                console.log(this.name + ' wants to sell minerals but doesn\'t have enough energy!');
                if (!this.hasCreepWithJob('refillTerminal')) {
                    console.log(this.name + 'wants to spawn a refillTerminal hauler');
                    this.refillTerminal('energy');
                }
            }
         }
     }
    }
    catch (err) {
        console.log(this.name + " error while selling: " + err);
    }
 }
 module.exports = {

    runMarket: function (room) {

        function getAveragePrice(mineralType,amountinTerminal,totalInTerminal) {
            //console.log('computing average price of ' + mineralType);
            const orders = Game.market.getAllOrders({resourceType: mineralType, type: ORDER_SELL});
            _.remove(orders, (o) => { return o.amount < 100});

            //console.log(room.name + ' has ' + amountinTerminal + ' units of ' + mineralType);           
            // pull out just the price
            const prices = orders.map(function (order) { return order.price}).sort((a,b) => (a - b));
            //console.log(room.name = " found " + prices.length + " prices for " + mineralType);
            //console.log(room.name + ' lowest price ' + prices[0] + ' highest price ' + prices[prices.length -1]);
            //console.log(JSON.stringify(prices,null,4));
            // this really shouldn't be inside this function

            if (amountinTerminal > 190000 || (totalInTerminal > 280000)) {
                //console.log(room.name + ' picking lowest price');                
                return prices[0];
            }
            if (amountinTerminal > 175000 || (totalInTerminal > 250000)) {
                const arrayThird = Math.round(prices.length /3);
                return prices[arrayThird];
            }
            else {
                const arrayMedian = Math.round(prices.length / 2);
                //console.log(room.name + ' picking median price of ' + prices[arrayMedian] + ' from index ' + arrayMedian);         
                return prices[Math.round(arrayMedian)];   
            }
        }

        /* update prices, extend orders if needed. works on room's primary mineral order. */
        function processOrder (order, room, averagePrice) {

            // set price, then extend order
            const floor = 0.08 ;
            const amountinTerminal = room.terminal.store[mineralType];
            
            //console.log('average price of ' + mineralType + ' is ' + averagePrice )

            var price = averagePrice < floor ? floor : averagePrice - 0.005 ;
            if (price != order.price) {
                console.log('price of ' + mineralType + 'setting to ' + price);
                if (Game.market.changeOrderPrice(order.id, price) != OK) {
                    console.log("error setting price in " + room.name);
                }
            }

            if (order.remainingAmount < 10000) {
                var amount = amountinTerminal < 60000 ? amountinTerminal - 10000 : 50000 ;
                if (amount > 0) {
                    console.log(room.name + " wants to extend order by " + amount );
                    Game.market.extendOrder(order.id, amount);
                }
            }
        }

        function pruneOrders (orders, mineralType) {
            orders.forEach(function (order) {
                if(order.resourceType != mineralType) {
                    console.log('Pruning order ' + order.id + 'because its ' + order.resourceType + ' not ' + mineralType);
                    Game.market.cancelOrder(order.id);
                }
            })
            orders = _.filter(Game.market.orders, {roomName: room.name, type: ORDER_SELL});
            if (orders.length > 1) {
                console.log('still need to prune orders in ' + room.name);
                orders.forEach(function (o,i,ordersarr) {
                    if (i < ordersarr.length - 1) {
                        console.log('deleting ' + o.id);
                        Game.market.cancelOrder(o.id);
                    }
                })
            }
        }

        // main loop

        const mineralType = room.minerals[0].mineralType;
        const dontSell = [ 'X', 'L' ];
        if (dontSell.includes[mineralType]) {
            return;
        }
        
        const amountinTerminal = room.terminal.store[mineralType]; 
        const totalInTerminal = _.sum(room.terminal.store);
        const averagePrice = getAveragePrice(mineralType,amountinTerminal,totalInTerminal);
        
        var roomOrders = _.filter(Game.market.orders, {roomName: room.name, type: ORDER_SELL});

        // if there are no existing orders for the primary mineral, create one
        const roomOrder = _.remove(roomOrders, {resourceType: mineralType})[0];
        if (!roomOrder) {
            Game.market.createOrder(ORDER_SELL, mineralType, averagePrice, 1 ,room.name);
        }

        switch (roomOrders.length) {
            // if there's one or two, try to sell
            case 0:
            case 1:
            case 2:
                //console.log('doing orders in ' + room.name);
                if ((amountinTerminal > 198000) || (totalInTerminal > 295000)) {
                    // desparate at this point, sell for whatever people are buying for
                    console.log(room.name + ' is almost full of ' + mineralType + ', selling cheap!');
                    if (room.sellToHighestBidder(mineralType,10000,0.01)) {
                        break;
                    }
                    else {
                        Game.notify(room.name + " junking " + mineralType);
                        if (room.junkyard) {
                            room.addToCreepBuildQueue('contracthauler',{resource:mineralType,total:10000,pullTarget:room.terminal.id,dropTarget:'junkyard',job:'junkHaul'});
                        }
                    }
                }
                room.sellToHighestBidder(mineralType,10000,roomOrder.price);
                processOrder(roomOrder, room, averagePrice);
                break;
            default:
                //console.log(room.name + " needs to clean up orders");
                //pruneOrders(roomOrders, mineralType);
        }

        const basicMinerals = [ 'U', 'Z', 'K', 'O', 'H', 'X', 'L'];

        basicMinerals.forEach(function (mineral) {
            if (mineral == mineralType || (room.memory.minType != 'generic' || room.memory.minType != 'boosttest')) {
                return;
            }
            else {
                if (room.terminal.store[mineral] > 1000 ) {
                    console.log('I be sending ' + room.terminal.store[mineral] + ' ' + mineral + ' from room ' + room.name);
                    room.terminal.send(mineral,room.terminal.store[mineral],room.findNearestRoomSelling(mineral).name);
                }
            }
        });
        //console.log(room.name + "has " + orders.length +  " orders ");
        //console.log(room.name + ' running market handler');

    }
};