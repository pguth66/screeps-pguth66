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
     if (orders[0].price > floor) {
         const cost = Game.market.calcTransactionCost(amountToSell,this.name,orders[0].roomName);
         if (this.terminal.store[RESOURCE_ENERGY] >= cost) {
            console.log(this.name + ' selling ' + amountToSell + ' to room ' + orders[0].roomName);
            Game.market.deal(orders[0].id,amountToSell,this.name);
         }
         else {
             console.log(this.name + ' wants to sell minerals but doesn\'t have enough energy!');
         }
     }
 }
 module.exports = {

    runMarket: function (room) {

        function getAveragePrice(mineralType) {
            //console.log('computing average price of ' + mineralType);
            const orders = Game.market.getAllOrders({resourceType: mineralType, type: ORDER_SELL});
            _.remove(orders, (o) => { return o.amount < 100});
            const amountinTerminal = room.terminal.store[mineralType]; 
            //console.log(room.name + ' has ' + amountinTerminal + ' units of ' + mineralType);           
            // pull out just the price
            const prices = orders.map(function (order) { return order.price}).sort((a,b) => (a - b));
            //console.log(room.name = " found " + prices.length + " prices for " + mineralType);
            //console.log(room.name + ' lowest price ' + prices[0] + ' highest price ' + prices[prices.length -1]);
            //console.log(JSON.stringify(prices,null,4));
            // for now just pick the median, need to make this more sophisticated
            if (amountinTerminal > 190000) {
                //console.log(room.name + ' picking lowest price');                
                return prices[0];
            }
            if (amountinTerminal > 175000) {
                const arrayThird = Math.round(prices.length /3);
                return prices[arrayThird];
            }
            else {
                const arrayMedian = Math.round(prices.length / 2);
                //console.log(room.name + ' picking median price of ' + prices[arrayMedian] + ' from index ' + arrayMedian);         
                return prices[Math.round(arrayMedian)];   
            }
        }

        function processOrder (order, room) {

            // set price, then extend order

            const floor = 0.08 ;

            const averagePrice = getAveragePrice(mineralType);
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
        
        var orders = _.filter(Game.market.orders, {roomName: room.name, type: ORDER_SELL});
        switch (orders.length) {
            case 0:
                Game.market.createOrder(ORDER_SELL, mineralType, getAveragePrice(mineralType),1,room.name);
                break;
            case 1:
                //console.log('doing orders in ' + room.name);
                const order = orders[0];
                room.sellToHighestBidder(mineralType,10000,orders[0].price);
                processOrder(order, room);
                break;
            default:
                //console.log(room.name + " needs to clean up orders");
                //pruneOrders(orders, mineralType);
        }

        const basicMinerals = [ 'U', 'X', 'Z', 'L', 'K', 'O', 'H'];

        basicMinerals.forEach(function (mineral) {
            if (mineral == mineralType) {
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