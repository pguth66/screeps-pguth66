/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.heisenberg');
 * mod.thing == 'a thing'; // true
 */
var roleContractHauler = require('role.contracthauler');
var roleHauler = require('role.hauler');
const HaulTask = require('class.haultask');

module.exports = {

    run: function(creep) {

        function pullHaulTaskFromQueue (room) {
            try {
                if (room.memory.labQueue[0]) {
                    creep.creepLog('found a task!');
                    haulTask = room.memory.labQueue.shift();
                    return haulTask;
                }
                return;
            }
            catch (err) {
                console.log(err + ' while pulling haulTask in ' + creep.room.name);
            }
        }
        // is always going to be bringing to a lab
        // but might be bringing energy or minerals
        // have to drop off any excess minerals if we're done
        if (!creep.memory.destination) {
            if (_.sum(creep.carry) > 0) {
                creep.memory.hauling=true;
                roleHauler.run(creep);
            }
            const task = pullHaulTaskFromQueue(creep.room);
            //console.log(JSON.stringify(task));
            if (task) {
                creep.memory.destination = task.lab.id;
                creep.memory.resource = task.resource;
                creep.memory.targetAmount = 3000 - task.lab.mineralAmount;

                creep.memory.dropTarget = creep.memory.destination;
                creep.memory.pullTarget = creep.room.terminal.id;
            }
            else {
                return;
            }
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