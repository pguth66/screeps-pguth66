/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.interhauler');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    /** @param {Creep} creep **/
    run: function(creep) {

        // expects pullTarget and dropTarget
        // if not hauling, go to pullTarget, load up on energy, switch to hauling
        // if hauling, go to dropTarget, drop it off, switch off hauling

        // starting with just energy for now
        const pt = Game.getObjectById(creep.memory.pullTarget);
        const dt = Game.getObjectById(creep.memory.dropTarget);

        try{
            if(!creep.memory.hauling) {
                if (creep.pos.inRangeTo(pt,1)) {
                    creep.withdraw(pt, RESOURCE_ENERGY);
                    creep.memory.hauling = true;
                }
                else {
                    creep.moveTo(pt);
                }
            }

            if (creep.memory.hauling) {
                if (creep.pos.inRangeTo(dt,1)) {
                    creep.transfer(dt, RESOURCE_ENERGY);
                    switch (dt.structureType) {
                        case STRUCTURE_NUKER:
                            if (dt.energy >= creep.memory.upTo) {
                                creep.memory.role='recycle';
                            }
                            break;
                        default:
                            if (dt.store[RESOURCE_ENERGY] >= creep.memory.upTo) {
                            creep.memory.role='recycle';
                            }
                            break;
                    }
                    creep.memory.hauling = false;                        
                }
                else {
                    creep.moveTo(dt);
                }
            }
        }
        catch(err) {
            creep.creepLog(err + " while contract hauling");
        }
    }
};