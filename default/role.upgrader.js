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
	    }

	    if(creep.memory.upgrading) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        else 
        {
			var source;
			var sources = creep.room.find(FIND_STRUCTURES, {
                 filter: (structure) => {
						return ((structure.structureType == STRUCTURE_CONTAINER ||
								structure.structureType == STRUCTURE_STORAGE) 
								&& structure.store[RESOURCE_ENERGY] > 0);
                    }
				});
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