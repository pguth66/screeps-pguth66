/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.healer');
 * mod.thing == 'a thing'; // true
 */
var roleBuilder = require('role.builder');

var roleHealer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        var roomMap = Memory.roomMaps[creep.room.name];
        
        if(creep.memory.healing && creep.carry.energy == 0) {
            if(creep.ticksToLive < 100) {
                creep.say('Goodbye');
                creep.memory.role='recycle';
            }
            else {
                creep.memory.healing = false;
                creep.say('🔄 harvest');                    
            }
	    }
	    if(!creep.memory.healing && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.healing = true;
	        creep.say('🚧 heal');
	    }
	    if (!creep.memory.healing) {
            // healers should pull from any container regardless of SOURCE/SINK since walls may be 
            // anywhere on the map
            var sources = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER)  && structure.store[RESOURCE_ENERGY] > 200;
                    }
            });
            for(l in roomMap.links) {
				link = Game.getObjectById(roomMap.links[l].id);
				link.role = roomMap.links[l].role ;
				if(link.energy > 0) {
					sources.push(link);
				}
			}
			//console.log(creep.name + ': sources ' + sources.length);
			if (sources.length == 0) {
			    // creep.say('source harvest');
                sources = creep.room.find(FIND_SOURCES_ACTIVE);
                const source = creep.pos.findClosestByPath(sources);
                if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathSytle: {}});
                }
			}
			else {
                const source = creep.pos.findClosestByPath(sources);
                if(creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
			}
	    }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_ROAD || 
                                 (structure.structureType == STRUCTURE_WALL && structure.hits < ((creep.room.controller.level * creep.room.controller.level) * 6000)) ||
                                 (structure.structureType == STRUCTURE_RAMPART  && structure.hits < ((creep.room.controller.level * creep.room.controller.level) * 6000)) || 
                                 structure.structureType == STRUCTURE_CONTAINER ||
                                  structure.structureType == STRUCTURE_TOWER) && 
                                  structure.hits < structure.hitsMax ;
                    }
            });
            const dontHeal = _.remove(targets, { id: '59a0604216e4711f10d03fb3'});
            //console.log(creep.name + ' has ' + targets.length + ' heal targets')

            if(targets.length > 0) {
                const target = creep.pos.findClosestByPath(targets);
                if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else {
                roleBuilder.run(creep);
            }
        }
	}
};

module.exports = roleHealer;