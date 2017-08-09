/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.healer');
 * mod.thing == 'a thing'; // true
 */
roleUpgrader = require('role.upgrader');

var roleHealer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if(creep.memory.healing && creep.carry.energy == 0) {
            creep.memory.healing = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.healing && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.healing = true;
	        creep.say('🚧 heal');
	    }
	    if (!creep.memory.healing) {
            var sources = creep.room.find(FIND_MY_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || 
                                 structure.structureType == STRUCTURE_CONTAINER)  && structure.energy > 0;
                    }
            });
            const source = creep.pos.findClosestByPath(sources);
            if(creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
	    }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_ROAD || 
                                 structure.structureType == STRUCTURE_WALL ||
                                 structure.structureType == STRUCTURE_RAMPART || 
                                  structure.structureType == STRUCTURE_TOWER) && 
                                  structure.hits < structure.hitsMax &&
                                  structure.hits < 100000 ;
                    }
            });
            if(targets.length > 0) {
                const target = creep.pos.findClosestByPath(targets);
                if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
                else {
                    creep.say("H " + target.id);
                }
            }
            else {
                roleUpgrader.run(creep);
            }
        }
	}
};

module.exports = roleHealer;