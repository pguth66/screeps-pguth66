var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep) {

        function isFull(structure) {
          var b = false;

            switch (structure.structureType) {
                case STRUCTURE_CONTAINER:
                case STRUCTURE_STORAGE:
                case STRUCTURE_TERMINAL:
                    if (_.sum(structure.store) == structure.storeCapacity) {
                        b = true;
                };
                break;
                case STRUCTURE_EXTENSION:
                case STRUCTURE_SPAWN:
                case STRUCTURE_TOWER:
                    if (_.sum(structure.store) == structure.storeCapacity) {
                        b = true;
                    }
            }
            return b;
        }

        if(creep.memory.depositing && _.sum(creep.carry) == 0) {
            creep.memory.depositing = false;
            creep.say('🔄 mine');
	    }
	    if(!creep.memory.depositing && _.sum(creep.carry) == creep.carryCapacity) {
	        creep.memory.depositing = true;
	        creep.say('🚧 deposit');
	    }
        if(!creep.memory.depositing) {
            // we're harvesting, so find sources 
            var sources = creep.room.minerals;
            const source=creep.pos.findClosestByPath(sources);
//            console.log("found source" + source.id);
            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        else {
            // we have resources and need to deposit it
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return ((structure.structureType == STRUCTURE_CONTAINER ||
                                structure.structureType == STRUCTURE_STORAGE ||
                                structure.structureType == STRUCTURE_TERMINAL)
                                 && !isFull(structure));
                    }
            });
            if(targets.length > 0) {
                const target = creep.pos.findClosestByPath(targets);
                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
                else {
                    for(const resourceType in creep.carry) {
                        if (creep.carry[resourceType] > 0) {                            
                            creep.transfer(target, resourceType);
                        }
                    };
                }
            }
            else {
                creep.moveTo(creep.room.find(FIND_MY_SPAWNS[0]));
            }
        }
	}
};

module.exports = roleMiner;