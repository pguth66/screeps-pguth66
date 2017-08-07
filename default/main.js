var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleHealer = require('role.healer');
var roleHauler = require('role.hauler');

module.exports.loop = function () {

    Memory.noBuild = false ; // used to flag when there are no construction sites, to prevent spawning builders
    
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    
    var prioritySpawn = false; // used to prioritize spawning of harvesters when multiple creeps are needed
    
        for(var name in Game.creeps) {
        var creep = Game.creeps[name];
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
    }
    const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    if(harvesters.length < 3) {
        // WORKx3, CARRYx2, MOVEx1 costs 450
        const newName = Game.spawns['Spawn1'].createCreep([WORK,WORK,CARRY,CARRY,WORK,MOVE], undefined, {role: 'harvester'});
        prioritySpawn = true;
        console.log('Spawning new harvester: ' + newName);
    }
    const haulers = _.filter(Game.creeps, (creep) => creep.memory.role == 'hauler');
    if(haulers.length < 3) {
        const newName = Game.spawns['Spawn1'].createCreep([CARRY,CARRY,MOVE,MOVE], undefined, {role: 'hauler'});
        prioritySpawn = true;
        console.log('Spawning new hauler: ' + newName);
    }
    const upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    if((upgraders.length < 4) && !prioritySpawn) {
        const newName = Game.spawns['Spawn1'].createCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'upgrader'});
        console.log('Spawning new upgrader: ' + newName);
    }
    
    const builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    if((builders.length < 4) && !prioritySpawn && !Memory.noBuild) {
        const newName = Game.spawns['Spawn1'].createCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'builder'});
        console.log('Spawning new builder: ' + newName);
    }
    
    const healers = _.filter(Game.creeps, (creep) => creep.memory.role == 'healer');
    if ((healers.length < 2) && !prioritySpawn) {
        const newName = Game.spawns['Spawn1'].createCreep([WORK,WORK,MOVE,MOVE,CARRY], undefined, {role: 'healer'});
        console.log('Spawning new healer: ' + newName);
    }
    
    if(Game.spawns['Spawn1'].spawning) {
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1,
            Game.spawns['Spawn1'].pos.y,
            {align: 'left', opacity: 0.8});
    }
    var tower = Game.getObjectById('31615f8aa25d12780dc1c62e');
    if(tower) {
                var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }
        
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }
    }
    

}