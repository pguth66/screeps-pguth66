roleHealer = require('role.healer');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

		function hasEnergy(structure) {
        var b = false;

        switch (structure.structureType) {
            case STRUCTURE_CONTAINER:
                if (structure.store[RESOURCE_ENERGY] > 0) {
                    b = true;
                };
                break;
            case STRUCTURE_EXTENSION:
            case STRUCTURE_SPAWN:
            case STRUCTURE_TOWER:
                if (structure.energy > 0) {
                    b = true;
                }
        }
        return true;
		}
	
	    if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	        creep.say('🚧 build');
	    }

	    if(creep.memory.building) {
			var targets = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
	        if (targets.length == 0) {
				Memory.noBuild = true;
				roleUpgrader.run(creep);
//	            creep.moveTo(29,17);
	        }
	        else {
				target = creep.pos.findClosestByPath(targets);
				if(!target) {
					target = creep.pos.findClosestByRange(targets);
				}
				// console.log("found target " + target + "for creep " + creep.name);
				switch(creep.build(target)) {
					case ERR_NOT_IN_RANGE:
						creep.moveTo(target);
						break;
					case OK:
						// creep.say("Building");
						break;
					case ERR_INVALID_TARGET:
						console.log("Invalid target " + target.id);
						break;
				default: 
					console.log(creep.name + ": Error while trying to build " + target.id);
	      		}
	        }
        }
	    else {
	         var sources = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return ((structure.structureType == STRUCTURE_CONTAINER)  && (structure.store[RESOURCE_ENERGY] > structure.storeCapacity / 2));
                    }
			});
				// pull from a SOURCE if no extensions/containers with energy found
				// OR if total room energy is less than 450 (minimum to spawn a harvester)
            if ((sources.length == 0)) {
                var sources = creep.room.find(FIND_SOURCES_ACTIVE);
                const source = creep.pos.findClosestByPath(sources);
                if (creep.harvest(source) == ERR_NOT_IN_RANGE ) {
                    creep.moveTo(source);
                }
            }
            else {
    	        source = creep.pos.findClosestByPath(sources);
    	        switch(creep.withdraw(source, RESOURCE_ENERGY)) {
    	            case ERR_NOT_IN_RANGE:
    	                creep.moveTo(source);
    	                break;
    	           case 0:
    	               break;
    	           case ERR_INVALID_TARGET:
    	               console.log(creep.name +": source " + source.id + " is invalid target");
    	               break;
    	            default:
    	                console.log(creep.name + ":Error while trying to withdraw from " + source.id);
    	                break;
    	        }
/*                if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                } */
            }
	    }
	}
};

module.exports = roleBuilder;