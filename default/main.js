var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleHealer = require('role.healer');
var roleHauler = require('role.hauler');
var roleClaimer = require('role.claimer');
var roleWarrior = require('role.warrior');

module.exports.loop = function () {

    Memory.roomToClaim = 'W28N27';

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
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

        if(room.energyCapacityAvailable < 600) {
            Memory.stage = 'start';
        }

        // hand create room map for now
        Memory.roomMaps = { 
            W28N27: { containers: [ 
                { id: '599db1672988077e7d51b7cd', role: 'SOURCE'},
                { id: '59a27936efdfa26afb535d45', role: 'SOURCE'},
                { id: '599dda3dfa93cd1619f05757', role: 'SINK'},
                { id: '59a256249cb73d4b2b3567b3', role: 'SINK'} // Storage 
            ]} ,
            W27N27: {containers: [ 
                { id: '599b7d776ab60d4e2bc5aa9d', role: 'SOURCE'},
                { id: '599bd2f7e82f6d79eb4e4571', role: 'SOURCE'},
                { id: '599c644ca6502f209b65e8a1', role: 'SINK'},
                { id: '59a0994324116d15c606624b', role: 'SINK'} // this one is Storage
            ]} 
        }
//        console.log(roomMap + room.name);

//        Memory.mapRoom = { containers: [ { id: '599db1672988077e7d51b7cd', role: 'SOURCE'} ]};
//        for(c in Memory.mapRoom.containers) {
//            // get the real container object
//            container = Game.getObjectById(Memory.mapRoom.containers[c].id);
//           console.log("container info " + container.id + Memory.mapRoom.containers[c].role);
//        }
        
    room.numSpawns = room.find(FIND_SOURCES).length;
//    console.log("room " + room.name + "has " + room.numSpawns + "spawns.");

    const roomCreeps = _.filter(Game.creeps, function(creep) { return creep.room.name == room.name}) ;

    const creepRoles = [ { role: 'harvester', run: roleHarvester.run },
                        {role: 'upgrader', run: roleUpgrader.run },
                        {role: 'healer', run: roleHealer.run},
                        {role: 'hauler', run: roleHauler.run},
                        {role: 'claimer', run: roleClaimer.run},
                        {role: 'warrior', run: roleWarrior.run},
                        {role: 'builder', run: roleBuilder.run} ] ;
//    console.log('role: ' + creepMap[0].role + " function: " + creepMap[0].run);
    
    var prioritySpawn = false; // used to prioritize spawning of harvesters when multiple creeps are needed
    
    // loop over creeps in room, have them run the right role based on creepRoles
    for(var name in roomCreeps) {  
        var creep = roomCreeps[name];
  //      if(creep.room == room) {
            for(i=0; i < creepRoles.length; i++) {
                if(creep.memory.role == creepRoles[i].role) {
                    creepRoles[i].run(creep);
                }
            }   
 //       }
    }
  // Game.creeps['Ava'].moveTo(Game.spawns['Spawn2'].pos);

 //  Game.creeps['Isaac'].moveTo(24,22);

    // start stage defaults
    var numHaulers = 2;
    var numHarvesters = 2 ;
    var numUpgraders = 1 ;
    var numBuilders = 4;
    var numHealers = 1 ;
    var numClaimers = 0 ;

    if (Memory.stage == 'later') {
        numHaulers = 4 ;
        numHarvesters = (room.numSpawns) + 1 ;
        numBuilders = numHarvesters + 2 ;
        numUpgraders = numHarvesters - 1 ;
        numHealers = 1 ;
        numClaimers = 0 ;
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
    
    var roomOwner = undefined; 
    try {
        roomOwner = room.controller.owner.username;
    }
    catch(err) {
       // console.log(err);
    }
    if ((roomOwner == 'MixtySix') && spawn) {

        if(room.memory.foundHostiles && (_.filter(roomCreeps, (creep) => creep.memory.role == 'warrior') < 1)) {
            var newName ; 
            newName = spawn.createCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,MOVE,ATTACK], undefined, {role: 'warrior'});
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
                newName = spawn.createCreep([WORK,WORK,WORK,CARRY,MOVE], undefined, {role: 'harvester'});
                break ; 
        }
        prioritySpawn = true;
        console.log('Spawning new harvester in ' + room.name + ': ' + newName);
    }

    const haulers = _.filter(roomCreeps, (creep) => creep.memory.role == 'hauler');
    if((haulers.length < numHaulers) && !prioritySpawn) {
        const newName = spawn.createCreep([CARRY,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'hauler'});
        prioritySpawn = true;
        console.log('Spawning new hauler: ' + newName);
    }

    const upgraders = _.filter(roomCreeps, (creep) => creep.memory.role == 'upgrader');
    if((upgraders.length < numUpgraders) && !prioritySpawn) {
        var newName ;
        switch (Memory.stage) {
            case 'start':
                newName = spawn.createCreep([WORK,WORK,CARRY,MOVE], undefined, {role: 'upgrader'});
                break;
            default:
                newName = spawn.createCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'upgrader'});
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
                newName = spawn.createCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'builder'});
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

    if(spawn.spawning) {
        var spawningCreep = Game.creeps[spawn.spawning.name];
        spawn.room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            spawn.pos.x + 1,
            spawn.pos.y,
            {align: 'left', opacity: 0.8});
    }
    for (i in towers) {
        tower = towers[i];    
        if(!room.memory.foundHostiles && (tower.energy > tower.energyCapacity / 2)) {    
            const closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => ((structure.hits < structure.hitsMax) && (structure.hits < 8000 ) )
                });
        
            if(closestDamagedStructure) {
                tower.repair(closestDamagedStructure);
            }
        }
        else {
            const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if(closestHostile) {
                if(tower.pos.getRangeTo(closestHostile) < 6) {
                tower.attack(closestHostile);
                }
            }
        }
    }
    }
    if ((Game.time % 12) == 0) {
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
        if (room.memory.foundHostiles) {
            console.log(room.name + " found hostile creeps!")
        }
    }
    }
}