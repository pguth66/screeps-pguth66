/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.healer');
 * mod.thing == 'a thing'; // true
 */

var roleClaimer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if(!(creep.room.name == Memory.roomToClaim)) {
            const exitDir = creep.room.findExitTo(Memory.roomToClaim);
            const exit = creep.pos.findClosestByRange(exitDir);
            creep.moveTo(exit, {visualizePathStyle: {}});
        }
        else {
            switch(creep.claimController(creep.room.controller)) {
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(creep.room.controller, {visualizePathStyle: {}});
                    break;
                case OK:
                    break;
                default:
                   if(creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                      creep.moveTo(creep.room.controller, {visualizePathStyle: {}});
                    }   
                    break;
            }
        }
	}
};

module.exports = roleClaimer;