/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.warrior');
 * mod.thing == 'a thing'; // true
 */

var roleVanguard = {
    
      /** @param {Creep} creep **/
        run: function(creep) {
    
            // move to a target room
            // stay at the edge (far from towers)
            // heal yourself constantly
            // when almost dead move back to other room and heal up
            // then go back

            switch(creep.pos.x) {
                case 49:
                    creep.move(LEFT);
                    break;
                case 0: 
                    creep.move(RIGHT);
                    break;
                default:
                    break;
            }
            switch(creep.pos.y) {
                case 0:
                    creep.move(BOTTOM);
                    break;
                case 49:
                    creep.move(TOP);
                    break;
                default: 
                    break;
            }

            const targetRoomName = 'W28N29';
            const targetRoom = Game.rooms[targetRoomName];
            const safeRoomName = 'W29N29';
            const safeRoom = Game.rooms[safeRoomName];

            if(creep.room == targetRoom) {
                if(creep.hits < 1400) {
                    creep.moveTo(safeRoom.controller);
                }
                else {
                    creep.heal(creep);
                }
            }

            if(creep.room != targetRoom) {
                if(creep.hits < creep.hitsMax) {
                    creep.heal(creep);
                } 
                else {
                    creep.say('toTarget');
                    const exitDir = creep.room.findExitTo(targetRoomName);
                    const exit = creep.pos.findClosestByRange(exitDir);
                    creep.moveTo(exit);
                }
            }
        }
    };
    
    module.exports = roleVanguard;