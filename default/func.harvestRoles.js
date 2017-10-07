/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('func.harvestRoles');
 * mod.thing == 'a thing'; // true
 */

var harvestRoles = {

    run: function(role, room) {
        //console.log('running harvest role for ' + role);

        if(!Memory.spawn) {
            Memory.spawn = {};
        }

        if (Memory.spawn[role] > 0) {
            Memory.spawn[role] -= 1
        }
        else {
            if(Memory.spawn[role] == 0) {
                switch(role) {
                    case 'caltrans':
                        Game.spawns['Spawn4'].createCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE],undefined,{role:'caltrans',targetRoom:room});
                        break;
                    case 'harvester':
                        Game.spawns['Spawn4'].createCreep([WORK,WORK,WORK,CARRY,MOVE,MOVE],undefined,{role:'harvester',targetRoom:room});
                        break;
                }
                console.log('spawning ' + role + ' and setting memory to null');
                Memory.spawn[role] = null;
            }
            else {
                const numRole = _.filter(Game.creeps, (c) => 
                    { return (c.memory.role == role) && (c.memory.targetRoom == room)}).length;
                if(numRole < 2) {
                    Memory.spawn[role] = 400 ;
                }
            }
        }
    }
};

module.exports = harvestRoles;