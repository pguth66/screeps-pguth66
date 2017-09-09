/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.interhauler');
 * mod.thing == 'a thing'; // true
 */
var roleHauler = require('role.hauler');

module.exports = {
    /** @param {Creep} creep **/
    run: function(creep) {

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

        if(!creep.memory.hauling && !(creep.room.name == Memory.roomToClaim)) {
            const exitDir = creep.room.findExitTo(Memory.roomToClaim);
            const exit = creep.pos.findClosestByRange(exitDir);
            creep.moveTo(exit, {visualizePathStyle: {}}); 
            creep.memory.target=null;
            return;       
        }

        if(creep.memory.hauling && (creep.room.name != Memory.roomToHelp)) {
            const exitDir = creep.room.findExitTo(Memory.roomToHelp);
            const exit = creep.pos.findClosestByRange(exitDir);
            creep.moveTo(exit, {visualizePathStyle: {}});   
            creep.memory.target=null;               
            return;    
        }

        roleHauler.run(creep);


    }
};