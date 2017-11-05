/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('labHandler');
 * mod.thing == 'a thing'; // true
 */

class HaulTask {
    constructor (resource, destination, targetAmount) {
        this.resource = resource;
        this.destination = destination;
        this.amount = amount;
    }
}

class LabGroup {
    constructor (reactant1, reactant2, product) {
        this.reactant1 = reactant1;
        this.reactant2 = reactant2;
        this.product = product;
    }
}

module.exports = {

    run: function(room) {
        if (room.name != 'W29N29') { return };

        if (!Memory.rooms[room.name].taskqueue) {
            Memory.rooms[room.name].taskqueue = [] ;
        }

        var taskQueue = [] ;
        reactant1id = '59d2d4844fc7a444cccf0f68';
        reactant2id = '59d31c27299d5e073fc87275';
        productid = '59d35ba22b0e1e176fa5ef10';
        const labGroup = new LabGroup (Game.getObjectById(reactant1id),Game.getObjectById(reactant2id),Game.getObjectById(productid));

        //console.log(labGroup.product.id);
        if (labGroup.product.cooldown == 0) {
            labGroup.product.runReaction(labGroup.reactant1,labGroup.reactant2);
        }

        //taskQueue[0] = new HaulTask(RESOURCE_ENERGY, '59d31c27299d5e073fc87275', 1000);
        //console.log('task queue has ' + taskQueue.length + ' items.');
    }
};