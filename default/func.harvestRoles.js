/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('func.harvestRoles');
 * mod.thing == 'a thing'; // true
 */

var harvestRoles = {

    // this module's purpose is to handle spawning of creeps to harvest remote rooms
    // normally creeps spawn inside the room loop but these are a special case
    run: function(role, roomToHarvest, roomToHelp) {
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
                        Game.rooms['W28N26'].addToCreepBuildQueue('caltrans',{targetRoom:roomToHarvest});
                        break;
                    case 'harvester':
                        Game.rooms['W28N26'].addToCreepBuildQueue('harvester',{targetRoom:roomToHarvest});
                        break;
                    case 'interhauler':
                        Game.rooms['W28N26'].addToCreepBuildQueue('interhauler',{workRoom:roomToHarvest,baseRoom:roomToHelp});
                        break;
                    case 'patrol':
                        Game.rooms['W28N26'].addToCreepBuildQueue('patrol',{targetRoom:roomToHarvest});
                        break;
                }
                console.log('spawning ' + role + ' and setting memory to null');
                Memory.spawn[role] = null;
            }
            else {
                var numNeeded = 0;
                switch(role) {
                    case 'caltrans':
                    case 'harvester':
                        numNeeded = 2;
                        break;
                    case 'interhauler': 
                        numNeeded = 5;
                        break;
                    case 'patrol':
                        numNeeded = 1;
                        break;
                }
                const numRole = _.filter(Game.creeps, (c) => 
                    { return (c.memory.role == role) && ((c.memory.targetRoom == roomToHarvest) || (c.memory.workRoom == roomToHarvest))}).length;
                if(numRole < numNeeded) {
                    Memory.spawn[role] = 300 ;
                }
            }
        }
    }
};

module.exports = harvestRoles;