var roleHarvester = {
    // returns true if structure has energy otherwise false


    /** @param {Creep} creep **/
    run: function(creep) {

        function isFull(structure) {
        var b = false;

        switch (structure.structureType) {
            case STRUCTURE_CONTAINER:
                if (structure.store[RESOURCE_ENERGY] == structure.storeCapacity) {
                    b = true;
                };
                break;
            case STRUCTURE_EXTENSION:
            case STRUCTURE_SPAWN:
            case STRUCTURE_TOWER:
                if (structure.energy == structure.energyCapacity) {
                    b = true;
                }
        }
        return b;
        }

        if(creep.memory.depositing && creep.carry.energy == 0) {
            creep.memory.depositing = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.depositing && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.depositing = true;
	        creep.say('🚧 deposit');
	    }
        if(!creep.memory.depositing) {
            // we're harvesting, so find sources 
            var sources = creep.room.find(FIND_SOURCES);
            const source=creep.pos.findClosestByPath(sources);
            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        else {
            // we have energy and need to deposit it
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || 
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_CONTAINER ||
                                structure.structureType == STRUCTURE_TOWER) && !isFull(structure);
                    }
            });
            if(targets.length > 0) {
                const target = creep.pos.findClosestByPath(targets);
                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else {
                creep.moveTo(25,12);
            }
        }
	}
};

module.exports = roleHarvester;