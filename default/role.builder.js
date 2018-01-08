var roleUpgrader = require('role.upgrader');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

		if(creep.spawning) {
			return;
		}
		
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
			if(creep.ticksToLive < 100) {
                creep.say('Goodbye');
                creep.memory.role='recycle';
			}
			else {
				creep.memory.building = false;
				creep.say('🔄 harvest');
			}
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
			creep.say('🚧 build');
			const adjacentSource = creep.pos.findInRange(FIND_SOURCES, 1)[0];
			if (adjacentSource) {
				creep.flee(adjacentSource);
			}
	    }

	    if(creep.memory.building) {
			var targets = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
			var target = null;
	        if (targets.length == 0) {
				Memory.noBuild = true;
				roleUpgrader.run(creep);
//	            creep.moveTo(29,17);
	        }
	        else {
				//target = creep.pos.findClosestByPath(targets);
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
						creep.say("Invalid target");
						break;
				default: 
					console.log(creep.name + ": Error while trying to build " + target.id);
	      		}
	        }
        }
	    else {
			var sources = [];
			try {
			creep.room.containers.forEach(function(container) {
				if(container.store[RESOURCE_ENERGY] > (creep.carryCapacity + 150)) {
				sources.push(container);
				}					
			})
			creep.room.links.forEach(function(link) {
				if(link.energy > 0) {
					sources.push(link);
				}
			})
			}
			catch(err) {
				console.log(creep.name + ': ' + err + ' while enumerating containers in ' + creep.room.name);
			}
				// pull from a SOURCE if no extensions/containers with energy found
				// OR if total room energy is less than 450 (minimum to spawn a harvester)
            if ((sources.length == 0)) {
                var sources = creep.room.find(FIND_SOURCES_ACTIVE);
				var source = creep.pos.findClosestByPath(sources);
				if(source == null && creep.room.energyAvailable == creep.room.energyCapacityAvailable) {
					sources=_filter(creep.room.spawns, (s) => { return s.energy > creep.carryCapacity});
					source = creep.pos.findClosestByPath(sources);
					creep.say('Spawn harvest');
					if(creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
						creep.moveTo(source);
					}
				}
				else {
					if (creep.harvest(source) == ERR_NOT_IN_RANGE ) {
						creep.moveTo(source);
					}
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
    	               creep.say("invalid source");
    	               break;
    	            default:
    	                console.log(creep.say("withdraw error"));
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