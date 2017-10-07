/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.scavenger');
 * mod.thing == 'a thing'; // true
 */
var roleHauler = require('role.hauler');

var roleScavenger = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // creep should have targetRoom and baseRoom properties
        // go to targetRoom
        // find all structures with resources
        // scavenge the resources
        // go to baseRoom
        // drop off the resources (be a hauler)
        // start over

        if(!creep.memory.hauling) {            
            if (creep.room.name != creep.memory.workRoom) {
                creep.moveToRoom(creep.memory.workRoom);
            }
            else {
                targets = creep.room.find(FIND_STRUCTURES, {filter: (s) => 
                    { return (((s.structureType == STRUCTURE_EXTENSION ||
                        s.structureType == STRUCTURE_TOWER ||                        
                        s.structureType == STRUCTURE_SPAWN) &&
                        s.energy > 0) ||
                        (s.structureType == STRUCTURE_STORAGE ||
                        s.structureType == STRUCTURE_CONTAINER ||
                        s.structureType == STRUCTURE_TERMINAL) &&
                        s.store[RESOURCE_ENERGY] > 0) }});
                if(targets.length > 0) {
                    target = creep.pos.findClosestByPath(targets);
                    creep.memory.target=target;
                    creep.getResources(target);
                    if (_.sum(creep.carry) == creep.carryCapacity) {
                        creep.memory.target = null;
                        creep.say('Haul');
                        creep.memory.hauling = true;
                    }
                } else {
                    if(_.sum(creep.carry) > 0) {
                        creep.memory.target = null ;
                        creep.memory.hauling = true ;
                        creep.say('Haul');
                    }
                    else {
                        creep.memory.role='recycle';
                    }
                }
            }
        }

        if(creep.memory.hauling) {
            if (creep.room.name != creep.memory.baseRoom) {
                creep.moveToRoom(creep.memory.baseRoom);
            }
            else {
                roleHauler.run(creep);
            }
        }
    }
};

module.exports = roleScavenger ;