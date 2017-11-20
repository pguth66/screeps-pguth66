var creepHandler = require('creepHandler');
var harvestRole = require('func.harvestRoles');
require('roomHandler');
var labHandler = require('labHandler');

module.exports.loop = function () {

    Memory.roomToClaim = 'W28N26'; // room to send claimers to
    Memory.roomToHelp = 'W28N27'; // room to drop off interroom energy in
    Memory.roomToMaintain = 'W29N28'; // room to keep roads healed in (caltrans)
    Memory.roomToAttack = null; // room to send warriors to
    Memory.roomToBuild = 'W28N26'; // room to send remoteworkers to
    Memory.roomToHarvest = 'W29N28'; // room to harvest energy in (and send interhaulers to)
    Memory.roomToObserve = 'W30N27';

    Memory.terminal = '59a55cde8f17b94e4e8804e9'; // only one terminal for now

    var dismantleTarget; //have to define up here so tower code can find it

    // hand create room map for now, note this overwrites the object every tick, so
    // any flags set in code disappear (e.g. priorityRefill)
/*    Memory.roomMaps = {
        W28N27: {
            containers: [
                { id: '59b009899eb1db6ba877dfc9', role: 'SOURCE', isSource: true },
                // { id: '59ddb5ab82005d42473ed22b', role: 'SOURCE', isSource: true},
                { id: '59dd900b266f8220b8f79e3c', role: 'SOURCE', isSource: true, isMins: true },
                { id: '59a256249cb73d4b2b3567b3', role: 'SINK', isSource: false, isStorage: true } // Storage 
            ],
            links: [
                { id: '59b21b672219c436e2e873b2', role: 'SINK', isSource: false },
                { id: '59b23adaf2830629b52d5a3d', role: 'SOURCE', isSource: true }
            ]
        },
        W27N27: {
            containers: [
                { id: '599b7d776ab60d4e2bc5aa9d', role: 'SOURCE', isSource: true },
                { id: '59dd87c1eb541839058493ff', role: 'SOURCE', isSource: true },
                { id: '59ddb5ab82005d42473ed22b', role: 'SOURCE', isSource: true },
                //   { id: '59d3c74c8b3b857455e5c1f6', role: 'SOURCE', isSource: true},
                { id: '59dd93d04278284b601acc26', role: 'SOURCE', isSource: true, isMins: true },
                { id: '59a0994324116d15c606624b', role: 'SINK', isSource: false, isStorage: true } // this one is Storage
            ],
            sources: [
                { id: '5982fcceb097071b4adbe20a' },
                { id: '5982fcceb097071b4adbe20c' }
            ],
            links: [
                { id: '59a7ba769c3a583afe47f9c1', role: 'SINK', isSource: false },
                { id: '59a7afe5587da815c0f44549', role: 'SOURCE', isSource: true }
            ],
            isCapital: true
        },
        W28N28: {
            containers: [
                { id: '59dd79cbe02aeb51d4284c20', role: 'SOURCE', isSource: true },
                { id: '59dd8e2423b60f4dac896d5e', role: 'SOURCE', isSource: true },
                //   {id: '59a90288d14c6603ae1b5bef', role:'SINK', isSource: false},
                //    {id: '59ce8ab93c09f43aecc417f2', role: 'SOURCE', isSource:true},
                { id: '59dda3289580ed3ef56b4185', role: 'SOURCE', isSource: true }, // minerals
                { id: '59ab3a8937e7dd0cb4fa63d8', role: 'SINK', isSource: false, isStorage: true } // Storage
            ],
            links: [
                { id: '59ae3ac6e95a3b294291fb39', role: 'SINK', isSource: false },
                { id: '59ffcdd510ff982b8f7ac44f', role: 'SOURCE', isSource: true }
            ]
        },
        W29N28: {
            containers: [
                { id: '59f9248643a6f21494ac51cb', role: 'SOURCE', isSource: true },
                { id: '59f5f06cdfd6af587fd52b6e', role: 'SOURCE', isSource: true }

            ],
            links: [
            ]
        },
        W29N29: {
            containers: [
                { id: '59dd70980a04da472f8414ed', role: 'SOURCE', isSource: true },
                { id: '59dd99e7aed33f53598642b0', role: 'SOURCE', isSource: true },
                { id: '59f97cc941899941525e0590', role: 'SOURCE', isSource: true, isMins: true },
                { id: '59bc4a940c06b0220c547d5c', role: 'SINK', isSource: false, isStorage: true } // Storage
            ],
            links: [
                { id: '59be9dca69be3c422cbeb4fc', role: 'SINK', isSource: false },
                { id: '59be996f5a9d6d2344a8150d', role: 'SOURCE', isSource: true }
            ]
        },
        W28N26: {
            containers: [
                { id: '59dd9082212bf11ba6fa83ee', role: 'SOURCE', isSource: true },
                { id: '59cd0cb9b0741a5fcf2fb961', role: 'SOURCE', isSource: true },
                { id: '59e145969574a42396556bd9', role: 'SOURCE', isSource:true},
                //   { id: '59d29332aefa860d29decd95', role: 'SOURCE', isSource:true},
                { id: '59ddb5a666e6033520372ea0', role: 'SOURCE', isSource: true, isMins: true },
                { id: '59ce54cd5ce8282a254f22ff', role: 'SINK', isSink: true, isStorage: true }
            ],
            links: [
                { id: '59d25f20abda762ee496f901', role: 'SINK', isSource: false },
                { id: '59d2624a7aa36063f34475d4', role: 'SOURCE', isSource: true }
            ]
        },
        W27N26: {
            containers: [
                { id: '59def12f7c84c61abd6ae73d', role: 'SOURCE', isSource: true },
                { id: '59df09f26277326fe8296703', role: 'SOURCE', isSource: true },
                { id: '59e72e8810a3d4295847a67d', role: 'SOURCE', isSource: true, isMins: true},
                { id: '59e068c3fefc294ace78595f', role: 'SINK', isSource: false, isStorage:true}   
                ],
            links: []
        },
        W29N27: {
            containers: [

                ],
            links: []
        },
        sim: { containers: [],
                links: [] }
    } */
      
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    const numMinHaulers = _.filter(Game.creeps, (c) => { return c.memory.role == 'minhauler' }).length;

    // Harvest room logic
    try {
        const harvestRoles = ['caltrans', 'harvester', 'interhauler', 'patrol'];
        harvestRoles.forEach(function (role) { harvestRole.run(role, 'W29N28', 'W28N27') });
    }
    catch (err) {
        //console.log('Error running harvest rooms');
    }

    //const capitalCity = _.filter(Memory.roomMaps, (r) => {return r.isCapital});
    //console.log('capital is in '+ JSON.stringify(capitalCity, null, 4));

    // minhaulers aren't per room but global so they spawn outside the room loops
    //console.log(numMinHaulers.length + " mineral haulers");
    if (numMinHaulers < 1) {
        Game.spawns['Spawn8'].createCreep([CARRY, CARRY, CARRY, CARRY, MOVE, MOVE], undefined, { role: 'minhauler' });
    }

    for (i in Game.rooms) {
        const room = Game.rooms[i];
        
        if (!Memory.rooms[room.name]) {
            Memory.rooms[room.name] = {};
        }
        // console.log("running for room " + room.name);

        // for now assuming there is only one spawn per room
        const spawn = room.find(FIND_MY_SPAWNS)[0];
        const towers = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } });

        var prioritySpawn = false; // used to prioritize spawning of harvesters when multiple creeps are needed

        Memory.noBuild = false; // used to flag when there are no construction sites, to prevent spawning builders


        var roomOwner = undefined;
        try {
            roomOwner = room.controller.owner.username;
        }
        catch (err) {
            // console.log(err);
        }
        room.numSources = room.sources.length;
        //    console.log("room " + room.name + "has " + room.numSources + "spawns.");

        try {
            if (roomOwner == 'MixtySix') {
                switch (room.controller.level) {
                    case 0:
                    case 1:
                    case 2:
                        Memory.stage = 'start';
                        break;
                    default:
                        Memory.stage = 'later';
                        break;
                }

                // go back to small creeps if we're really low on energy
                if (room.energyAvailable < 700) {
                    Memory.stage = 'start';
                    // prioritySpawn = true;
                }

                room.numContainers = room.containers.length;
                room.numLinks = room.links.length;
                //console.log(room.name + ' has storage ' + room.storage.id);
                Memory.rooms[room.name].priorityRefill = false;
                for (i in towers) {
                    tower = towers[i];
                    if (tower.energy < (tower.energyCapacity * 0.7)) {
                        Memory.rooms[room.name].priorityRefill = true;
                    }
                }
                if (spawn && spawn.spawning) {
                    var spawningCreep = Game.creeps[spawn.spawning.name];
                    spawn.room.visual.text(
                        '🛠️' + spawningCreep.memory.role,
                        spawn.pos.x + 1,
                        spawn.pos.y,
                        { align: 'left', opacity: 0.8 });
                }
                // observe rooms
                const observer = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_OBSERVER } })[0];
                if (observer) {
                    observer.observeRoom(Memory.roomToObserve);
                }
                try {
                    const sourceLink = _.filter(room.links, (l) => !l.isSource )[0];
                    //console.log(room.name + " source link is " + sourceLink + ' with energy ' + sourceLink.energy);
                    if (sourceLink) {
                        //sourceLink = Game.getObjectById(sourceLinkObj.id);
                        if (sourceLink.energy > (sourceLink.energyCapacity / 2)) {
                            const targetLink = _.filter(room.links, (l) => l.isSource)[0];
                            if (targetLink.energy < targetLink.energyCapacity && sourceLink.cooldown < 1) {
                                sourceLink.transferEnergy(targetLink);
                                //console.log(room.name + ': transfer from link ' + sourceLink.id + ' to ' + targetLink.id);
                            }
                        }
                    }
                    // console.log(room.name + sourceLink.id);
                }
                catch (err) {
                    console.log(room.name + ": Error finding source link - " + err);
                }
            }
        }
        catch (err) {
            console.log(err + ' during init of room ' + room.name);
        }
        //console.log("room " + room.name + "has " + room.numContainers + " containers.");

        // grab an arry of all creeps in this room
        const roomCreeps = _.filter(Game.creeps, function (creep) { return creep.room.name == room.name });

        // loop over creeps in room, send them through the creepHandler
        for (var name in roomCreeps) {
            //var creep = roomCreeps[name];
            creepHandler.handleCreep(roomCreeps[name]);
        }

        if (roomOwner == 'MixtySix') {
            // start stage defaults
            switch (room.controller.level) {
                case 0:
                case 1:
                case 2:
                    var numHaulers = 0;
                    break;
                default:
                    var numHaulers = 1;
            }
            var numHarvesters = 2;
            var numUpgraders = 1;
            var numBuilders = 3;
            var numHealers = 0;
            var numClaimers = 0;

            if (Memory.stage == 'later') {
                numHaulers = room.numContainers - room.numLinks;
                if (numHaulers < 1) {
                    numHaulers = 1;
                }
                numHarvesters = room.numSources;
                numBuilders = numHarvesters;
                numUpgraders = 1;
                numHealers = 1;
                numClaimers = 0;
            }
        }

        try {
            if (roomOwner == 'MixtySix') {
                //room.storageObj = _.filter(Memory.roomMaps[room.name].containers, ('isStorage'))[0];
                //if (room.storageObj) {
                //    room.storage = Game.getObjectById(room.storageObj.id);
                if (room.storage) {
                    if (room.storage.store[RESOURCE_ENERGY] < 5000) {
                        numBuilders -= 1;
                        // console.log(room + " has no energy in storage, reducing numBuilders to " + numBuilders);
                    }
                    if (room.storage.store[RESOURCE_ENERGY] > 150000) {
                        numBuilders += 1;
                    }
                    if (room.storage.store[RESOURCE_ENERGY] > 350000) {
                        numBuilders += 1;
                    }
                }
                //}
                if (room.controller.level == 8) {
                    numBuilders -= 2;
                }
                var sourceContainers = _.filter(room.containers, (c) => c.isSource);
                //var sourceContainers = _.filter(Memory.roomMaps[room.name].containers, (c) => c.isSource);                
                //console.log(room + ' has ' + sourceContainers.length + ' source containers');
                var sourceEnergy = 0;
                sourceContainers.forEach(function (c) {
                    //console.log('processing ' + c.id);
                    containerObj = Game.getObjectById(c.id);
                    if (containerObj.store[RESOURCE_ENERGY] > 1950) {
                        //console.log('need another hauler in room ' + room.name + ' because container full: ' + containerObj.id);
                        numHaulers += 1;
                    }
                    sourceEnergy += containerObj.store[RESOURCE_ENERGY];
                    //console.log('adding ' + c.store[RESOURCE_ENERGY] + ' to sourceEnergy');
                })
                // this provides a percentage of total if needed in future
                //console.log((sourceEnergy / (sourceContainers.length * 2000) * 100).toFixed(0));

            }
        }
        catch (err) {
            console.log(room.name + " " + err);
        } // end numCreep adjustments


        var enemies = room.find(FIND_HOSTILE_CREEPS);
        // whitelist for nice dude next to me
        if (room.name == 'W27N26') {
            _.remove(enemies, { owner: 'Totalschaden' });
        }
        switch (enemies.length) {
            case 0:
                room.memory.foundHostiles = false;
                break;
            default:
                room.memory.foundHostiles = true;
                prioritySpawn = true;

                break;
        }
        const harvesters = _.filter(roomCreeps, (creep) => creep.memory.role == 'harvester');
        const haulers = _.filter(roomCreeps, (creep) => creep.memory.role == 'hauler');
        const upgraders = _.filter(roomCreeps, (creep) => creep.memory.role == 'upgrader');
        const builders = _.filter(roomCreeps, (creep) => creep.memory.role == 'builder');
        const healers = _.filter(roomCreeps, (creep) => creep.memory.role == 'healer');
        const miners = _.filter(roomCreeps, (creep) => creep.memory.role == 'miner');

        // spawning
        if ((roomOwner == 'MixtySix') && spawn) {
            if (room.memory.foundHostiles && (_.filter(roomCreeps, (creep) => creep.memory.role == 'warrior') < 1)) {
                var newName;
                newName = spawn.createCreep([TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, ATTACK], undefined, { role: 'warrior' });
                console.log('Spawning new WARRIOR in ' + room.name);
            }
            //        console.log('running spawns for ' + room.name);
            if (harvesters.length < numHarvesters) {
                var newName;
                switch (Memory.stage) {
                    case 'start':
                        newName = spawn.createCreep([WORK, WORK, CARRY, MOVE], undefined, { role: 'harvester' });
                        break;
                    default:
                        newName = spawn.createCreep([WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE], undefined, { role: 'harvester' });
                        break;
                }
                prioritySpawn = true;
                console.log('Spawning new harvester in ' + room.name + ': ' + newName);
            }

            if (((haulers.length < numHaulers) && !prioritySpawn) || (haulers.length == 0 && Memory.stage != 'start')) {
                const newName = spawn.createCreep([CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], undefined, { role: 'hauler' });
                prioritySpawn = true;
                console.log('Spawning new hauler in ' + room.name + ': ' + newName);
            }

            if ((upgraders.length < numUpgraders) && !prioritySpawn) {
                var newName;
                switch (Memory.stage) {
                    case 'start':
                        newName = spawn.createCreep([WORK, WORK, CARRY, MOVE], undefined, { role: 'upgrader' });
                        break;
                    default:
                        newName = spawn.createCreep([WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE], undefined, { role: 'upgrader' });
                        break;
                }
                console.log('Spawning new upgrader in ' + room.name + ': ' + newName);
            }

            if ((builders.length < numBuilders) && !prioritySpawn) {
                var newName;
                switch (Memory.stage) {
                    case 'start':
                        newName = spawn.createCreep([WORK, WORK, CARRY, MOVE], undefined, { role: 'builder' });
                        break;
                    default:
                        newName = spawn.createCreep([WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE], undefined, { role: 'builder' });
                        break;
                }
                console.log('Spawning new builder in ' + room.name + ': ' + newName);
            }

            if ((healers.length < numHealers) && !prioritySpawn) {
                const newName = spawn.createCreep([WORK, WORK, CARRY, CARRY, MOVE, MOVE], undefined, { role: 'healer', targetRoom: room.name });
                console.log('Spawning new healer in ' + room.name + ': ' + newName);
            }

            const claimers = _.filter(roomCreeps, (creep) => creep.memory.role == 'claimer');
            if ((claimers.length < numClaimers) && !prioritySpawn) {
                const newName = spawn.createCreep([CLAIM, MOVE], undefined, { role: 'claimer' });
                console.log('Spawning new claimer in ' + room.name + ': ' + newName);
            }

            if ((miners.length < 1) && (room.controller.level >= 6) &&
                (room.find(FIND_MINERALS)[0].mineralAmount > 0) &&
                (room.energyAvailable > (room.energyCapacityAvailable * 0.9))) {
                const newName = spawn.createCreep([WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE ], undefined, { role: 'miner' });
                console.log('Spawning new miner in ' + room.name + ': ' + newName);
            }
        } // end Spawning



        for (i in towers) {
            tower = towers[i];
            /* if(tower.energy < (tower.energyCapacity * 0.7)) {
                Memory.roomMaps[room.name].priorityRefill=true;
            }
            else {
                Memory.roomMaps[room.name].priorityRefill=false;
            } */
            if (!room.memory.foundHostiles && (tower.energy > tower.energyCapacity / 2)) {
                var DamagedStructures = tower.room.find(FIND_STRUCTURES, {
                    filter: (structure) => ((structure.hits < structure.hitsMax) && (structure.hits < 5000))                    
                });
                DamagedStructures.forEach(function(s) {
                    if (s.pos.lookFor(LOOK_FLAGS, {filter: {color: COLOR_RED}}).length > 0) {
                        _.remove(DamagedStructures, s);
                    }
                })
                const closestDamagedStructure = tower.pos.findClosestByRange(DamagedStructures);

                if (closestDamagedStructure) {
                    if (!(closestDamagedStructure == dismantleTarget)) {
                        tower.repair(closestDamagedStructure);
                    }
                }
            }
            else {
                const closestHostile = tower.pos.findClosestByRange(enemies);
                if (closestHostile) {
                    if (tower.pos.getRangeTo(closestHostile) < 12) {
                        tower.attack(closestHostile);
                    }
                }
            }
            if (room.memory.foundHostiles && tower.hits < (tower.hitsMax / 2)) {
                room.needsSafeRoom = true;
            }
        } // end towers


        // Console report
        if ((Game.time % 24) == 0) {
            var msg = '';
            msg = 'Room '.concat(room.name);
            if (roomOwner == 'MixtySix') {
                const RCLprogress = (room.controller.progress / room.controller.progressTotal * 100).toFixed(0);
                msg = msg.concat("(", room.controller.level, "-", RCLprogress, "%): ");
                msg = msg.concat(room.energyAvailable, "/", room.energyCapacityAvailable);
            }
            msg = msg.concat(' Creeps: ', _.size(roomCreeps));
            if (towers.length > 0) {
                msg = msg.concat(" Towers:");
                var tcolor = 'lawngreen';
                towers.forEach(function (t) {
                    if (t.energy < 500) {
                        tcolor = 'salmon';
                    }
                    else {
                        if (t.energy < 700) {
                            tcolor = 'yellow';
                        }
                        else {
                            tcolor = 'lawngreen';
                        }
                    }

                    msg = msg.concat(" <font color='", tcolor, "'>", t.energy, "</font>");
                });
            }
            if (room.storage) {
                var stcolor = 'lawngreen';
                if (room.storage.store[RESOURCE_ENERGY] < 10000) {
                    stcolor = 'salmon'
                }
                else {
                    if (room.storage.store[RESOURCE_ENERGY] < 50000) {
                        stcolor = 'yellow';
                    }
                }
                msg = msg.concat(" Storage: <font color='", stcolor, "'>", room.storage.store[RESOURCE_ENERGY], "</font>");
            }
            msg = msg.concat(" ", harvesters.length, "/", haulers.length, "/", upgraders.length, "/", healers.length, "/", builders.length);
            console.log(msg);
            if ((Game.time % 14400) == 0) {
                Game.notify(msg);
            }
        } // end console report

        // Safe Room
        if (room.memory.foundHostiles) {
            //console.log(room.name + " found hostile creeps!");
            if (roomOwner == 'MixtySix' && spawn) {
                if (spawn.hits < (spawn.hitsMax / 2)) {
                    room.needsSafeRoom = true;
                }
            }
            if (room.needsSafeRoom) {
                console.log(room.name + "needs safe room!!!");
                Game.notify(room.name + 'needs safe room!!!');
            }
        }
        if (room.memory.foundHostiles && room.needsSafeRoom && room.isCapital) {
            if (room.controller.safemode == undefined && room.controller.safeModeAvailable > 0) {
                console.log(room.name + ' activating safe room!');
                Game.notify(room.name + ' activating safe room!');
                room.controller.activateSafeMode();
            }
        } // End safe room


        // renew creeps 
        if (spawn != null) {
            const targetCreeps = spawn.pos.findInRange(FIND_MY_CREEPS, 1);
            if (targetCreeps.length > 0) {
                // console.log('creep in range of spawn in ' +room.name + ': ' + targetCreeps[0].name);
                if (targetCreeps[0].ticksToLive < 900 && targetCreeps[0].ticksToLive > 101) {
                    if (spawn.energy > 150 && !spawn.spawning) {
                        spawn.renewCreep(targetCreeps[0]);
                        //console.log(room.name + ': renewing ' + targetCreeps[0].name + '(' + targetCreeps[0].memory.role + ') with TTL ' + targetCreeps[0].ticksToLive);
                    }
                }
            }
        } // end renew creeps
        labHandler.run(room);
    } // end room loop
    if ((Game.time % 24) == 12) {
        console.log('GCL ' + Game.gcl.level + "-" + ((Game.gcl.progress / Game.gcl.progressTotal) * 100).toFixed(0) + "%");
    }
}