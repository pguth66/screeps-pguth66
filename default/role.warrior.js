/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.warrior');
 * mod.thing == 'a thing'; // true
 */

var roleWarrior = {

  /** @param {Creep} creep **/
    run: function(creep) {

        // build array of targets, then attack closest one
        // if target is controller, have to use different method

        var hostiles ;

        const hostileCreeps = creep.room.find(FIND_HOSTILE_CREEPS);
        const hostileStructures = creep.room.find(FIND_HOSTILE_STRUCTURES);
        

        hostiles = hostileCreeps.concat(hostileStructures);
        hostileTowers = _.remove(hostiles, {structureType: STRUCTURE_TOWER});
        _.remove(hostiles, {structureType: STRUCTURE_RAMPART}); 
        _.remove(hostiles, {structureType: STRUCTURE_CONTROLLER}); 
        

        // need to prioritize towers here, and attack/heal creeps

        // console.log(hostiles.length);

        if(hostileTowers.length > 0) {
            var closestHostile = creep.pos.findClosestByPath(hostileTowers);
        }
        else {
            var closestHostile = creep.pos.findClosestByPath(hostiles);
        }
    
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
            if(Memory.roomToAttack) {
                creep.say("ToROom");
                const exitDir=creep.room.findExitTo(Memory.roomToAttack);
                const exit=creep.pos.findClosestByRange(exitDir);
                creep.moveTo(exit);
            }
            else {
                //creep.moveTo(24,24, {visualizePathStyle: {}});
                creep.memory.role='recycle';
            }
        }
    }
};

module.exports = roleWarrior;