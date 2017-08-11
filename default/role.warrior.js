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

        const closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

        if(closestHostile) {
            creep.say('ATTACK!');
            if (creep.attack(closestHostile) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestHostile);
            }
        }
        else {
            creep.moveTo(24,24, {visualizePathStyle: {}});
        }
    }
};

module.exports = roleWarrior;