var roleHarvester = {
    // returns true if structure has energy otherwise false


    /** @param {Creep} creep **/
    run: function(creep) {

        function isFull(structure) {
          var b = false;

            switch (structure.structureType) {
                case STRUCTURE_CONTAINER:
                case STRUCTURE_STORAGE:
                    if (_.sum(structure.store) == structure.storeCapacity) {
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
            if(creep.carry.energy > 0) {
                creep.memory.depositing = true;
                creep.say('🚧 deposit');
            }
        }

        if(!creep.memory.depositing) {
            // we're harvesting, so find sources 
            if(creep.memory.target != null) {
                try {
                    target = Game.getObjectById(creep.memory.target);
                    if(creep.pos.inRangeTo(target,1)) {
                        creep.harvest(target);  
    //                    creep.memory.target = null;
                    }
                    else {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
                catch(err) {
                    console.log(creep.name + ": " + err);
                }
            }   
            else {
                var sources = creep.room.find(FIND_SOURCES);
                sourceToTarget = sources[0];
                var harvsOnSource = [] ;
                try{ 
                for(i=0; i < sources.length ; i++) {
               
                    harvsOnSource[i] = _.filter(Game.creeps, function(c) { return (c.memory.role == 'harvester' && c.memory.target == sources[i].id)}).length
                    if (sources[i].id == '5982fcceb097071b4adbe20c') {
                    // console.log('found '+ harvsOnSource[i] + 'creeps on source index ' + i);
                    }
                }
                sourceToTarget = sources[_.indexOf(harvsOnSource, _.min(harvsOnSource))] ;
                console.log('Harvester ' + creep.name + ' targeting source ' + sourceToTarget);
                creep.memory.target = sourceToTarget.id;
            }
            catch(err) {
                console.log(creep.name + ": " + err);
            }
            
                const source=creep.pos.findClosestByPath(sources);
                if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    // deposit right away before trekking to another source
                    if(creep.carry.energy > 0) {
                        creep.memory.depositing=true;
                    }
                    else {
                        creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                    }
                }
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
                creep.moveTo(creep.room.find(FIND_MY_SPAWNS)[0]);
            }
        }
	}
};

module.exports = roleHarvester;