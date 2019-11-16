var creepHandler = require('creepHandler');
var harvestRole = require('func.harvestRoles');
var labHandler = require('labHandler');
var marketHandler = require('marketHandler');
var roomHandler = require('roomHandler');
var diplomacy = require('diplomacy');

module.exports.loop = function () {

    Memory.roomToClaim = 'W28N26'; // room to send claimers to
    Memory.roomToHelp = 'W29N26'; // room to drop off interroom energy in
    Memory.roomToMaintain = 'W27N25'; // room to keep roads healed in (caltrans)
    Memory.roomToAttack = null; // room to send warriors to
    Memory.roomToBuild = 'W27N26'; // room to send remoteworkers to
    Memory.roomToHarvest = null; // room to harvest energy in (and send interhaulers to)
    Memory.roomsToObserve = ['W30N20', 'W31N35', 'W29N24', 'W33N34', 'W31N25', 'W31N36', 'W31N37', 'W28N29' , 'W30N29', 'W30N30', 'W26N27', 'W26N26', 'W26N25', 'W31N33'];
    Memory.capitol='W27N27';

    Memory.terminal = '59a55cde8f17b94e4e8804e9'; // only one terminal for now
    
    /**
     * returns current GCL level as a string formatted for output
     * @returns {string} Current GCL 
     */
    function printGCL () {
        //console.log('GCL ' + Game.gcl.level + "-" + ((Game.gcl.progress / Game.gcl.progressTotal) * 100).toFixed(0) + "%");
        var string = 'GCL' + Game.gcl.level + "-" + ((Game.gcl.progress / Game.gcl.progressTotal) * 100).toFixed(0) + "%";
        return string;
    }

    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            //console.log('Clearing non-existing creep memory:', name);
        }
    }

    if (!Memory.taskID) {
        Memory.taskID = 1;
    }
    
    var numMinHaulers = 0 ;

    if (Object.keys(Game.rooms).length > 2) {
        numMinHaulers = _.filter(Game.creeps, (c) => { return c.memory.role == 'minhauler' }).length;
    }
    else {
        numMinHaulers = 3; // hack to make no minhaulers spawn in local/sim
        //console.log('skipping minHaulers');
    }

    // Harvest room logic
    try {
        if (Memory.roomToHarvest && Memory.roomToHelp) {
            const harvestRoles = ['caltrans', 'harvester', 'interhauler', 'patrol'];
            harvestRoles.forEach(function (role) { harvestRole.run(role, Memory.roomToHarvest, Memory.roomToHelp) });
        }
    }
    catch (err) {
        //console.log('Error running harvest rooms');
    }

    // minhaulers aren't per room but global so they spawn outside the room loops
    //console.log(numMinHaulers.length + " mineral haulers");
    if (numMinHaulers < 1) {
        //Game.rooms[Memory.capitol].addToCreepBuildQueue('minhauler');
//        Game.spawns['Spawn8'].createCreep([CARRY, CARRY, CARRY, CARRY, MOVE, MOVE], undefined, { role: 'minhauler' });
    }

    for (i in Game.rooms) {
        // ALL OF THIS should be in roomHandler
        const room = Game.rooms[i];
        const spawn = room.spawns[0];
        const towers = room.towers;

        roomHandler.handleRoom(room);
        
        if (!Memory.rooms[room.name]) {
            Memory.rooms[room.name] = {};
        }
        // console.log("running for room " + room.name);

        // for now assuming there is only one spawn per room

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

        // run market stuff
        if (room.controller && room.controller.my && room.terminal && (Game.time % 353 == 0)) {
            marketHandler.runMarket(room);
        }
        try {
            if (room.controller && room.controller.my) {
                switch (room.controller.level) {
                    case 0:
                    case 1:
                    case 2:
                        room.memory.stage = 'start';
                        break;
                    default:
                        room.memory.stage = 'later';
                        break;
                }

                // go back to small creeps if we're really low on energy
                if (room.energyAvailable < 700) {
                    room.memory.stage = 'start';
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
                if (Game.time % 57 == 0) {
                    var roomsToObserve = Memory.roomsToObserve;
                    if (roomsToObserve[0]) {
                        const targetRoom = roomsToObserve[0];
                        //console.log(room.name + ' observing room ' + targetRoom)
                        room.observeRoom(targetRoom);
                        roomsToObserve.shift();
                    }
                }
                try {
                    const sourceLinks = _.filter(room.links, (l) => !l.isSource );
                    sourceLinks.forEach(function (sourceLink) {
                        if (sourceLink.energy > (sourceLink.energyCapacity / 2)) {
                            const targetLinks = _.filter(room.links, (l) => l.isSource);
                            sortedTargetLinks = targetLinks.sort((a,b) => { return a.energy - b.energy});
                            targetLink = sortedTargetLinks[0];
                            if (targetLink.energy < targetLink.energyCapacity && sourceLink.cooldown < 1) {
                                sourceLink.transferEnergy(targetLink);
                                //console.log(room.name + ': transfer from link ' + sourceLink.id + ' to ' + targetLink.id);
                            }
                        }
                    })
                    //console.log(room.name + " source link is " + sourceLink + ' with energy ' + sourceLink.energy);
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

        if (room.controller && room.controller.my) {
            // start stage defaults
            var numHaulers=(room.containers.length > 0 ? 1 : 0);
            var numHarvesters = room.numSources;
            var numUpgraders = 1;
            var numBuilders = 3;
            var numHealers = 0;
            var numClaimers = 0;

            if (room.memory.stage == 'later') {
                // this used to be used to try to balance need for haulers before and after building links
                // don't think it was actually helpikng and led to too many haulers at end RCL
                //const adjustmentFactor = (room.numLinks > 1 ? 2 : 0);
                numHaulers = room.numContainers - 1;
                if (numHaulers < 1) {
                    numHaulers = 1;
                }
                numHarvesters = room.numSources;
                numBuilders = 2;
                numUpgraders = 1;
                numHealers = 1;
                numClaimers = 0;
            }
        }

        try {
            if (room.controller && room.controller.my) {
                if (room.storage) {
                    if (room.storage.store[RESOURCE_ENERGY] < 50000) {
                        numBuilders -= 1;
                        // console.log(room + " has no energy in storage, reducing numBuilders to " + numBuilders);
                    }
                    if (room.storage.store[RESOURCE_ENERGY] > 150000) {
                        numBuilders += 1;
                    }
                    if (room.storage.store[RESOURCE_ENERGY] > 350000) {
                        numHealers += 1;
                    }
                    if (room.storage.store[RESOURCE_ENERGY] > 500000) {
                        numHealers += 2;
                    }
                    //console.log('room ' + room.name + ' setting numBuilders to ' + numBuilders);
                }
                //}
                if (room.controller.level == 8) {
                    numBuilders -= 2;
                }
                if (room.memory.wallLevel >  100000000) {
                    numHealers -= 1;
                }
                var sourceContainers = _.filter(room.containers, (c) => c.isSource);
                //console.log(room + ' has ' + sourceContainers.length + ' source containers');
                var sourceEnergy = 0;
                sourceContainers.forEach(function (c) {
                    //console.log('processing ' + c.id);
                    const containerObj = Game.getObjectById(c.id);
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


        var enemies = room.hostileCreeps;
        // whitelist for nice dude next to me
       /* if (room.name == 'W27N26') {
            _.remove(enemies, function (e) { return e.owner.username == 'Totalschaden' });
        }*/

        switch (enemies.length) {
            case 0:
                room.memory.foundHostiles = false;
                break;
            default:
                room.memory.foundHostiles = true;
                prioritySpawn = true;

                break;
        }

        var threatLevel = 0;

        if (room.memory.foundHostiles) {
            threatLevel = room.getThreatLevel();
            //console.log(room.name + " detected threatlevel: " + threatLevel)
        }

        //const harvestersInQueue = _.filter(room.memory.buildQueue, {role: 'harvester'});
        //const totalHarvesters = harvesters.length + harvestersInQueue.length;
        const totalHarvesters = room.getTotalCreeps('harvester').length;
        const totalHaulers = room.getTotalCreeps('hauler').length;
        const totalUpgraders = room.getTotalCreeps('upgrader').length;
        const totalBuilders = room.getTotalCreeps('builder').length;
        const totalHealers = room.getTotalCreeps('healer').length;
        const totalMiners = room.getTotalCreeps('miner').length;

        // spawning
        if ((room.controller && room.controller.my) && spawn) {
            if (room.memory.foundHostiles && (threatLevel > 20) && (_.filter(roomCreeps, (creep) => creep.memory.role == 'warrior') < 1)) {
                var newName;
                newName = spawn.createCreep([TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, ATTACK], undefined, { role: 'warrior' });
                console.log('Spawning new WARRIOR in ' + room.name);
            }
            //        console.log('running spawns for ' + room.name);

            if (totalHarvesters < numHarvesters) {
                room.addToCreepBuildQueue('harvester',{respawn:true});
                prioritySpawn = true;
                console.log('Spawning new harvester in ' + room.name + ': ' + newName);
            }

            if (((totalHaulers < numHaulers) && !prioritySpawn) || (totalHaulers.length == 0 && room.memory.stage != 'start')) {
                room.addToCreepBuildQueue('hauler');
                prioritySpawn = true;
                console.log('Spawning new hauler in ' + room.name + ': ' + newName);
            }

            if ((totalUpgraders < numUpgraders) && !prioritySpawn) {
                room.addToCreepBuildQueue('upgrader');
                console.log('Spawning new upgrader in ' + room.name + ': ' + newName);
            }

            if ((totalBuilders < numBuilders) && !prioritySpawn) {
                room.addToCreepBuildQueue('builder');
                console.log('Spawning new builder in ' + room.name + ': ' + newName);
            }

            if ((totalHealers < numHealers) && !prioritySpawn) {
                room.addToCreepBuildQueue('healer');
                console.log('Spawning new healer in ' + room.name + ': ' + newName);
            }

            const claimers = _.filter(roomCreeps, (creep) => creep.memory.role == 'claimer');
            if ((claimers.length < numClaimers) && !prioritySpawn) {
                const newName = spawn.createCreep([CLAIM, MOVE], undefined, { role: 'claimer' });
                console.log('Spawning new claimer in ' + room.name + ': ' + newName);
            }

            if ((totalMiners < 1) && (room.controller.level >= 6) &&
                (room.minerals[0].mineralAmount > 0) &&
                (room.energyAvailable > (room.energyCapacityAvailable * 0.9))) {
                    room.addToCreepBuildQueue('miner');
                    console.log('Spawning new miner in ' + room.name + ': ' + newName);
            }
        } // end Spawning

        // Console report

        if ((Game.time % 24) == 0) {
            // don't report on rooms I don't own
            if (!(room.controller && room.controller.my)) {
                continue;
            }
            var msg = '';
            msg = 'Room '.concat(room.name);
            const RCLprogress = (room.controller.level < 8) ? (room.controller.progress / room.controller.progressTotal * 100).toFixed(0) : 'NA';
            msg = msg.concat("(", room.controller.level, "-", RCLprogress, "%): ");
            msg = msg.concat(room.energyAvailable, "/", room.energyCapacityAvailable);
            msg = msg.concat(' Creeps: ', _.size(roomCreeps));
            const harvesters = _.filter(roomCreeps, (creep) => creep.memory.role == 'harvester');
            const haulers = _.filter(roomCreeps, (creep) => creep.memory.role == 'hauler');
            const upgraders = _.filter(roomCreeps, (creep) => creep.memory.role == 'upgrader');
            const builders = _.filter(roomCreeps, (creep) => creep.memory.role == 'builder');
            const healers = _.filter(roomCreeps, (creep) => creep.memory.role == 'healer');
            const miners = _.filter(roomCreeps, (creep) => creep.memory.role == 'miner');    
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
                msg = msg.concat(" Storage: <font color='", stcolor, "'>", (room.storage.store[RESOURCE_ENERGY]/1000).toFixed(0), "k</font>");
            }
            if (room.terminal) {
                var tmcolor = 'lawngreen';
                const terminalContents = _.sum(room.terminal.store);
                const terminalEnergy = room.terminal.store[RESOURCE_ENERGY];
                if (terminalContents > 200000) {
                    tmcolor = 'yellow';
                }
                if (terminalContents > 250000) {
                    tmcolor = 'salmon';
                }
                msg = msg.concat(" Terminal: <font color='", tmcolor, "'>", (terminalContents/1000).toFixed(0), "k</font>,", (terminalEnergy/1000).toFixed(0), "k" )
            }
            msg = msg.concat(" ", harvesters.length, "/", haulers.length, "/", upgraders.length, "/", healers.length, "/", builders.length);
            msg = msg.concat(" Walls: ", (room.memory.wallLevel/1000).toFixed(0),'k');
            switch (room.memory.energyState) {
                case 'loading':
                    msg = msg.concat(" L");
                    break;
                case 'unloading':
                    msg = msg.concat(" U");
                    break;
                case 'sending':
                    msg = msg.concat(" S");
                    break;
                default:
            }
            if (room.foundHostiles) {
                msg.concat(' <font color="salmon">HOSTILES</font>');
            }
            console.log(msg);
            if ((Game.time % 14400) == 0) {
                msg.concat(printGCL());
                Game.notify(msg);
            }
        } // end console report

        // Safe Room
        if (room.memory.foundHostiles) {
            //console.log(room.name + " found hostile creeps!");
            if (room.controller && room.controller.my && spawn) {
                if (spawn.hits < (spawn.hitsMax / 2)) {
                    room.needsSafeRoom = true;
                }
            }
            if (room.needsSafeRoom) {
                console.log(room.name + "needs safe room!!!");
                Game.notify(room.name + 'needs safe room!!!');
            }
        }
        if (room.memory.foundHostiles && room.needsSafeRoom) {
            if (room.controller.safemode == undefined && room.controller.safeModeAvailable > 0) {
                console.log(room.name + ' activating safe room!');
                Game.notify(room.name + ' activating safe room!');
                room.controller.activateSafeMode();
            }
        } // End safe room


        // renew creeps 
        /*if (spawn != null && room.energyAvailable > 500) {
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
        */
        labHandler.run(room);
    } // end room loop
    if ((Game.time % 24) == 12) {
        //console.log('GCL ' + Game.gcl.level + "-" + ((Game.gcl.progress / Game.gcl.progressTotal) * 100).toFixed(0) + "%");
        console.log(printGCL());
    }
    
    // diplomacy
    diplomacy.run();
}