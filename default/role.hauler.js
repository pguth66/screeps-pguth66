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

        var roomMap = Memory.roomMaps[creep.room.name];
  
        if((creep.memory.hauling) && _.sum(creep.carry) == 0) {
            if(creep.ticksToLive < 100) {
                creep.say('Goodbye');
                creep.memory.role='recycle';
            }
            else {
                creep.memory.hauling = false;
                creep.memory.target = null;
                creep.say("Harvest");
            }
        }

        if (!creep.memory.hauling && _.sum(creep.carry) == creep.carryCapacity) {
            creep.memory.hauling = true;
            // if we just flipped to hauling, don't walk across the entire room if a LINK is nearby
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
                    if(!isFull(target)) {
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
                    else {
                        creep.say("full target");
                        creep.memory.target = null ;
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
                    // no spawns to target, so now extensions and towers
                    try {
                    if(targets.length > 0) {
                        try {
                            target = creep.pos.findClosestByPath(targets);
                            creep.memory.target = target.id;  
                            creep.say(target.structureType);                      
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
                        var terminal = creep.room.find(FIND_STRUCTURES, {
                            filter: (s) => { return (s.structureType == STRUCTURE_TERMINAL &&
                                                s.store[RESOURCE_ENERGY] < 5000 &&
                                                _.sum(s.store) < s.storeCapacity); }
                        });
                        if(terminal[0]) {
                            targets.push(terminal[0]);
                        }
                        // for now assume only 1 storage per room
                        // only put in storage if no sink containers to drop in
 /*                       if(targets.length == 0) {
                            storage = creep.room.find(FIND_STRUCTURES, {
                                filter: (structure) => {
                                    return ((structure.structureType == STRUCTURE_STORAGE ||
                                            (structure.structureType == STRUCTURE_TERMINAL && structure.store[RESOURCE_ENERGY] < 2500)) &&
                                        _.sum(structure.store) < structure.storeCapacity) ; 
                                }
                            });
                            console.log(creep.room.name + ' found ' + storage.length + ' storage units');                            
                            if(storage.length > 0) {
                                storage.foreach(function(s) { targets.push(s)});
                            }
                            if(storage[0]) {
                                targets.push(storage[0]);
                            } 
                    } */
                        try {
                            if (targets.length > 0) {
                                target = creep.pos.findClosestByPath(targets);
                                creep.memory.target = target.id;
                                creep.say(target.structureType);
                            }
                        }
                        catch(err) {
                            console.log(creep.name +" " + creep.room.name + ": " + err);
                        }
                    }
                    }
                    catch(err) {
                        console.log(creep.name + ": " + err);
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
                if(target == null) {
                    creep.memory.target = null ; 
                    creep.say('memwipe');
                }
                else {
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
                    if(((container.role == 'SOURCE') || container.isSource) && (container.store[RESOURCE_ENERGY] > creep.carryCapacity)){
                        sources.push(container);
                    }
                    else {
                        // add all containers when room is below half on energy
                        if(creep.room.energyAvailable < (creep.room.energyCapacityAvailable / 2) && (container.store[RESOURCE_ENERGY] > creep.carryCapacity)) {
                            sources.push(container);
                        }
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
                console.log(creep.name + ' ' + creep.room.name + ': ' + err + ', target ' + target);
                creep.memory.target = null;
            }
        }
    }
}