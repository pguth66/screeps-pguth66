var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.upgrading = true;
			creep.say('⚡ upgrade');
			const adjacentSource = creep.pos.findInRange(FIND_SOURCES, 1)[0];
			if (adjacentSource) {
				creep.flee(adjacentSource);
			}
	    }

	    if(creep.memory.upgrading) {
			switch(creep.upgradeController(creep.room.controller)) {
				case ERR_NOT_IN_RANGE: 
					creep.moveTo(creep.room.controller, {visualizePathStyle: {}});
					break;
				case OK:
					break;
				default: 
					creep.creepLog('error trying to upgrade controller');
            }
        }
        else 
        {
			var source;
			var containers = _.filter(creep.room.containers, (c) => { return c.store[RESOURCE_ENERGY] > 0});
			const links = creep.room.find(FIND_STRUCTURES, {
				filter: (structure) => { return (structure.structureType == STRUCTURE_LINK &&
				structure.energy > 0)}
			});
			
			var sources = containers.concat(links);
			//creep.creepLog('found ' + sources.length + ' containers and links to pull from');
			if(sources.length == 0 && (creep.room.energyAvailable === creep.room.energyCapacityAvailable)) {
				sources = creep.room.find(FIND_MY_STRUCTURES, {
					filter: (structure) => {
						return (((structure.structureType == STRUCTURE_SPAWN ||
							structure.structureType == STRUCTURE_EXTENSION) &&
							structure.energy == structure.energyCapacity)	||						
							(structure.structureType == STRUCTURE_LINK && structure.energy > 0))
					}
				});
			}
			if(sources.length == 0) {
				sources = creep.room.find(FIND_SOURCES_ACTIVE);
				source = creep.pos.findClosestByPath(sources);
           		if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
					creep.moveTo(source, {visualizePathStyle: {}});
				}
			}
			else {
				source = creep.pos.findClosestByPath(sources);
	        
           		if(creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					creep.moveTo(source, {visualizePathStyle: {}});
				}
            }
	    }
	}
};

module.exports = roleUpgrader;