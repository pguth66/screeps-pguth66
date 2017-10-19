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
            // problem is if the room is empty this will refill links while we're starving
            try {
                if(((creep.room.energyAvailable / creep.room.energyCapacityAvailable) > 0.7) && !(roomMap.priorityRefill)) {
                    //creep.creepLog('hauling to link because priorityRefill is ' + roomMap.priorityRefill);
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
            }
            catch(err) {
                creep.creepLog(err);
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
            if(creep.hasTarget()) {
                try {
                    target = Game.getObjectById(creep.memory.target);
                    if(!isFull(target)) {
                        if(creep.pos.inRangeTo(target,1)) {
                            for(const resourceType in creep.carry) {
                                if (creep.carry[resourceType] > 0) {                            
                                    creep.transfer(target, resourceType);
                                }
                            };
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
                    creep.creepLog(err);
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
                        // looks for containers (includes storage), links, and terminals
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
                            if((link.role == 'SINK') && link.energy < (link.energyCapacity - creep.carry[RESOURCE_ENERGY])
                                && creep.carry[RESOURCE_ENERGY] > 0) {
                                targets.push(link);
                            }
                        }
                        var terminal = creep.room.find(FIND_STRUCTURES, {
                            filter: (s) => { return (s.structureType == STRUCTURE_TERMINAL &&
                                                s.store[RESOURCE_ENERGY] < 20000 &&
                                                _.sum(s.store) < s.storeCapacity); }
                        });
                        // assume only one terminal
                        if(terminal[0]) {
                            targets.push(terminal[0]);
                        }
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
            if(creep.hasTarget()) {
                target = Game.getObjectById(creep.memory.target);
                if(target == null) {
                    creep.memory.target = null ; 
                    creep.say('memwipe');
                }
                else {
                    if(creep.pos.inRangeTo(target,1)) {
                        switch (creep.withdraw(target, RESOURCE_ENERGY)) {
                            case ERR_INVALID_TARGET:
                                creep.pickup(target) ;
                                break;
                            case OK:
                                break;
                            default:
                            if (_.sum(creep.carry) < creep.carryCapacity) {
                                for(const r in (target.store)) {
                                    creep.withdraw(target ,r);
                                }
                            };
                            break;
                        }

                        creep.memory.target = null;

                    }
                    else {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
            } // end 'have a target'

            // now find stuff to pick up
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
                    // console.log("creep " + creep.name +" found container info " + container.id + container.role + " isSource " + container.isSource + ' in room ' + creep.room.name);
                    if(((container.role == 'SOURCE') || container.isSource) && (_.sum(container.store) > creep.carryCapacity)){
                        sources.push(container);
                    }
                    else {
                        // add all containers when room is below half on energy
                        // TODO: add condition for when towers are low on energy as well
                        if(((creep.room.energyAvailable < (creep.room.energyCapacityAvailable / 2)) || roomMap.priorityRefill) && (container.store[RESOURCE_ENERGY] > creep.carryCapacity)) {
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
                // update this to pull from storage if it's got a lot in it (>10k?)
                creep.say('Nosources!');
                //console.log(creep.name + ' no SOURCE containers found in room ' + creep.room.name);
                return;
            } else {
                const source=creep.pos.findClosestByPath(sources);
                creep.memory.target = source.id ;
            }
            // we're wasting a tick here, by not moving to the target now
            }
        }
            catch(err) {
                creep.say(err);
                creep.creepLog(err);
                console.log(creep.name + ' ' + creep.room.name + ': ' + err + ', target ' + target);
                creep.memory.target = null;
            }
        }
    }
}