/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.warrior');
 * mod.thing == 'a thing'; // true
 */

var rolePatrol = {
    
      /** @param {Creep} creep **/
        run: function(creep) {
    
            // build array of targets, then attack closest one
            // if target is controller, have to use different method
        
            const hostileCreeps = creep.room.hostileCreeps;

            var closestHostile = creep.pos.findClosestByPath(hostileCreeps);
            
    
            // need to prioritize towers here, and attack/heal creeps
    
            // console.log(hostiles.length);
    
            if(closestHostile) {
                switch(creep.attack(closestHostile)) {
                    case ERR_NOT_IN_RANGE: 
                        creep.moveTo(closestHostile, {visualizePathStyle: {}});
                        break;
                    case ERR_INVALID_TARGET:
                        creep.say('inv target');
                        break;
                    case OK:
                        creep.say('ATTACK!');                
                        break;
                    default:
                        creep.say('attackerr');
                }
            }
            else {
                creep.moveTo(24,24, {visualizePathStyle:{}});
            }   
        }
    };
    
    module.exports = rolePatrol;