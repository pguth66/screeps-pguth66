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
        var dt = null;
        // need this special case to handle junkyards, which don't have ids to store in memory
        // because they are just created with "new RoomObject"
        switch (creep.memory.dropTarget) {
            case 'junkyard': 
                dt = creep.room.junkyard;
                break;
            default:
                dt = Game.getObjectById(creep.memory.dropTarget);
        }

        const resourceType = creep.memory.resource;

        if (typeof creep.memory.total !== 'undefined') {
            if (creep.memory.processed >= creep.memory.total) {
                creep.memory.role='recycle';
                return;
            }
        }
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
                            creep.withdraw(pt, resourceType, pt.store[resourceType])
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
                    }
                }
                else {
                    creep.moveTo(pt);
                }
                if (creep.memory.dropTarget == 'junkyard') {
                    if (creep.memory.processed >= creep.memory.total) {
                        creep.memory.role='recycle';
                    }
                }
                else {
                    switch (dt.structureType) {
                        case STRUCTURE_NUKER:
                            if (resourceType == RESOURCE_ENERGY && dt.energy >= creep.memory.upTo) {
                                creep.memory.role='pause';
                            }
                            else {
                                if (resourceType == RESOURCE_GHODIUM && dt.ghodium >= creep.memory.upTo) {
                                    creep.memory.role='pause'
                                }
                            }
                            break;
                        case STRUCTURE_LAB:
                            if (resourceType == RESOURCE_ENERGY) {
                                if (dt.store[RESOURCE_ENERGY] >= creep.memory.upTo) {
                                    creep.memory.role='pause';
                                }
                            }
                            else {
                                if (dt.store[dt.mineralType] >= creep.memory.upTo) {
                                    creep.memory.role='recycle'
                                }
                            }
                            break;
                        case STRUCTURE_POWER_SPAWN:
                            if (resourceType == RESOURCE_POWER && dt.power >= creep.memory.upTo) {
                                creep.memory.role='pause';
                            }
                            else {
                                if (resourceType == RESOURCE_ENERGY && dt.energy >= creep.memory.upTo) {
                                    creep.memory.role='pause';
                                }
                            }
                            break;
                        default:
                            if ((dt.store[resourceType] >= creep.memory.upTo) || 
                                (creep.memory.processed >= creep.memory.total)) {
                                creep.memory.role='pause';
                                creep.memory.respawn=false;
                            }
                            break;
                    }
                }
            } else {
                // not hauling
                const r = creep.carry[resourceType];
                if (creep.memory.dropTarget == 'junkyard' && creep.room.junkyard) {
                    if (creep.pos.isEqualTo(dt.pos)) {
                        creep.say("DROP");
                        creep.drop(resourceType);
                        creep.memory.processed += r;
                        creep.memory.hauling = false;
                    } else {
                        creep.moveTo(dt);
                    }
                }
                else {
                    switch (creep.transfer(dt, resourceType)) {
                        case OK:
                            creep.say('Deposit');   
                            creep.memory.processed += r;
                            creep.memory.hauling = false;                        
                            break;
                        case ERR_NOT_IN_RANGE:
                            creep.moveTo(dt);
                            break;
                        case ERR_NOT_ENOUGH_RESOURCES:
                            creep.creepLog('not enough ' + resourceType + ' to transfer to dropTarget');
                            creep.memory.hauling = false;
                            break;
                        default:
                            creep.creepLog('error transferring ' + resourceType + ' to dropTarget ' + dt.id);
                    }
                }
            }
        }
        catch(err) {
            creep.creepLog(err + " while contract hauling");
        }
    }
};