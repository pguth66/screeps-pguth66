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
                creep.memory.priorityTarget = null;
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
            // creep is healing
            var target ;
            var hasTarget = false ;
            // if creep already has a priority target, keep healing it unless it's full
            if (creep.memory.priorityTarget) {
                const pt = Game.getObjectById(creep.memory.priorityTarget);
                if (typeof pt === 'undefined') {
                    creep.memory.priorityTarget = null;
                } else {
                    switch (pt.structureType) {
                        case STRUCTURE_CONTAINER:
                            if (pt.hits < (pt.hitsMax / 1.25)) {
                                target = pt;
                                hasTarget = true;
                            }
                            break;
                        case STRUCTURE_RAMPART:
                        case STRUCTURE_WALL:
                            if (pt.hits < creep.room.memory.wallLevel) {
                                target = pt;
                                hasTarget = true;
                            }
                        default:
                            break;
                    }
                }
            }
            if (!hasTarget) {
                // target selection
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
                const priorityContainers = _.remove(targets, function(t) { 
                    return t.structureType == STRUCTURE_CONTAINER && (t.hits < (t.hitsMax / 1.25));
                })

                const priorityWalls = _.remove(targets, (function (t) {
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
                }            
                //console.log(creep.name + ' has ' + targets.length + ' heal targets')

                const priorityTargets = priorityWalls.concat(priorityContainers);
                
                if (priorityTargets.length > 0) {
                    target = creep.pos.findClosestByPath(priorityTargets, {ignoreCreeps:true});
                    creep.memory.priorityTarget = target.id;
                    creep.say('Priority');
                } else {
                    if(targets.length > 0) {
                        target = creep.pos.findClosestByPath(targets);
                    }
                    else {
                        roleBuilder.run(creep);
                    }
                }
            // end target selection
            }
            if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        // end healing
        }
	}
};

module.exports = roleHealer;