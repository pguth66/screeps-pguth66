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
            const adjacentSource = creep.pos.findInRange(FIND_SOURCES, 1)[0];
			if (adjacentSource) {
				creep.flee(adjacentSource);
			}
	        creep.say('🚧 heal');
	    }
	    if (!creep.memory.healing) {
            try {
            // healers should pull from any container regardless of SOURCE/SINK since walls may be 
            // anywhere on the map
            var sources = _.filter(creep.room.containers, (c) => { return c.store[RESOURCE_ENERGY] > 200});

            creep.room.links.forEach(function(link) {
				if(link.energy > 0) {
					sources.push(link);
				}
			})
			//console.log(creep.name + ': sources ' + sources.length);
			if (sources.length == 0) {
			    // creep.say('source harvest');
                sources = creep.room.sources;
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
            catch (err) {
                creep.creepLog(err);
            }
        }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_ROAD || 
                                 (structure.structureType == STRUCTURE_WALL && structure.hits < creep.room.memory.wallLevel) ||
                                 (structure.structureType == STRUCTURE_RAMPART  && structure.hits < (creep.room.memory.wallLevel - 2000)) || 
                                 structure.structureType == STRUCTURE_CONTAINER ||
                                  structure.structureType == STRUCTURE_TOWER) && 
                                  structure.hits < structure.hitsMax ;
                    }
            });
            // prioritize containers < 50%
            const priorityTargets = _.remove(targets, function(t) { 
                return t.structureType == STRUCTURE_CONTAINER && (t.hits < (t.hitsMax / 1.25));
            })

            var priorityWalls = _.remove(targets, (function (t) {
                return (( t.structureType == STRUCTURE_WALL || t.structureType == STRUCTURE_RAMPART ) && t.hits < (0.5 * creep.room.memory.wallLevel));
            }))

            const dismantleFlags = creep.room.find(FIND_FLAGS, { filter: { color: COLOR_RED } });
            if (dismantleFlags.length > 0) {
                dismantleFlags.forEach(function(flag) {
                    const dismantleStructures = flag.pos.lookFor(LOOK_STRUCTURES);
                    dismantleStructures.forEach(function(s) {
                        _.pull(targets,s);
                        //creep.creepLog('pulling from heal targets: ' + s);
                    })
                })
               // const dontHeal = _.pullAll(targets, dismantleFlags);
                //creep.creepLog('pulled ' + dontHeal.length + ' dismantle targets');
            }
//            const dontHeal = _.remove(targets, dismantleTarget);
            
            //console.log(creep.name + ' has ' + targets.length + ' heal targets')
            if (priorityWalls.length > 0) {
                const target = creep.pos.findClosestByPath(priorityWalls);
                if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
                return;
            }
            if (priorityTargets.length > 0) {
                const target = creep.pos.findClosestByPath(priorityTargets);
                creep.say('Priority');
                if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
                //creep.creepLog(' going to priority target ' + target.id);
            } else {
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
	}
};

module.exports = roleHealer;