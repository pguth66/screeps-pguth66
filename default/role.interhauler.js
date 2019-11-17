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
            case 48:
                creep.move(BOTTOM_LEFT);
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

        // need to make this use workRoom and baseRoom instead of (or in addition to) the Memory rooms
        try{
        if(!creep.memory.hauling && !(creep.room.name == creep.memory.workRoom)) {
            const targetRoom = Game.rooms[creep.memory.workRoom];
            //console.log(targetRoom.name);    
            if(targetRoom && targetRoom.controller) {        
                creep.moveTo(targetRoom.controller);
            }
            else {
                creep.moveToRoom(creep.memory.workRoom);
            }
            
            creep.memory.target=null;
            return;       
        }
        }
        catch(err) {
            creep.creepLog(err + " while trying to go to target room");
        }

        if(creep.memory.hauling && (creep.room.name != creep.memory.baseRoom)) {
            creep.moveToRoom(creep.memory.baseRoom);
            creep.memory.target=null;               
            return;    
        }

        roleHauler.run(creep);


    }
};