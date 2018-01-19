/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.dismantle');
 * mod.thing == 'a thing'; // true
 */

var roleDismantle = {

    run: function(creep) {

        const dismantleFlags = creep.room.find(FIND_FLAGS, { filter: { color: COLOR_RED } });
        if (dismantleFlags.length > 0) {
            const dismantleFlag = creep.pos.findClosestByPath(dismantleFlags);
            var dismantleTargets = dismantleFlag.pos.lookFor(LOOK_STRUCTURES);
            if (dismantleTargets.length == 0) {
                dismantleFlag.remove();
            }
            //console.log(room.name + dismantleTargets[0]);

            // should make this into an array, then towers can iterate over it and if it's empty won't cause problems
            if (dismantleTargets.length > 0) {
                const dismantleTarget = dismantleTargets[0];

                if (dismantleTarget.notifyWhenAttacked) {
                    dismantleTarget.notifyWhenAttacked(false);
                }
                if (creep.carry[RESOURCE_ENERGY] == creep.carryCapacity) {
                    const depositTarget = creep.findAnyDepositTarget();
                    if (creep.transfer(depositTarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(depositTarget);
                    }
                }
                else {
                    if (creep.dismantle(dismantleTarget) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(dismantleTarget);
                    }

                }
            }
        }
    }
};

module.exports = roleDismantle ;