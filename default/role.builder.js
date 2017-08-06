var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

	    if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	        creep.say('🚧 build');
	    }

	    if(creep.memory.building) {
	        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
	        if (targets.length == 0) {
	            Memory.noBuild = true;
	            creep.moveTo(29,17);
	        }
	        else {
           	var bestpathindex = 999 ;
           	var bestpath = [] ;        
	        
	        for (i=0 ; i < targets.length ; i++) {
	           path = creep.pos.findPathTo(targets[i].pos);
                if (bestpath.length == 0) { 
                    bestpath = JSON.parse(JSON.stringify(path)) ;
                    bestpathindex = 0 ;
                }
	           if (path.length < bestpath.length) {
	               bestpath = JSON.parse(JSON.stringify(path)) ;
	               bestpathindex = i ;
	           }
	        }
	        switch(creep.build(targets[bestpathindex])) {
	            case ERR_NOT_IN_RANGE:
	                creep.moveByPath(bestpath);
	                break;
	            case OK:
	                creep.say("Building");
	                break;
	            case ERR_INVALID_TARGET:
	                console.log("Invalid target with index " +bestpathindex);
	                break;
	           default: 
	            console.log(creep.name + ": Error while trying to build " + targets[bestpathindex].id);
	        }
/*            if(creep.build(targets[bestpathindex]) == ERR_NOT_IN_RANGE) {
                console.log("building site with index " + bestpathindex);
               creep.moveByPath(bestpath);
            }
            else {
                    console.log(creep.name + " is building");
            } */ 
	        }
        }
	    else {
	         var sources = creep.room.find(FIND_MY_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || 
                                 structure.structureType == STRUCTURE_CONTAINER)  && structure.energy > 0;
                    }
			});
				// pull from a SOURCE if no extensions/containers with energy found
				// OR if total room energy is less than 450 (minimum to spawn a harvester)
            if ((sources.length == 0) && (creep.room.energy < 450)) {
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
    	               console.log("source is invalid target");
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