/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.minhauler');
 * mod.thing == 'a thing'; // true
 */

 /* mineral haulers
    find all containers with non-energy resources
    go grab them, bring them to terminal
        if in same room with terminal great
        if not, go to room with terminal
    should have these guys on recycle behavior so they don't drop vauable stuff
    if current room has no targets, check next room
*/
var roleMinHauler = {

    /** @param {Creep} creep **/
    run: function(creep) {

        const roomMap = Memory.roomMaps[creep.room.name];
        var targets = [] ;

        if(!creep.memory.hauling && _.sum(creep.carry) == creep.carryCapacity) {
            creep.memory.hauling = true;
            creep.say('Minhaul');
        }

        if(creep.memory.hauling && _.sum(creep.carry) == 0) {
            creep.memory.hauling = false;
            if(creep.ticksToLive < 100) {
                creep.memory.role = 'recycle';
                return;
            }
            else {
                creep.say('Harvest');
            }
        }

        if(!creep.memory.hauling) {
            for(c in roomMap.containers) {
                // get the real container object
                container = Game.getObjectById(roomMap.containers[c].id);
                if(!(_.isEmpty(_.omit(container.store, RESOURCE_ENERGY)))) {
                    targets.push(container);
                    roomMap.hasMinsToHaul = true;
                }
            }
            if(targets.length == 0) {
                creep.say('notarget!');
                roomMap.hasMinsToHaul = false;
                const exitDir=creep.room.findExitTo('W28N28');
                const exit=creep.pos.findClosestByRange(exitDir);
                creep.moveTo(exit);
            }
            else {
                target = creep.pos.findClosestByRange(targets);
                //console.log(target);
                if(creep.pos.inRangeTo(target, 1)) {
                    for(r in target.store) {
                        creep.withdraw(target, r);
                    }
                }
                else {
                    creep.moveTo(target, { visualizePathStyle: {}});
                }
            }
        }

        if(creep.memory.hauling) {
            terminal = Game.getObjectById(Memory.terminal);

            if(creep.pos.inRangeTo(terminal, 1)) {
                for(r in creep.carry) {
                    creep.transfer(terminal, r);
                }
            }
            else {
                creep.moveTo(terminal, { visualizePathStyle: {} });
            }
        }
    }
};

module.exports = roleMinHauler ; 