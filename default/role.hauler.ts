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
    run: function (creep: Creep) {
        // find containers with energy, bring them to fill spawns and extensions

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
                case STRUCTURE_POWER_SPAWN:
                    if (structure.energy == structure.energyCapacity) {
                        b = true;
                    }
            }
            return b;
        }

        if ((creep.memory.hauling) && creep.store.getUsedCapacity() == 0) {
            if (creep.ticksToLive < 100) {
                creep.say('Goodbye');
                creep.memory.role = 'recycle';
            }
            else {
                creep.memory.hauling = false;
                creep.memory.target = null;
                // don't want interhaulers to pick up a load of stuff on their first tick after flipping
                if (creep.memory.role == 'interhauler') {
                    return;
                }
                creep.say("Harvest");
                // if we just flipped and we're near a full source link, pull from it
                const sourceLinkObjs: StructureLink[] = _.filter(creep.room.links, (l) => l.isSource);
                sourceLinkObjs.forEach(function (link) {
                    if (creep.pos.inRangeTo(link, 5) && link.energy > creep.carryCapacity) {
                        creep.memory.target = link.id;
                        creep.say('linkharv');
                    }
                })
            }
        }

        if (!creep.memory.hauling && creep.store.getFreeCapacity() == 0) {
            creep.memory.hauling = true;
            creep.memory.target = null;
            // if we just flipped to hauling, don't walk across the entire room if a LINK is nearby
            // find nearby LINK to deposit in 
            // problem is if the room is empty this will refill links while we're starving
            try {
                if (((creep.room.energyAvailable / creep.room.energyCapacityAvailable) > 0.7) && !(Memory.rooms[creep.room.name].priorityRefill)) {
                    //creep.creepLog('hauling to link because priorityRefill is ' + roomMap.priorityRefill);
                    //creep.say('Linkdep');
                    const sourceLinkObj = _.filter(creep.room.links, (l) => l.isSource == false)[0];
                    if (sourceLinkObj) {
                        const sourceLink: Structure = Game.getObjectById(sourceLinkObj.id);
                        if (creep.pos.inRangeTo(sourceLink, 3)) {
                            creep.memory.target = sourceLink.id;
                        }
                        else {
                            creep.memory.target = null;
                        }
                    }
                    else {
                        creep.memory.target = null;
                    }
                }
            }
            catch (err) {
                creep.creepLog(err);
                creep.memory.target = null;
            }
            //creep.say("Haul");
            return;
        }

        if (creep.memory.hauling) {
            // change this logic to find spawns that are empty, if null find extensions that are empty, 
            // if null find towers that are empty
            // then just find the closest of what's left
            // then will have to add something to prioritize towers when hostiles found
            var targets = [];
            var target = null;
            // if we have a target, either drop in there or move to there
            if (creep.hasTarget()) {
                try {
                    target = Game.getObjectById(creep.memory.target);
                    if (!isFull(target)) {
                        if (creep.pos.inRangeTo(target, 1)) {
                            for (const resourceType in creep.store) {
                                if (creep.carry[resourceType] > 0) {
                                    const r = creep.carry[resourceType];
                                    if (creep.transfer(target, resourceType as ResourceConstant) == OK) {
                                        creep.memory.processed += r;
                                    }
                                }
                            };
                            creep.memory.target = null;
                        }
                        else {
                            // here's where we add the stuff to tell a creep to move if it's in the way
                            //creep.creepLog('moving to ' + target.id);
                            creep.moveToTarget(target);
                        }
                    }
                    else {
                        creep.say("full target");
                        creep.memory.target = null;
                    }
                }
                catch (err) {
                    creep.memory.target = null;
                    creep.creepLog(err);
                    creep.say('memwipe');
                }
            }
            else {
                // we don't have a target, so figure out where to go
                if (creep.store.getUsedCapacity() > 0 && creep.carry[RESOURCE_ENERGY] > 0) {
                    // first look for extensions, spawns, or towers that aren't full
                    var potentialTargets: any[] = creep.room.extensions.concat(creep.room.towers, creep.room.spawns);
                    targets = _.filter(potentialTargets, (s) => { return s.energy < (s.energyCapacity * .9) });
                    /*                    targets = creep.room.find(FIND_MY_STRUCTURES, {
                                            filter: (structure) => {
                                                return (structure.structureType == STRUCTURE_EXTENSION || 
                                                        structure.structureType == STRUCTURE_SPAWN ||
                                                        structure.structureType == STRUCTURE_TOWER) && 
                                                        structure.energy < (structure.energyCapacity * .9);
                                            }
                                        });
                                        */
                }
                try {
                    if (targets.length > 0) {
                        try {
                            target = creep.pos.findClosestByPath(targets, { ignoreCreeps: true });
                            creep.memory.target = target.id;
                            creep.say(target.structureType);
                        }
                        catch (err) {
                            //console.log(creep.name + err);
                            creep.creepLog(err);
                        }
                    }
                    else {
                        // no extensions, spawns, or towers
                        // this looks for SINKs and deposits there no matter how full
                        // looks for containers (includes storage), links, and terminals
                        // also labs
                        /*                       if(creep.room.links.length > 0) {
                                                  let containersAndLinks: object[] = creep.room.containers.concat(creep.room.links);
                                              }
                                              else {
                                                  var containersAndLinks = creep.room.containers;
                                              } */
                        //console.log('room ' + creep.room.name + ' has ' + containersAndLinks.length + ' cont/links');

                        if (creep.hasMinerals() && (creep.carry[RESOURCE_ENERGY] == 0) && creep.room.terminal && !isFull(creep.room.terminal)) {
                            target = creep.room.terminal;
                            creep.memory.target = target.id;
                            creep.say(target.structureType);
                            return;
                        }

                        creep.room.containers.forEach(function (container) {
                            if ((!container.isSource) && (container.store.getUsedCapacity() < (container.storeCapacity - creep.store.getUsedCapacity()))) {
                                targets.push(container);
                            }
                        })
                        creep.room.links.forEach(function (link) {
                            if (!link.isSource && link.energy < (link.energyCapacity - creep.carry[RESOURCE_ENERGY])
                                && creep.carry[RESOURCE_ENERGY] > 0) {
                                targets.push(link);
                            }
                        })
                        var terminal = creep.room.terminal;
                        if (creep.hasEnergy() && terminal && !isFull(terminal) && terminal.store[RESOURCE_ENERGY] < 20000 && terminal.store.getUsedCapacity() < terminal.store.getCapacity()) {
                            targets.push(terminal);
                        }
                        creep.room.labs.forEach(function (lab) {
                            if (creep.hasEnergy() && (lab.energy < lab.energyCapacity)) {
                                targets.push(lab);
                            }
                        })
                        var powerSpawn = creep.room.powerSpawn;
                        if (creep.hasPower() && powerSpawn && !isFull(powerSpawn)) { targets.push(powerSpawn) };
                        try {
                            if (targets.length > 0) {
                                target = creep.pos.findClosestByPath(targets);
                                creep.memory.target = target.id;
                                creep.say(target.structureType);
                            }
                            else {
                                // deposit in any target now

                                target = creep.findAnyDepositTarget();
                                creep.memory.target = target.id;
                            }
                        }
                        catch (err) {
                            console.log(creep.name + " " + creep.room.name + ": " + err);
                        }
                    }
                }
                catch (err) {
                    console.log(creep.name + ": " + err + 'while finding a target to haul to');
                }
                //now try to transfer to target, or else move to it
                var r = creep.carry[RESOURCE_ENERGY]; // for counting how much we've processed
                switch (creep.transfer(target, RESOURCE_ENERGY)) {
                    case ERR_NOT_IN_RANGE:
                        creep.moveTo(target, { visualizePathStyle: {} });
                        break;
                    case OK:
                        //creep.creepLog('adding ' + r + ' to creeps processed value');
                        creep.memory.processed += r;
                        break;
                    default:
                        //creep.creepLog('fallthrough in transfer');
                        creep.memory.target = null;
                        for (const resourceType in creep.carry) {
                            if (creep.carry[resourceType] > 0) {
                                r = creep.carry[RESOURCE_ENERGY];
                                if (creep.transfer(target, resourceType as ResourceConstant) == OK) {
                                    creep.memory.processed += r;
                                }
                            }
                        };
                        break;
                }
            }
        }

        if (!creep.memory.hauling) {
            var target = null;
            // if we have a target, either pick up there or move to there
            try {
                if (creep.hasTarget()) {
                    target = Game.getObjectById(creep.memory.target);
                    if (target == null || (target.store && target.store.getUsedCapacity() == 0)) {
                        creep.memory.target = null;
                        creep.say('memwipe');
                    }
                    else {
                        if (creep.pos.inRangeTo(target, 1)) {
                            switch (creep.withdraw(target, RESOURCE_ENERGY)) {
                                case ERR_INVALID_TARGET:
                                    creep.pickup(target);
                                    break;
                                case OK:
                                    break;
                                default:
                                    if (creep.store.getUsedCapacity() < creep.store.getCapacity()) {
                                        for (let r in (target.store)) {
                                            creep.withdraw(target, r as ResourceConstant);
                                        }
                                    };
                                    break;
                            }

                            creep.memory.target = null;

                        } else {
                            creep.moveToTarget(target);
                        }
                    }
                } // end 'have a target'

                // now find stuff to pick up
                else {
                    // start with dropped resources of > 50 units
                    var sources = [];

                    // process powerSpawns first, chances are if there's one it's the only thing in the room
                    const powerBanks = creep.room.find(FIND_STRUCTURES, {filter: { structureType: STRUCTURE_POWER_BANK }}) as StructurePowerBank[];
                    if (powerBanks.length > 0 && powerBanks[0].hits == 0 && powerBanks[0].power > 0) {
                        sources.push(powerBanks[0]);
                    }

                    if (!(creep.room.controller && creep.room.controller.my && (creep.room.memory.foundHostiles && typeof creep.room.controller.safeMode === 'undefined'))) {
                        sources = creep.room.droppedResources;
                        // remove anything in the junkyard
                        if ((sources.length > 0) && creep.room.junkyard) {
                            //creep.creepLog('removing junkyard stuff');
                            _.remove(sources, function (s) { return s.pos.isEqualTo(creep.room.junkyard.pos) });
                        }
                        if (creep.room.tombstones) {
                            // cycle through tombstones, add them to sources if they aren't empty
                            creep.room.tombstones.forEach(function (tombstone) {
                                if (tombstone.store.getUsedCapacity() > 0) {
                                    sources.push(tombstone);
                                    //creep.creepLog('found non-empty tombstone');
                                }
                            })
                        }
                        if (creep.room.ruins) {
                            creep.room.ruins.forEach(function (ruin) {
                                if (ruin.store.getUsedCapacity() > 0) {
                                    sources.push(ruin);
                                }
                            })
                        }
                    };
                    var fullsources = [];
                    // if no dropped resources, then cycle through containers and find SOURCEs

                    if (sources.length == 0) {
                        creep.room.containers.forEach(function (container) {
                            if ((container.isSource) && (container.store.getUsedCapacity() > creep.store.getCapacity())) {
                                // if there's no terminal, don't pull minerals out of containers
                                // not sure this is a good idea or why it's here
                                if (typeof (creep.room.terminal) === 'undefined' && (container.store[RESOURCE_ENERGY] == 0)) {
                                    console.log(creep.room + ' has no terminal');
                                }
                                else {
                                    sources.push(container);
                                    if (container.store.getUsedCapacity() >= (container.storeCapacity - 250)) {
                                        fullsources.push(container);
                                    }
                                }
                            }
                            else {
                                // add all containers when room is below half on energy
                                // TODO: add condition for when towers are low on energy as well
                                if (((creep.room.energyAvailable < (creep.room.energyCapacityAvailable / 2)) || Memory.rooms[creep.room.name].priorityRefill) && (container.store[RESOURCE_ENERGY] > creep.carryCapacity)) {
                                    sources.push(container);
                                }
                            }

                        })
                        try {
                            creep.room.links.forEach(function (link) {
                                //link = Game.getObjectById(l.id);
                                //link.isSource = l.isSource;
                                //creep.creepLog('found link ' + link.id);
                                if (link.isSource && (link.energy > creep.carryCapacity)) {
                                    sources.push(link);
                                }

                            })
                        }
                        catch (err) {
                            creep.creepLog(err + " while processing links");
                        }
                    }
                    else {
                        creep.say("Dropped");
                        //    console.log("Found "+ sources.length + " locations of dropped resources, first is " + sources[0].pos);
                    }
                    if (fullsources.length > 0) {
                        function haulersOnTarget(target) {
                            return _.filter(Game.creeps, function (c: Creep) { return (c.memory.role == 'hauler' && c.memory.target == target.id) }).length
                        }

                        // pull out any fullsources that already have two creeps targetting them
                        let removedContainers: Structure[] = _.remove(fullsources, (t) => { return haulersOnTarget(t) > 1 });
                        if (fullsources.length > 0) {
                            sources = fullsources;
                            creep.say('Fullsource');
                        }
                    }
                    if (sources.length == 0) {
                        // update this to pull from storage if it's got a lot in it (>10k?)
                        creep.say('Nosources!');
                        //console.log(creep.name + ' no SOURCE containers found in room ' + creep.room.name);
                        return;
                    } else {
                        var powerSources = _.remove(sources, (s) => { return s.resourceType == RESOURCE_POWER });
                        var source;
                        switch (powerSources.length) {
                            case 0:
                                break;
                            case 1:
                                source = powerSources[0];
                                break;
                            default:
                                source = creep.pos.findClosestByPath(powerSources);

                        }
                        if (!source) {
                            source = creep.pos.findClosestByPath(sources);
                            if (!source) {
                                source = creep.pos.findClosestByRange(sources);
                            }
                        }
                        creep.memory.target = source.id;
                    }
                    // we're wasting a tick here, by not moving to the target now
                }
            }
            catch (err) {
                //creep.say(err);
                creep.creepLog(err + ' while finding a target to pickc up from');
                //console.log(creep.name + ' ' + creep.room.name + ': ' + err + ', target ' + target);
                creep.memory.target = null;
            }
        }
    }
}