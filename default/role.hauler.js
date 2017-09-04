/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.hauler');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // find containers with energy, bring them to fill spawns and extensions
        
        var roomMap = Memory.roomMaps[creep.room.name];
  
        if((creep.memory.hauling) && _.sum(creep.carry) == 0) {
            creep.memory.hauling = false;
            creep.memory.target = null;
            creep.say("Harvest");
        }
        if (!creep.memory.hauling && _.sum(creep.carry) == creep.carryCapacity) {
            creep.memory.hauling = true;
            // find nearby LINK to deposit in
            try {
            const sourceLinkObj = _.filter(roomMap.links,  (l) => l.role == 'SINK')[0] ;
            if(sourceLinkObj) {
                sourceLink = Game.getObjectById(sourceLinkObj.id);      
                if(creep.pos.inRangeTo(sourceLink,3)) {
                    creep.memory.target = sourceLink.id;
                }
                else {
                    creep.memory.target = null ; 
                }
            }
            else {
                creep.memory.target = null;
            }
            }
            catch(err) {
                creep.memory.target = null;
            }
            creep.say("Haul");
        }
        if(creep.memory.hauling) {
            // change this logic to find spawns that are empty, if null find extensions that are empty, 
            // if null find towers that are empty
            // then just find the closest of what's left
            // then will have to add something to prioritize towers when hostiles found
            var targets = [];
            var target = null ;
            // if we have a target, either drop in there or move to there
            if(creep.memory.target != null) {
                try {
                target = Game.getObjectById(creep.memory.target);
                if(creep.pos.inRangeTo(target,1)) {
                    for(const resourceType in creep.carry) {
                        if (creep.carry[resourceType] > 0) {                            
                            creep.transfer(target, resourceType);
                        }
                    };
//                    creep.transfer(target, RESOURCE_ENERGY);                    
                    creep.memory.target = null;
                }
                else {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
                }
                catch(err) {
                    creep.memory.target = null;
                    creep.say('memwipe');
                }
            }
            else {
                // we don't have a target, so figure out where to go
                if(_.sum(creep.carry) > 0 && creep.carry[RESOURCE_ENERGY] > 0 ) {
                    // first look for extensions, spawns, or towers that aren't full
                    targets = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_EXTENSION || 
                                    structure.structureType == STRUCTURE_SPAWN ||
                                    structure.structureType == STRUCTURE_TOWER) && 
                                    structure.energy < (structure.energyCapacity * .9);
                        }
                    });
                }
                var targetSpawns = _.remove(targets, function(o) { return o.structureType == STRUCTURE_SPAWN; });
                //prioritize spawns
                if(targetSpawns.length > 0) {
                    try {
                    target = creep.pos.findClosestByPath(targetSpawns);
                    creep.memory.target = target.id; 
                    creep.say("Spawn");   
                    }
                    catch(err) {
                        creep.say(err);
                    }                
                }
                else {
                    // no spawns to target, so now extensions and towers
                    try {
                    if(targets.length > 0) {
                        try {
                            target = creep.pos.findClosestByPath(targets);
                            creep.memory.target = target.id;  
                            creep.say("Ext/Tower");                      
                        }
                        catch(err) {
                            console.log(creep.name + err);
                        }   
                    }
                    else {
                        // no extensions, spawns, or towers
                        // this looks for SINKs and deposits there no matter how full
                        if(roomMap.links.length > 0) {
                            containersAndLinks = roomMap.containers.concat(roomMap.links);
                        }
                        else {
                            containersAndLinks = roomMap.containers;
                        }
                        //console.log('room ' + creep.room.name + ' has ' + containersAndLinks.length + ' cont/links');

                        for(c in roomMap.containers) {
                            // get the real container object
                            container = Game.getObjectById(roomMap.containers[c].id);
                            container.role = roomMap.containers[c].role ;
                            if((container.role == 'SINK') && (_.sum(container.store) < (container.storeCapacity - _.sum(creep.carry)))) {
                                targets.push(container);
                            }
                        }
                        for(l in roomMap.links) {
                            link = Game.getObjectById(roomMap.links[l].id);
                            link.role = roomMap.links[l].role;
                            if((link.role == 'SINK') && link.energy < link.energyCapacity - creep.carry[RESOURCE_ENERGY]) {
                                targets.push(link);
                            }
                        }
                        // for now assume only 1 storage per room
                        // only put in storage if no sink containers to drop in
                        if(targets.length == 0) {
                            storage = creep.room.find(FIND_STRUCTURES, {
                                filter: (structure) => {
                                    return (structure.structureType == STRUCTURE_STORAGE ||
                                            (structure.structureType == STRUCTURE_TERMINAL && _.sum(structure.store) < 2500) &&
                                        _.sum(structure.store) < structure.storeCapacity) ; 
                                }
                            });
                            if(storage[0]) {
                                targets.push(storage[0]);
                            }
                        }
                        try {
                            if (targets.length > 0) {
                                target = creep.pos.findClosestByPath(targets);
                                creep.memory.target = target.id;
                                creep.say("conatiner");
                            }
                        }
                        catch(err) {
                            console.log(creep.name + ": " + err);
                        }
                    }
                    }
                    catch(err) {
                        console.log(creep.name + ": " + err);
                    }
                }
            //now try to transfer to target, or else move to it
            switch(creep.transfer(target, RESOURCE_ENERGY)) {
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(target, {visualizePathStyle: {}});
                    break;
                case OK:
                    break;
                default:
                    creep.memory.target=null;
                    for(const resourceType in creep.carry) {
                        if (creep.carry[resourceType] > 0) {                            
                            creep.transfer(target, resourceType);
                        }
                    };
                    break;   
            }
        }
    }

        if(!creep.memory.hauling) {
            var target = null ;
            // if we have a target, either pick up there or move to there
            try{
            if(creep.memory.target != null) {
                target = Game.getObjectById(creep.memory.target);
                if(creep.pos.inRangeTo(target,1)) {
                    if (creep.withdraw(target, RESOURCE_ENERGY) != OK) {
                        creep.pickup(target) ;
                        }
                    creep.memory.target = null;
                    }
                else {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }

            else {
            // start with dropped resources
            var sources = creep.room.find(FIND_DROPPED_RESOURCES);
            // if no dropped resources of > 50 units, then cycle through containers and find SOURCEs
            if((sources.length == 0) || sources[0].amount < 50) {
                for(c in roomMap.containers) {
                    // get the real container object
                    container = Game.getObjectById(roomMap.containers[c].id);
                    container.role = roomMap.containers[c].role ;
                    container.isSource = roomMap.containers[c].isSource ;
                    // console.log("creep " + creep.name +" found container info " + container.id + container.role + " isSource " + container.isSource);
                    if(((container.role == 'SOURCE') || container.isSource) && (_.sum(container.store) > creep.carryCapacity)){
                        sources.push(container);
                    }
                }
            }
            else {
                creep.say("Dropped");
            //    console.log("Found "+ sources.length + " locations of dropped resources, first is " + sources[0].pos);
            }
            if (sources.length == 0 ) {
                creep.say('Nosources!');
                return;
            }
            const source=creep.pos.findClosestByPath(sources);
            creep.memory.target = source.id ;
 /*           try {
                if(creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: {}});
                }
                else {
                    if(creep.pickup(source) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(source, {visualizePathStyle: {}});
                    }
                }
            }
            catch(err) {
                creep.say(err);
            } */
            }
        }
            catch(err) {
                creep.say(err);
                console.log(creep.name + '' + creep.room.name + ': ' + err + ', target ' + target);
                creep.memory.target = null;
            }
        }
    }
}