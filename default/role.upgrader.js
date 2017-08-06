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
	        var sources = creep.room.find(FIND_SOURCES);
	        var bestpath = [] ; 
	        var bestpathindex = 0 ;
	        
	        for (i=0 ; i < sources.length ; i++) {
	           path = creep.pos.findPathTo(sources[i].pos);
                if (bestpath.length == 0) { 
                    bestpath = JSON.parse(JSON.stringify(path)) ;
                }

	           if (path.length < bestpath.length) {
	               bestpath = JSON.parse(JSON.stringify(path)) ;
	               bestpathindex = i ;
	           }
	        }
            if(creep.harvest(sources[bestpathindex]) == ERR_NOT_IN_RANGE) {
                creep.moveByPath(bestpath);
            }
	    }
	}
};

module.exports = roleUpgrader;