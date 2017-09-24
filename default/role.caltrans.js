/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.remoteworker');
 * mod.thing == 'a thing'; // true
 */

var roleHealer = require('role.healer');

var roleCalTrans = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.ticksToLive == 100) {
            Game.spawns['Spawn1'].createCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE],undefined,{role:'caltrans'});
        }

        switch(creep.pos.y) {
            case 0:
                creep.move(BOTTOM);
                break;
            case 49:
                creep.move(TOP);
                break;
        }

        if(!(creep.room.name == Memory.roomToMaintain)) {
            const exitDir = creep.room.findExitTo(Memory.roomToMaintain);
            const exit = creep.pos.findClosestByRange(exitDir);
            creep.moveTo(exit, {visualizePathStyle: {}});
        }
        else {
            roleHealer.run(creep);
        }
    }
};

module.exports = roleCalTrans ;