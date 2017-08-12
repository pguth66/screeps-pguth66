var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleHealer = require('role.healer');
var roleHauler = require('role.hauler');
var roleClaimer = require('role.claimer');
var roleWarrior = require('role.warrior');

module.exports.loop = function () {

    Memory.roomToClaim = 'W47N96';


    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    for (i in Game.rooms) {
        room = Game.rooms[i];
//      console.log("running for room " + room.name);

        // for now assuming there is only one spawn per room
        const spawn = room.find(FIND_MY_SPAWNS)[0];

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

    const roomCreeps = _.filter(Game.creeps, function(creep) { return creep.room.name == 'W46N97'}) ;

    
    var prioritySpawn = false; // used to prioritize spawning of harvesters when multiple creeps are needed
    
        for(var name in roomCreeps) {
        var creep = roomCreeps[name];
        if(creep.room == room) {
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        if(creep.memory.role == 'healer') {
            roleHealer.run(creep);
        }
        if(creep.memory.role == 'hauler') {
            roleHauler.run(creep);
        }
        if(creep.memory.role == 'claimer') {
            roleClaimer.run(creep);
        }
        if(creep.memory.role == 'warrior') {
            roleWarrior.run(creep);
        }
        }
    }
    
    // start stage defaults
    var numHaulers = 0 ;
    var numHarvesters = 3 ;
    var numUpgraders = 2 ;
    var numBuilders = 5 ;
    var numHealers = 0 ;
    var numClaimers = 0 ;

    if (Memory.stage == 'later') {
        numHaulers = 3 ;
        numHarvesters = 3 ;
        numBuilders = 2 ;
        numUpgraders = 2 ;
        numHealers = 1 ;
        numClaimers = 0 ;
    }

    enemies = room.find(FIND_HOSTILE_CREEPS);
    switch (enemies.length) {
        case 0:
            room.memory.foundHostiles = false;
            break;
        default:
            room.memory.foundHostiles = true;
            break;
    }
        
    const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    if(harvesters.length < numHarvesters) {
        var newName ;
        switch (Memory.stage) {
            case 'start':
                newName = spawn.createCreep([WORK,CARRY,MOVE], undefined, {role: 'harvester'});
                break ;
            default:
                newName = spawn.createCreep([WORK,WORK,WORK,CARRY,WORK,MOVE], undefined, {role: 'harvester'});
                break ; 
        }
        prioritySpawn = true;
        console.log('Spawning new harvester: ' + newName);
    }

    const haulers = _.filter(Game.creeps, (creep) => creep.memory.role == 'hauler');
    if(haulers.length < numHaulers) {
        const newName = spawn.createCreep([CARRY,CARRY,MOVE,MOVE], undefined, {role: 'hauler'});
        prioritySpawn = true;
        console.log('Spawning new hauler: ' + newName);
    }

    const upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    if((upgraders.length < numUpgraders) && !prioritySpawn) {
        var newName ;
        switch (Memory.stage) {
            case 'start':
                newName = spawn.createCreep([WORK,CARRY,MOVE], undefined, {role: 'upgrader'});
                break;
            default:
                newName = spawn.createCreep([WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'upgrader'});
                break;
        }
        console.log('Spawning new upgrader: ' + newName);
    }
    
    const builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    if((builders.length < numBuilders) && !prioritySpawn ) {
        var newName;
        switch (Memory.stage) {
            case 'start':
                newName = spawn.createCreep([WORK,CARRY,MOVE], undefined, {role: 'builder'});
                break;
            default:
                newName = spawn.createCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'builder'});
                break;
        }
        console.log('Spawning new builder: ' + newName);
    }
    
    const healers = _.filter(Game.creeps, (creep) => creep.memory.role == 'healer');
    if ((healers.length < numHealers) && !prioritySpawn) {
        const newName = spawn.createCreep([WORK,WORK,MOVE,MOVE,CARRY], undefined, {role: 'healer'});
        console.log('Spawning new healer: ' + newName);
    }
   
    const claimers = _.filter(Game.creeps, (creep) => creep.memory.role == 'claimer');
    if ((claimers.length < numClaimers) && !prioritySpawn) {
        const newName = spawn.createCreep([CLAIM,MOVE], undefined, {role: 'claimer'});
        console.log('Spawning new claimer: ' + newName);
    }

    if(spawn.spawning) {
        var spawningCreep = Game.creeps[spawn.spawning.name];
        spawn.room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            spawn.pos.x + 1,
            spawn.pos.y,
            {align: 'left', opacity: 0.8});
    }
    var tower = Game.getObjectById('5987dce11fd19d5d4cb9f894');
    if(tower) {
            var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => ((structure.hits < structure.hitsMax) && (structure.hits < 100000 ) )
        });
        if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }
        
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }
    }
    if ((Game.time % 5) == 0) {
        console.log('Room ' + room.name + '(' + room.controller.level + '): ' + 
            room.energyAvailable + '/' + room.energyCapacityAvailable + 
            ' Creeps: ' + _.size(roomCreeps) + ' Tower: ' +
            tower.energy + '/' + tower.energyCapacity);
    }
    }
}