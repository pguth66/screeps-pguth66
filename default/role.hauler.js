/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.hauler');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // find containers with energy, bring them to fill spawns and extensions
        
        if((creep.memory.hauling) && creep.carry.energy == 0) {
            creep.memory.hauling = false;
            creep.say("Harvest");
        }
        if (!creep.memory.hauling && creep.carry.energy == creep.carryCapacity) {
            creep.memory.hauling = true;
            creep.say("Haul");
        }
        if(creep.memory.hauling) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || 
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER) && 
                                structure.energy < structure.energyCapacity;
                    }
            });
            if(targets.length > 0) {
                const target = creep.pos.findClosestByPath(targets);
                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else {
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => { 
                        return  (structure.structureType == STRUCTURE_STORAGE ||
                                structure.structureType == STRUCTURE_CONTAINER) &&
                                (structure.store[RESOURCE_ENERGY] < (structure.storeCapacity /4)) ; }
                });
                if (targets.length > 0) {
                    const target = creep.pos.findClosestByPath(targets);
                    if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {}});
                    }
                }
                else {
                    creep.moveTo(25,12);
                }
            }
        }

        if(!creep.memory.hauling) {
            var sources = creep.room.find(FIND_STRUCTURES, {
                 filter: (structure) => {
                        return (((structure.structureType == STRUCTURE_CONTAINER) || 
                        (structure.structureType == STRUCTURE_STORAGE)) 
                        && (structure.store[RESOURCE_ENERGY] > (structure.storeCapacity / 3)));
 //                       && (structure.store[RESOURCE_ENERGY] > 2000));
                    }
                });
                const source=creep.pos.findClosestByPath(sources);
                if(creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                   creep.moveTo(source, {visualizePathStyle: {}});
                }
            }
    

    }
};