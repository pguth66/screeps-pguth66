/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('creepHandler');
 * mod.thing == 'a thing'; // true
 */
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleHealer = require('role.healer');
var roleHauler = require('role.hauler');
var roleClaimer = require('role.claimer');
var roleWarrior = require('role.warrior');
var roleMiner = require('role.miner');
var roleRecycle = require('role.recycle');
var roleInterHauler = require('role.interhauler');
var roleMinHauler = require('role.minhauler');
var roleRemoteworker = require('role.remoteworker');
var roleCalTrans = require('role.caltrans');
var roleVanguard = require('role.vanguard');
var roleScavenger = require('role.scavenger');
var rolePatrol = require('role.patrol');
var harvestRole = require('func.harvestRoles');
var roleDismantle = require('role.dismantle');
var roleContractHauler = require('role.contracthauler');

module.exports = {

    handleCreep: function(creep) {

        // takes a creep as an argument
        // handles init etc and runs the appropriate role for that creep
        // meant to be called from the room loop

        const creepRoles = [
            { role: 'harvester', run: roleHarvester.run },
            { role: 'upgrader', run: roleUpgrader.run },
            { role: 'healer', run: roleHealer.run },
            { role: 'hauler', run: roleHauler.run },
            { role: 'claimer', run: roleClaimer.run },
            { role: 'warrior', run: roleWarrior.run },
            { role: 'builder', run: roleBuilder.run },
            { role: 'recycle', run: roleRecycle.run },
            { role: 'miner', run: roleMiner.run },
            { role: 'interhauler', run: roleInterHauler.run },
            { role: 'minhauler', run: roleMinHauler.run },
            { role: 'caltrans', run: roleCalTrans.run },
            { role: 'vanguard', run: roleVanguard.run },
            { role: 'scavenger', run: roleScavenger.run },
            { role: 'patrol', run: rolePatrol.run },
            { role: 'dismantle', run:roleDismantle.run},
            { role: 'contracthauler', run:roleContractHauler.run},
            { role: 'remoteworker', run: roleRemoteworker.run }
        ];
        //    console.log('role: ' + creepMap[0].role + " function: " + creepMap[0].run);

        if (!creep.spawning) {
            if (creep.hasOnlyMoveParts()) {
                creep.creepLog('has only move parts, recycling')
                creep.memory.role = 'recycle';
            }
            if (creep.memory.targetRoom && (creep.memory.targetRoom != creep.room.name)) {
                creep.moveToRoom(creep.memory.targetRoom);
            }
            else {
                for (i = 0; i < creepRoles.length; i++) {
                    if (creep.memory.role == creepRoles[i].role) {
                        creepRoles[i].run(creep);
                    }
                }
                // renew
                if (creep.memory.respawn && (creep.ticksToLive < 100)) {
                    creep.say("Respawning");
                    if (creep.respawn()) {
                        creep.memory.respawn=false;
                    }
                }
            }
        }
        else { // initialization stuff
            if (!creep.memory.spawnRoom) {
                creep.memory.spawnRoom = creep.room.name;
            }
        }
        
    }
};