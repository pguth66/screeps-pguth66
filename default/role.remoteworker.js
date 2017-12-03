/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.remoteworker');
 * mod.thing == 'a thing'; // true
 */

var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleHealer = require('role.healer');

var roleRemoteworker = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.ticksToLive == 100 && creep.room.controller.level < 3) {
            const spawn = Game.rooms[creep.memory.spawnRoom].find(FIND_MY_SPAWNS)[0];
            spawn.createCreep([WORK,WORK,WORK,CARRY,MOVE,MOVE],undefined,{role:'remoteworker',targetRoom:creep.room.name});
        }

        switch(creep.pos.y) {
            case 0:
                creep.move(BOTTOM);
                break;
            case 49:
                creep.move(TOP);
                break;
        }

        if(creep.room.controller.my && (creep.room.controller.upgradeBlocked < 1) && (creep.room.controller.ticksToDowngrade < 300 || creep.room.controller.level < 2)) {
            //creep.say('upradering');
            roleUpgrader.run(creep);
            return;
        }
        if(creep.room.find(FIND_CONSTRUCTION_SITES).length > 0) {
            roleBuilder.run(creep);
            return;
        }
        const containers=creep.room.find(FIND_STRUCTURES, {filter: 
            {structureType: STRUCTURE_CONTAINER}});
        //creep.creepLog('containers ' + containers.length);
        const roomCreeps = _.filter(Game.creeps, (c) => { return c.room.name == creep.room.name});
        // creep.creepLog('creeps  ' + roomCreeps.length);
        
        roleHealer.run(creep);

    }
};

module.exports = roleRemoteworker ;