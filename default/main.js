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


module.exports.loop = function () {

    Memory.roomToClaim = 'W29N29'; // room to send claimers to
    Memory.roomToHelp = 'W28N27'; // room to drop off interroom energy in

    Memory.terminal = '59a55cde8f17b94e4e8804e9'; // only one terminal for now

    // hand create room map for now
    Memory.roomMaps = { 
        W28N27: { containers: [ 
                { id: '59b009899eb1db6ba877dfc9', role: 'SOURCE', isSource: true},
                { id: '59adb2825dc96122fd4a927d', role: 'SOURCE', isSource: true},
                { id: '599dda3dfa93cd1619f05757', role: 'SINK', isSource: false},
                { id: '59a256249cb73d4b2b3567b3', role: 'SINK', isSource: false} // Storage 
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
                { id: '599c644ca6502f209b65e8a1', role: 'SINK', isSource: false},
                { id: '59a0994324116d15c606624b', role: 'SOURCE', isSource: true} // this one is Storage
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
                {id: '59a83cc7d0cf536b565f9da9', role:'SOURCE', isSource: true},
                {id: '59acf2a0202e1464bc31ab49', role: 'SOURCE', isSource: true}, 
                {id: '59b009899eb1db6ba877dfc9', role: 'SOURCE', isSource: true},
                {id: '59a90288d14c6603ae1b5bef', role:'SINK', isSource: false},
                {id: '59b45fdfcf43cf6370ee5f6a', role: 'SOURCE', isSource: true}, // minerals
                {id: '59ab3a8937e7dd0cb4fa63d8', role:'SOURCE', isSource:true} // Storage
            ],
            links: [
                { id: '59ae3ac6e95a3b294291fb39', role: 'SINK', isSource: false},
                { id: '59ae504c6ca5c63ba48b09ca', role: 'SOURCE', isSource: true}
            ]
        },
        W29N28: { containers: [

        ],
            links: [
            ]
        },
        W29N29: { containers: [
                {id: '59bff7c1c34ea21ac8fbb55a', role: 'SOURCE', isSource:true},
              {id: '59c000f34cbe956bd03ce850', role: 'SOURCE', isSource:true},
                {id: '59bc4a940c06b0220c547d5c', role: 'SINK', isSource:false} // Storage
            ],
            links: [
                {id: '59be9dca69be3c422cbeb4fc', role: 'SINK', isSource:false},
                {id: '59be996f5a9d6d2344a8150d', role: 'SOURCE', isSource: true}
            ]
        },
        sim: { containers: [ ] }
    }

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    const numMinHaulers = _.filter(Game.creeps, (c) => { return c.memory.role == 'minhauler'});
    //console.log(numMinHaulers.length + " mineral haulers");

    //const capitalCity = _.filter(Memory.roomMaps, (r) => {return r.isCapital});
    //console.log('capital is in '+ JSON.stringify(capitalCity, null, 4));

    if(numMinHaulers < 2) {
        Game.spawns['Spawn1'].createCreep([CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE],undefined,{role:'minhauler'});
    }

    for (i in Game.rooms) {
        const room = Game.rooms[i];
        // console.log("running for room " + room.name);

        // for now assuming there is only one spawn per room
        const spawn = room.find(FIND_MY_SPAWNS)[0];
        const towers = room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}} );

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
        if(room.energyCapacityAvailable < 600) {
            Memory.stage = 'start';
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
                            {role: 'remoteworker', run: roleRemoteworker.run}
                         ] ;
    //    console.log('role: ' + creepMap[0].role + " function: " + creepMap[0].run);
        
        var prioritySpawn = false; // used to prioritize spawning of harvesters when multiple creeps are needed
        
        // loop over creeps in room, have them run the right role based on creepRoles
        for(var name in roomCreeps) {  
            var creep = roomCreeps[name];
            for(i=0; i < creepRoles.length; i++) {
                if(creep.memory.role == creepRoles[i].role) {
                    creepRoles[i].run(creep);
                }
            }   
        }

        /*
        try {
dismantleCreep = Game.creeps['Adam'];

 if(dismantleCreep.carry[RESOURCE_ENERGY] == dismantleCreep.carryCapacity) {
    dismantleCreep.moveTo(38,29);
    dismantleCreep.transfer(Game.getObjectById('599dda3dfa93cd1619f05757'),RESOURCE_ENERGY);
}
else {
    dismantleCreep.moveTo(27,34);
//    dismantleCreep.moveTo(Game.getObjectById('59a0604216e4711f10d03fb3'));
    dismantleCreep.dismantle(Game.getObjectById('59a0604216e4711f10d03fb3'));

}
        }
        catch(err) {
            console.log(creep.name + room.name + ": " + err);
        }
*/
        // start stage defaults
        var numHaulers = 0;
        var numHarvesters = 2 ;
        var numUpgraders = 1 ;
        var numBuilders = 4;
        var numHealers = 0 ;
        var numClaimers = 0 ;

        if (Memory.stage == 'later') {
            numHaulers = room.numContainers  - room.numLinks ;
            if (numHaulers < 1) { 
                numHaulers = 1;
            }
            numHarvesters = room.numSpawns ;
            numBuilders = (numHarvesters * 2) -1 ;
            numUpgraders = 1 ;
            numHealers = 1 ;
            numClaimers = 0 ;
        }

        if(room.controller.level == 7) {
            numBuilders = 2;
        }

        const enemies = room.find(FIND_HOSTILE_CREEPS);
        switch (enemies.length) {
            case 0:
                room.memory.foundHostiles = false;
                break;
            default:
                room.memory.foundHostiles = true;
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
        if((haulers.length < numHaulers) && !prioritySpawn) {
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
            const newName = spawn.createCreep([WORK,WORK,MOVE,MOVE,CARRY,CARRY], undefined, {role: 'healer'});
            console.log('Spawning new healer in ' + room.name + ': ' + newName);
        }
    
        const claimers = _.filter(roomCreeps, (creep) => creep.memory.role == 'claimer');
        if ((claimers.length < numClaimers) && !prioritySpawn) {
            const newName = spawn.createCreep([CLAIM,MOVE], undefined, {role: 'claimer'});
            console.log('Spawning new claimer in ' + room.name + ': ' + newName);
        }

        const miners = _.filter(roomCreeps, (creep) => creep.memory.role == 'miner');
        if ((miners.length < 1) && (room.controller.level >= 6) &&
            (room.find(FIND_MINERALS)[0].mineralAmount > 0)) {
            const newName = spawn.createCreep([WORK,WORK,WORK,WORK,MOVE,CARRY], undefined, {role: 'miner'});
            console.log('Spawning new miner in ' + room.name + ': ' + newName);
        }
        } // end Spawning
    


        for (i in towers) {
            tower = towers[i];    
            if(!room.memory.foundHostiles && (tower.energy > tower.energyCapacity / 2)) {    
                const closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => ((structure.hits < structure.hitsMax) && (structure.hits < 5000 ) )
                    });
            
                if(closestDamagedStructure) {
                    if(!(closestDamagedStructure.id == '59a0604216e4711f10d03fb3')) {
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
            if (towers.length > 0) {
            console.log('Room ' + room.name + '(' + room.controller.level + '): ' + 
                room.energyAvailable + '/' + room.energyCapacityAvailable + 
                ' Creeps: ' + _.size(roomCreeps) + ' Tower: ' +
                tower.energy + '/' + tower.energyCapacity);
            }
            else {
                console.log('Room ' + room.name + '(' + room.controller.level + '): ' + 
                room.energyAvailable + '/' + room.energyCapacityAvailable + 
                ' Creeps: ' + _.size(roomCreeps));
            }
        }
        if (room.memory.foundHostiles) {
            console.log(room.name + " found hostile creeps!");
            if(spawn.hits < (spawn.hitsMax / 2)) {
                room.needsSafeRoom = true;
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
        } // end console report


        // renew creeps 
        if(spawn != null) {
            targetCreeps = spawn.pos.findInRange(FIND_MY_CREEPS, 1);
            if(targetCreeps.length > 0) {
                // console.log('creep in range of spawn in ' +room.name + ': ' + targetCreeps[0].name);
                if(targetCreeps[0].ticksToLive < 600 && targetCreeps[0].ticksToLive > 101) {
                    if(spawn.energy > 150 && !spawn.spawning) {
                        spawn.renewCreep(targetCreeps[0]);
                        console.log(room.name + ': renewing ' + targetCreeps[0].name + ' with TTL ' + targetCreeps[0].ticksToLive);
                    }
                }
            }
        } // end renew creeps
    } // end room loop
}