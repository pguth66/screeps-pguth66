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
        switch(creep.pos.y) {
            case 0:
                creep.move(BOTTOM);
                break;
            case 49:
                creep.move(TOP);
                break;
        }
            if((creep.room.controller.owner != null) && !creep.room.controller.my && (!creep.room.controller.reservation.ticksToEnd == 0)) {
                switch(creep.attackController(creep.room.controller)) {
                    case ERR_NOT_IN_RANGE:
                        creep.moveTo(creep.room.controller, {visualizePathStyle: {}});
                        break;
                    case ERR_INVALID_TARGET:
                        creep.say('invtarget');
                        break;
                    case ERR_NOT_OWNER:
                        console.log('not owner of controller');
                        break;
                    case ERR_NO_BODYPART:
                        console.log('no bodypart');
                        break;
                    case OK:
                        break;
                    default:
                        creep.say('Bazinga');
                        break;
                }
            }
            else {
                creep.say("Claiming");
                switch(creep.claimController(creep.room.controller)) {
                    case ERR_NOT_IN_RANGE:
                        switch(creep.moveTo(creep.room.controller, {visualizePathStyle: {}})) {
                            case OK:
                                break;
                            case ERR_NO_PATH:
                                creep.moveTo(26,38);
                                console.log('nopath error');
                                break;
                            default:
                                console.log('error moving');
                                break;
                        }
                        //creep.say("moving");
                        break;
                    case OK:
                        break;
                    case ERR_GCL_NOT_ENOUGH:
                    if(creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.controller, {visualizePathStyle: {}});
                        }   
                        break;
                    default:
                        creep.say('claimErr');
                }
            }
        }
};

module.exports = roleClaimer;