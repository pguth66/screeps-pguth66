/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.recycle');
 * mod.thing == 'a thing'; // true
 */

var roleRecycle = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if(creep.memory.targetRoom) {
            creep.memory.targetRoom = undefined;
        }
        spawn = creep.room.find(FIND_MY_SPAWNS)[0];
        // if no spawn in this room, just start going back towards the capital
        if(spawn == null) {
            const exitDir=creep.room.findExitTo('W27N27');
            const exit=creep.pos.findClosestByPath(exitDir);
            creep.moveTo(exit);
        }
        if(creep.pos.getRangeTo(spawn) == 1) {
            spawn.recycleCreep(creep);
            console.log('Recycling ' + creep.name);
        }
        else {
            creep.moveTo(spawn);
        }
    }
};

module.exports = roleRecycle;