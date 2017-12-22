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

 module.exports = {

    runMarket: function (room) {

        function getAveragePrice(mineralType) {
            //console.log('computing average price of ' + mineralType);
            const orders = Game.market.getAllOrders({resourceType: mineralType});
            const amountinTerminal = room.terminal.store[mineralType];            
            // pull out just the price
            const prices = orders.map(function (order) { return order.price}).sort();
            //console.log(JSON.stringify(prices,null,4));
            // for now just pick the median, need to make this more sophisticated
            if (amountinTerminal < 190000) {
                return prices[Math.round(prices.length / 2)];
            }
            else {
                return prices[0];
            }
        }

        function processOrder (order, room) {

            // set price, then extend order

            const floor = 0.1 ;

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
        const mineralType = room.minerals[0].mineralType;
        
        var orders = _.filter(Game.market.orders, {roomName: room.name, type: ORDER_SELL});
        switch (orders.length) {
            case 0:
                Game.market.createOrder(ORDER_SELL, mineralType, getAveragePrice(mineralType),1,room.name);
                break;
            case 1:
                //console.log('doing orders in ' + room.name);
                const order = orders[0];
                processOrder(order, room);
                break;
            default:
                //console.log(room.name + " needs to clean up orders");
                pruneOrders(orders, mineralType);
        }
        //console.log(room.name + "has " + orders.length +  " orders ");
        //console.log(room.name + ' running market handler');
    }
};