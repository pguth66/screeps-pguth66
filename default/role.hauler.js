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
        
        if((creep.memory.hauling) && _.sum(creep.carry) == 0) {
            creep.memory.hauling = false;
            creep.say("Harvest");
        }
        if (!creep.memory.hauling && _.sum(creep.carry) == creep.carryCapacity) {
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
            var target ;
            var targetSpawns = _.remove(targets, function(o) { return o.structureType == STRUCTURE_SPAWN; });
            
            if(targetSpawns.length > 0) {
                target = creep.pos.findClosestByPath(targetSpawns);
            }
            else {
                if(targets.length > 0) {
                    target = creep.pos.findClosestByPath(targets);
                }
            }
            if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            
            else {
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => { 
                        return  (structure.structureType == STRUCTURE_STORAGE ||
                                structure.structureType == STRUCTURE_CONTAINER) &&
                                (structure.store[RESOURCE_ENERGY] < (structure.storeCapacity / 3)) ; }
                });
                if (targets.length > 0) {
                    const target = creep.pos.findClosestByPath(targets);
                    if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {}});
                    }
                   else {
                    for(const resourceType in creep.carry) {
                        if (creep.carry.resourceType > 0) {
                            creep.transfer(target, resourceType);
                        }
                    }   
                }

                }
                else {
                    creep.moveTo(30,23);
                }
            }
        }

        if(!creep.memory.hauling) {
            var sources = creep.room.find(FIND_DROPPED_RESOURCES);
            if(sources.length == 0) {
                sources = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (((structure.structureType == STRUCTURE_CONTAINER) || 
                            (structure.structureType == STRUCTURE_STORAGE)) 
                            && (structure.store[RESOURCE_ENERGY] > (structure.storeCapacity / 2)));
 //                           && (structure.store[RESOURCE_ENERGY] > 1800));
                     }
                });
           }
                const source=creep.pos.findClosestByPath(sources);
                if(creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                   creep.moveTo(source, {visualizePathStyle: {}});
                }
                else {
                    if(creep.pickup(source) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(source, {visualizePathStyle: {}});
                    }
                }
            }
    

    }
};