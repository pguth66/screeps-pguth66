var roleUpgrader = require('role.upgrader');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

		if(creep.spawning) {
			return;
		}

		var roomMap = Memory.roomMaps[creep.room.name];
		
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
	        creep.move(BOTTOM_LEFT);
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
			for(c in roomMap.containers) {
				// get the real container object
				container = Game.getObjectById(roomMap.containers[c].id);
				container.role = roomMap.containers[c].role ;
	 //          console.log("creep " + creep.name +" found container info " + container.id + container.role);
				if(container.store[RESOURCE_ENERGY] > (creep.carryCapacity + 150)) {
//				if(container.role == 'SINK' && (container.store[RESOURCE_ENERGY] > creep.carryCapacity)) {
					sources.push(container);
				}
			}
			for(l in roomMap.links) {
				link = Game.getObjectById(roomMap.links[l].id);
				link.role = roomMap.links[l].role ;
				if(link.energy > 0) {
					sources.push(link);
				}
			}
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
					source = creep.room.find(FIND_MY_SPAWNS)[0];
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