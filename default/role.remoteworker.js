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

        // use respawn instead
        //if(creep.ticksToLive == 100 && creep.room.controller.level < 3) {
        //    Game.rooms[creep.memory.spawnRoom].addToCreepBuildQueue('remoteworker');
        //}

        switch(creep.pos.y) {
            case 0:
                creep.move(BOTTOM);
                break;
            case 49:
                creep.move(TOP);
                break;
        }

        if(creep.room.controller.my && !creep.room.controller.upgradeBlocked && (creep.room.controller.ticksToDowngrade < 300 || creep.room.controller.level < 2)) {
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