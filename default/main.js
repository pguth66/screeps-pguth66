var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleHealer = require('role.healer');
var roleHauler = require('role.hauler');
var roleClaimer = require('role.claimer');
var roleWarrior = require('role.warrior');
var roleMiner = require('role.miner');
var roleRecycle = require('role.recycle');
var roleInterHauler = require('role.interhauler');
var roleMinHauler = require('role.minhauler');
var roleRemoteworker = require('role.remoteworker');
var roleCalTrans = require('role.caltrans');
var roleVanguard = require('role.vanguard');


module.exports.loop = function () {

    Creep.prototype.creepLog = function (text) {
        console.log(this.name + "-" + this.room.name + ":" + text)
    }

    Memory.roomToClaim = 'W28N26'; // room to send claimers to
    Memory.roomToHelp = 'W28N27'; // room to drop off interroom energy in
    Memory.roomToMaintain = 'W29N28'; // room to keep roads healed in (caltrans)
    Memory.roomToAttack = null; // room to send warriors to
    Memory.roomToBuild = 'W28N26'; // room to send remoteworkers to
    Memory.roomToHarvest = 'W29N28'; // room to harvest energy in (and send interhaulers to)

    Memory.terminal = '59a55cde8f17b94e4e8804e9'; // only one terminal for now

    var dismantleTarget ; //have to define up here so tower code can find it


    // hand create room map for now, note this overwrites the object every tick, so
    // any flags set in code disappear (e.g. priorityRefill)
    Memory.roomMaps = { 
        W28N27: { containers: [ 
                { id: '59b009899eb1db6ba877dfc9', role: 'SOURCE', isSource: true},
                { id: '59adb2825dc96122fd4a927d', role: 'SOURCE', isSource: true},
                { id: '59bff6a0e7f4066bc299d32d', role: 'SOURCE', isSource: true},
                { id: '59a256249cb73d4b2b3567b3', role: 'SINK', isSource: false, isStorage: true} // Storage 
            ],
            links: [
                {id: '59b21b672219c436e2e873b2', role: 'SINK', isSource: false},
                {id: '59b23adaf2830629b52d5a3d', role: 'SOURCE', isSource: true}
            ]
        } ,
        W27N27: {containers: [ 
                { id: '599b7d776ab60d4e2bc5aa9d', role: 'SOURCE', isSource: true},
                { id: '599bd2f7e82f6d79eb4e4571', role: 'SOURCE', isSource: true},
                { id: '59acf60b17856d163132ae42', role: 'SOURCE', isSource: true},
                { id: '59a56008c0cfdb0fb88a4a3e', role: 'SOURCE', isSource: true, isMins: true},
                { id: '59a0994324116d15c606624b', role: 'SINK', isSource: false, isStorage: true} // this one is Storage
               ],
            sources: [
                {id: '5982fcceb097071b4adbe20a'},
                {id: '5982fcceb097071b4adbe20c'}
            ],
            links: [
                {id: '59a7ba769c3a583afe47f9c1', role: 'SINK', isSource: false},
                {id: '59a7afe5587da815c0f44549', role: 'SOURCE', isSource: true}
            ],
            isCapital: true
        },
        W28N28: { containers: [
               // {id: '59a83cc7d0cf536b565f9da9', role:'SOURCE', isSource: true},
                {id: '59acf2a0202e1464bc31ab49', role: 'SOURCE', isSource: true}, 
                {id: '59a90288d14c6603ae1b5bef', role:'SINK', isSource: false},
                {id: '59ce8ab93c09f43aecc417f2', role: 'SOURCE', isSource:true},
                {id: '59b45fdfcf43cf6370ee5f6a', role: 'SOURCE', isSource: true}, // minerals
                {id: '59ab3a8937e7dd0cb4fa63d8', role:'SINK', isSource:false, isStorage: true} // Storage
            ],
            links: [
                { id: '59ae3ac6e95a3b294291fb39', role: 'SINK', isSource: false},
                { id: '59ae504c6ca5c63ba48b09ca', role: 'SOURCE', isSource: true}
            ]
        },
        W29N28: { containers: [
                {id: '59c9d03eed61d34a0f15af96', role: 'SOURCE', isSource:true},
                {id: '59c894489085db6a859e96b7', role: 'SOURCE', isSource:true}

        ],
            links: [
            ]
        },
        W29N29: { containers: [
                {id: '59bff7c1c34ea21ac8fbb55a', role: 'SOURCE', isSource:true},
                {id: '59c6c9b4f8316c63aa837f54', role: 'SOURCE', isSource:true},
              {id: '59c000f34cbe956bd03ce850', role: 'SOURCE', isSource:true},
                {id: '59bc4a940c06b0220c547d5c', role: 'SINK', isSource:false, isStorage: true} // Storage
            ],
            links: [
                {id: '59be9dca69be3c422cbeb4fc', role: 'SINK', isSource:false},
                {id: '59be996f5a9d6d2344a8150d', role: 'SOURCE', isSource: true}
            ]
        },
        W27N26: { containers: [
                { id: '599c884cb9f1167d3f68eec1',role: 'SOURCE', isSource:true}
        ]},
        W28N26: { containers: [
                    {id: '59cc98207842056736894ad3', role: 'SOURCE', isSource:true},
                    { id: '59cd0cb9b0741a5fcf2fb961', role: 'SOURCE', isSource:true},
                    { id: '59ce54cd5ce8282a254f22ff', role: 'SINK', isSink:true, isStorage:true}
        ],
                    links: []},
        sim: { containers: [ ] }
    }

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            //console.log('Clearing non-existing creep memory:', name);
        }
    }

    const numMinHaulers = _.filter(Game.creeps, (c) => { return c.memory.role == 'minhauler'}).length;
    if (Memory.spawnCaltrans > 0) {
        Memory.spawnCaltrans -= 1
    }
    else {
        if(Memory.spawnCaltrans == 0) {
            Game.spawns['Spawn1'].createCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE],undefined,{role:'caltrans'});
            console.log('spawning caltrans and setting memory to null');
            Memory.spawnCaltrans = null;
        }
        else {
            const numCaltrans = _.filter(Game.creeps, (c) => { return c.memory.role == 'caltrans'}).length;
            if(numCaltrans < 1) {
                Memory.spawnCaltrans = 400 ;
            }
        }
    }
    //console.log(numMinHaulers.length + " mineral haulers");

    //const capitalCity = _.filter(Memory.roomMaps, (r) => {return r.isCapital});
    //console.log('capital is in '+ JSON.stringify(capitalCity, null, 4));

    // minhaulers aren't per room but global so they spawn outside the room loops
    if(numMinHaulers < 1) {
        Game.spawns['Spawn1'].createCreep([CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE],undefined,{role:'minhauler'});
    }



    for (i in Game.rooms) {
        const room = Game.rooms[i];
        // console.log("running for room " + room.name);

        // for now assuming there is only one spawn per room
        const spawn = room.find(FIND_MY_SPAWNS)[0];
        const towers = room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}} );

        var prioritySpawn = false; // used to prioritize spawning of harvesters when multiple creeps are needed
        
        Memory.noBuild = false ; // used to flag when there are no construction sites, to prevent spawning builders
        switch(room.controller.level) {
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
        if(room.energyAvailable < 700) {
            Memory.stage = 'start';
           // prioritySpawn = true;
        }

        var roomOwner = undefined; 
        try {
            roomOwner = room.controller.owner.username;
        }
        catch(err) {
        // console.log(err);
        } 
        room.numSpawns = room.find(FIND_SOURCES).length;
        //    console.log("room " + room.name + "has " + room.numSpawns + "spawns.");
        
        try {
            if(roomOwner == 'MixtySix') {
                room.numContainers = Memory.roomMaps[room.name].containers.length;
                room.numLinks = Memory.roomMaps[room.name].links.length;
                //console.log(room.name + ' has storage ' + room.storage.id);
                for (i in towers) {
                    tower = towers[i];    
                    if(tower.energy < (tower.energyCapacity * 0.7)) {
                        Memory.roomMaps[room.name].priorityRefill=true;
                    }
                    else {
                        Memory.roomMaps[room.name].priorityRefill=false;
                    }
                }
                if(spawn && spawn.spawning) {
                    var spawningCreep = Game.creeps[spawn.spawning.name];
                    spawn.room.visual.text(
                        '🛠️' + spawningCreep.memory.role,
                        spawn.pos.x + 1,
                        spawn.pos.y,
                        {align: 'left', opacity: 0.8});
                }
                try{
                    const sourceLinkObj = _.filter(Memory.roomMaps[room.name].links,  (l) => l.role == 'SINK')[0] ;
                    if(sourceLinkObj) {
                        sourceLink = Game.getObjectById(sourceLinkObj.id);  
                        if (sourceLink.energy > (sourceLink.energyCapacity / 2)) {
                            const targetLink = Game.getObjectById(_.filter(Memory.roomMaps[room.name].links, (l) => l.role == 'SOURCE')[0].id) ;
                            if(targetLink.energy < targetLink.energyCapacity && sourceLink.cooldown < 1) {
                                sourceLink.transferEnergy(targetLink);
                                // console.log(room.name + ': transfer from link ' + sourceLink.id + ' to ' + targetLink.id);
                            }
                        }              
                    }
                    // console.log(room.name + sourceLink.id);
                }
                catch(err) {
                    console.log(room.name + ": Error finding source link - " + err);
                }
            }
        }
        catch(err) {
            console.log(err);
        }
        //console.log("room " + room.name + "has " + room.numContainers + " containers.");

        // grab an arry of all creeps in this room
        const roomCreeps = _.filter(Game.creeps, function(creep) { return creep.room.name == room.name}) ;

        const creepRoles = [ { role: 'harvester', run: roleHarvester.run },
                            {role: 'upgrader', run: roleUpgrader.run },
                            {role: 'healer', run: roleHealer.run},
                            {role: 'hauler', run: roleHauler.run},
                            {role: 'claimer', run: roleClaimer.run},
                            {role: 'warrior', run: roleWarrior.run},
                            {role: 'builder', run: roleBuilder.run},
                            {role: 'recycle', run: roleRecycle.run},
                            {role: 'miner', run: roleMiner.run},
                            {role: 'interhauler', run: roleInterHauler.run},
                            {role: 'minhauler', run: roleMinHauler.run},
                            {role: 'caltrans', run: roleCalTrans.run},
                            {role: 'vanguard', run: roleVanguard.run},
                            {role: 'remoteworker', run: roleRemoteworker.run}
                         ] ;
    //    console.log('role: ' + creepMap[0].role + " function: " + creepMap[0].run);
        
        
        // loop over creeps in room, have them run the right role based on creepRoles
        for(var name in roomCreeps) {  
            var creep = roomCreeps[name];
            for(i=0; i < creepRoles.length; i++) {
                if(creep.memory.role == creepRoles[i].role) {
                    creepRoles[i].run(creep);
                }
            }   
        }

        
        try {
            dismantleCreep = _.filter(Game.creeps, (c) => { return c.memory.role == 'dismantle'})[0];
            // dismantleCreep = Game.creeps['Tristan'];
            dismantleFlags = room.find(FIND_FLAGS, {filter: {color: COLOR_RED}});
            if((dismantleFlags.length > 0) && dismantleCreep) {
                dismantleTargets = dismantleFlags[0].pos.lookFor(LOOK_STRUCTURES);
                if(dismantleTargets.length == 0) {
                    dismantleFlags[0].remove();
                }
                //console.log(room.name + dismantleTargets[0]);
            
                // should make this into an array, then towers can iterate over it and if it's empty won't cause problems
                if(dismantleTargets.length > 0) {
                    dismantleTarget = dismantleTargets[0];
                    const depositTarget = Game.getObjectById('59a90288d14c6603ae1b5bef');

                    if(dismantleCreep.carry[RESOURCE_ENERGY] == dismantleCreep.carryCapacity) {
                        if(dismantleCreep.transfer(depositTarget,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            dismantleCreep.moveTo(depositTarget);
                        }
                    }
                    else {
                        if(dismantleCreep.dismantle(dismantleTarget) == ERR_NOT_IN_RANGE) {
                            dismantleCreep.moveTo(dismantleTarget);
                        }

                    }
                }
            }
        }
        catch(err) {
            console.log(creep.name + room.name + ": " + err);
        }

        // start stage defaults
       switch(room.controller.level) {
        case 0:
        case 1:
        case 2:
            var numHaulers = 0;
            break;
        default:
            var numHaulers = 1;
       }
        var numHarvesters = 2 ;
        var numUpgraders = 1 ;
        var numBuilders = 3;
        var numHealers = 0 ;
        var numClaimers = 0 ;

        if (Memory.stage == 'later') {
            numHaulers = room.numContainers  - room.numLinks ;
            if (numHaulers < 1) { 
                numHaulers = 1;
            }
            numHarvesters = room.numSpawns ;
            numBuilders = numHarvesters ;
            numUpgraders = 1 ;
            numHealers = 1 ;
            numClaimers = 0 ;
        }

        room.storageObj = _.filter(Memory.roomMaps[room.name].containers, ('isStorage'))[0];
        if(room.storageObj) {
            room.storage = Game.getObjectById(room.storageObj.id);
            if (room.storage.store[RESOURCE_ENERGY] < 2000) {
                numBuilders -= 1;
               // console.log(room + " has no energy in storage, reducing numBuilders to " + numBuilders);
            }
            if (room.storage.store[RESOURCE_ENERGY] > 150000) {
                numBuilders += 1;
            }
        }
    

        const enemies = room.find(FIND_HOSTILE_CREEPS);
        switch (enemies.length) {
            case 0:
                room.memory.foundHostiles = false;
                break;
            default:
                room.memory.foundHostiles = true;
                prioritySpawn = true;

                break;
        }
        

        if ((roomOwner == 'MixtySix') && spawn) {
            if(room.memory.foundHostiles && (_.filter(roomCreeps, (creep) => creep.memory.role == 'warrior') < 1)) {
                var newName ; 
                newName = spawn.createCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,MOVE,ATTACK], undefined, {role: 'warrior'});
                console.log('Spawning new WARRIOR in ' + room.name);
            }
    //        console.log('running spawns for ' + room.name);
        const harvesters = _.filter(roomCreeps, (creep) => creep.memory.role == 'harvester');
        if(harvesters.length < numHarvesters) {
            var newName ;
            switch (Memory.stage) {
                case 'start':
                    newName = spawn.createCreep([WORK,WORK,CARRY,MOVE], undefined, {role: 'harvester'});
                    break ;
                default:
                    newName = spawn.createCreep([WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE], undefined, {role: 'harvester'});
                    break ; 
            }
            prioritySpawn = true;
            console.log('Spawning new harvester in ' + room.name + ': ' + newName);
        }

        const haulers = _.filter(roomCreeps, (creep) => creep.memory.role == 'hauler');
        if(((haulers.length < numHaulers) && !prioritySpawn) || (haulers.length == 0 && Memory.stage != 'start') ) {
            const newName = spawn.createCreep([CARRY,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'hauler'});
            prioritySpawn = true;
            console.log('Spawning new hauler in ' + room.name + ': ' + newName);
        }

        const upgraders = _.filter(roomCreeps, (creep) => creep.memory.role == 'upgrader');
        if((upgraders.length < numUpgraders) && !prioritySpawn) {
            var newName ;
            switch (Memory.stage) {
                case 'start':
                    newName = spawn.createCreep([WORK,WORK,CARRY,MOVE], undefined, {role: 'upgrader'});
                    break;
                default:
                    newName = spawn.createCreep([WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'upgrader'});
                    break;
            }
            console.log('Spawning new upgrader in ' + room.name + ': ' + newName);
        }
        
        const builders = _.filter(roomCreeps, (creep) => creep.memory.role == 'builder');
        if((builders.length < numBuilders) && !prioritySpawn ) {
            var newName;
            switch (Memory.stage) {
                case 'start':
                    newName = spawn.createCreep([WORK,WORK,CARRY,MOVE], undefined, {role: 'builder'});
                    break;
                default:
                    newName = spawn.createCreep([WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'builder'});
                    break;
            }
            console.log('Spawning new builder in ' + room.name + ': ' + newName);
        }

        
        const healers = _.filter(roomCreeps, (creep) => creep.memory.role == 'healer');
        if ((healers.length < numHealers) && !prioritySpawn) {
            const newName = spawn.createCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'healer'});
            console.log('Spawning new healer in ' + room.name + ': ' + newName);
        }
    
        const claimers = _.filter(roomCreeps, (creep) => creep.memory.role == 'claimer');
        if ((claimers.length < numClaimers) && !prioritySpawn) {
            const newName = spawn.createCreep([CLAIM,MOVE], undefined, {role: 'claimer'});
            console.log('Spawning new claimer in ' + room.name + ': ' + newName);
        }

        const miners = _.filter(roomCreeps, (creep) => creep.memory.role == 'miner');
        if ((miners.length < 1) && (room.controller.level >= 6) &&
            (room.find(FIND_MINERALS)[0].mineralAmount > 0) &&
            (room.energyAvailable == room.energyCapacityAvailable)) {
            const newName = spawn.createCreep([WORK,WORK,WORK,WORK,CARRY,MOVE], undefined, {role: 'miner'});
            console.log('Spawning new miner in ' + room.name + ': ' + newName);
        }
        } // end Spawning
    


        for (i in towers) {
            tower = towers[i];    
            if(tower.energy < (tower.energyCapacity * 0.7)) {
                Memory.roomMaps[room.name].priorityRefill=true;
            }
            else {
                Memory.roomMaps[room.name].priorityRefill=false;
            }
            if(!room.memory.foundHostiles && (tower.energy > tower.energyCapacity / 2)) {    
                const closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => ((structure.hits < structure.hitsMax) && (structure.hits < 5000 ) )
                    });
            
                if(closestDamagedStructure) {
                        if(!(closestDamagedStructure == dismantleTarget)) {
                        tower.repair(closestDamagedStructure);
                        }
                }
            }
            else {
                const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if(closestHostile) {
                    if(tower.pos.getRangeTo(closestHostile) < 12) {
                    tower.attack(closestHostile);
                    }
                }
            }
            if(room.memory.foundHostiles && tower.hits < (tower.hitsMax / 2)) {
                room.needsSafeRoom = true;
            }
        } // end towers


        // Console report
        if ((Game.time % 24) == 0) {
            var msg = '';
            msg = 'Room '.concat(room.name, "(", room.controller.level, "): ");
            msg = msg.concat(room.energyAvailable, "/", room.energyCapacityAvailable);
            msg = msg.concat(' Creeps: ', _.size(roomCreeps));
            if (towers.length > 0) {
                msg = msg.concat(" Towers:");
                var tcolor='green';
                towers.forEach(function(t) {
                    if(t.energy < 500) {
                        tcolor='red';
                    }
                    else {
                        if(t.energy < 700) {
                            tcolor='yellow';
                        }
                    }
                    msg = msg.concat(" <font color='",tcolor,"'>",t.energy,"</font>");
                });
            if(room.storage) {
                var stcolor='green';
                if(room.storage.store[RESOURCE_ENERGY] < 10000) {
                    stcolor='red'
                } 
                else {
                    if(room.storage.store[RESOURCE_ENERGY] < 50000) {
                        stcolor='yellow';
                    }
                }
                msg = msg.concat(" Storage: <font color='",stcolor,"'>",room.storage.store[RESOURCE_ENERGY],"</font>");
            }
          //  console.log('Room ' + room.name + '(' + room.controller.level + '): ' + 
          //      room.energyAvailable + '/' + room.energyCapacityAvailable + 
          //      ' Creeps: ' + _.size(roomCreeps) + ' Tower: ' +
          //     tower.energy + '/' + tower.energyCapacity);
            }
            else {
           //     console.log('Room ' + room.name + '(' + room.controller.level + '): ' + 
           //     room.energyAvailable + '/' + room.energyCapacityAvailable + 
           //     ' Creeps: ' + _.size(roomCreeps));
            }
            console.log(msg);            
        } // end console report
        
        // Safe Room
        if (room.memory.foundHostiles) {
            //console.log(room.name + " found hostile creeps!");
            if(roomOwner == 'MixtySix' && spawn) {
                if(spawn.hits < (spawn.hitsMax / 2)) {
                    room.needsSafeRoom = true;
                }
            }
            if(room.needsSafeRoom) {
                console.log(room.name + "needs safe room!!!");
                Game.notify(room.name + 'needs safe room!!!');
            }
        }
        if(room.memory.foundHostiles && room.needsSafeRoom && room.isCapital) {
            if(room.controller.safemode == undefined && room.controller.safeModeAvailable > 0) {
                console.log(room.name + ' activating safe room!');
                room.controller.activateSafeMode();
            }
        } // End safe room


        // renew creeps 
        if(spawn != null) {
            targetCreeps = spawn.pos.findInRange(FIND_MY_CREEPS, 1);
            if(targetCreeps.length > 0) {
                // console.log('creep in range of spawn in ' +room.name + ': ' + targetCreeps[0].name);
                if(targetCreeps[0].ticksToLive < 600 && targetCreeps[0].ticksToLive > 101) {
                    if(spawn.energy > 150 && !spawn.spawning) {
                        spawn.renewCreep(targetCreeps[0]);
                        console.log(room.name + ': renewing ' + targetCreeps[0].name + '(' + targetCreeps[0].memory.role + ') with TTL ' + targetCreeps[0].ticksToLive);
                    }
                }
            }
        } // end renew creeps
    } // end room loop
}