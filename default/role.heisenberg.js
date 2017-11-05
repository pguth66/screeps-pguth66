/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.heisenberg');
 * mod.thing == 'a thing'; // true
 */
var roleContractHauler = require('role.contracthauler');

module.exports = {

    run: function(creep) {

        // is always going to be bringing to a lab
        // but might be bringing energy or minerals
        if (!creep.memory.destination) {
            //new HaulTask(RESOURCE_ENERGY, '59d31c27299d5e073fc87275', 1000);
            creep.memory.destination = '59d2d4844fc7a444cccf0f68';
            creep.memory.resource = RESOURCE_UTRIUM;
            creep.memory.targetAmount = 3000;

            creep.memory.dropTarget = creep.memory.destination;
            creep.memory.pullTarget = creep.room.storage.id;
        }
        else {
            // if target has reached targetAmount, do a new task
            const dt = Game.getObjectById(creep.memory.dropTarget);
            if (creep.memory.resource == RESOURCE_ENERGY) {
                if (dt.energy >= creep.memory.targetAmount) {
                    creep.creepLog('target full');
                    creep.memory.destination = null ;
                    creep.memory.resource = null ;
                    creep.memory.targetAmount = null ;
                    creep.memory.dropTarget = null;
                    creep.memory.pullTarget = null;
                    return ;
                }
            }
            else {
                if (dt.mineralAmount >= creep.memory.targetAmount) {
                    creep.creepLog('target full');                    
                    creep.memory.destination = null ;
                    creep.memory.resource = null ;
                    creep.memory.targetAmount = null ;
                    creep.memory.dropTarget = null;
                    creep.memory.pullTarget = null;
                    return ;
                }
            }
            roleContractHauler.run(creep);
        }
    }

};