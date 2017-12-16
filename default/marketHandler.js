/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('marketHandler');
 * mod.thing == 'a thing'; // true
 */

module.exports = {

    runMarket: function (room) {

        function processOrder (order, room) {

            const mineralType = room.minerals.mineralType;
            // set price, then extend order

            if (order.remainingAmount < 10000) {
                const amountinTerminal = room.terminal.store[mineralType];
                var amount = amountinTerminal < 60000 ? amountinTerminal - 10000 : 50000 ;
                console.log(room.name + " wants to extend order by " + amount );
                Game.market.extendOrder(order.id, amount);
            }
        }
        var orders = _.filter(Game.market.orders, {roomName: room.name});
        switch (orders.length) {
            case 0:
                return;
                break;
            case 1:
                console.log('doing orders in ' + room.name);
                const order = orders[0];
                processOrder(order, room);
                break;
            default:
                console.log(room.name + " needs to clean up orders");
        }
        //console.log(room.name + "has " + orders.length +  " orders ");
        //console.log(room.name + ' running market handler');
    }
};