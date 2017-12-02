/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.interhauler');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    /** @param {Creep} creep **/
    run: function(creep) {

        // expects pullTarget and dropTarget
        // resource to haul is kept creep.memory.resource
        // if not hauling, go to pullTarget, load up on energy, switch to hauling
        // if hauling, go to dropTarget, drop it off, switch off hauling
        // will stop when target reaches upTo
        // shoudl we add a counter so that it will move X resources and then be done?
        // call it stopAfter - when you deposit, increment counter by your carry

        const pt = Game.getObjectById(creep.memory.pullTarget);
        const dt = Game.getObjectById(creep.memory.dropTarget);
        const resourceType = creep.memory.resource;

        try{
            if(!creep.memory.hauling) {
                if (creep.pos.inRangeTo(pt,1)) {
                    creep.say('Withdraw');
                    switch (creep.withdraw(pt, resourceType, creep.carryCapacity)) {
                        case OK:
                        case ERR_FULL:
                            creep.memory.hauling = true;                        
                            break;
                        case ERR_NOT_ENOUGH_RESOURCES:
                            creep.creepLog('not enough ' + resourceType + ' to withdraw');
                            break;
                        case ERR_INVALID_TARGET:
                            creep.creepLog('invalid target withdrawing ' + resourceType);
                            break;
                        case ERR_INVALID_ARGS:
                            creep.creepLog('invalid args withdrawing ' + resourceType + ': ' + pt + ' ' + resourceType);
                            break;
                        default:
                            creep.creepLog('error withdrawing ' + resourceType);
                            break;
                    }
                }
                else {
                    creep.moveTo(pt);
                }
            }

            if (creep.memory.hauling) {
                if (creep.pos.inRangeTo(dt,1)) {
                    creep.say('Deposit');
                    switch (creep.transfer(dt, resourceType)) {
                        case OK:
                            break;
                        default:
                            creep.creepLog('error transferring ' + resourceType + ' to dropTarget');
                            break;
                    }
                    switch (dt.structureType) {
                        case STRUCTURE_NUKER:
                        case STRUCTURE_LAB:
                            if (resourceType == RESOURCE_ENERGY) {
                                if (dt.energy >= creep.memory.upTo) {
                                    creep.memory.role='pause';
                                }
                            }
                            else {
                                if (dt.mineralAmount >= creep.memory.upTo) {
                                    creep.memory.role='pause;'
                                }
                            }
                            break;
                        default:
                            if (dt.store[resourceType] >= creep.memory.upTo) {
                            creep.memory.role='pause';
                            }
                            break;
                    }
                    creep.memory.hauling = false;                        
                }
                else {
                    //creep.say('Moving');
                    creep.moveTo(dt);
                }
            }
        }
        catch(err) {
            creep.creepLog(err + " while contract hauling");
        }
    }
};