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
        
        spawn = creep.room.find(FIND_MY_SPAWNS)[0];
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