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
var roleDismantle = require('role.dismantle');
var roleContractHauler = require('role.contracthauler');
var roleHeisenberg = require('role.heisenberg');
var roleMedic = require('role.medic');
var roleArcher = require('role.archer');
var rolePowerProcessor = require('role.powerProcessor');
Creep.prototype.creepLog = function (text) {
    console.log(this.name + "-" + this.memory.role + ": " + text);
};
Creep.prototype.attackTarget = function (target) {
    if (target) {
        switch (this.attack(target)) {
            case ERR_NOT_IN_RANGE:
                var onRamp = false;
                var look = this.pos.lookFor(LOOK_STRUCTURES);
                look.forEach(function (l) {
                    if (l.structureType == STRUCTURE_RAMPART) {
                        onRamp = true;
                    }
                });
                if (!onRamp) {
                    this.moveTo(target, { visualizePathStyle: {} });
                }
                break;
            case ERR_INVALID_TARGET:
                this.say('inv target');
                break;
            case OK:
                this.say('ATTACK!');
                break;
            default:
                this.say('attackerr');
        }
        return;
    }
    else {
        return false;
    }
};
Creep.prototype.moveToTarget = function (target) {
    //this.creepLog('moving to target ' + target.id);
    switch (this.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } })) {
        case ERR_NO_PATH:
            //this.creepLog('entering NO_PATH code');
            var path = this.pos.findPathTo(target, { ignoreCreeps: true });
            for (var i = 0; i < path.length; i++) {
                var pathSpot = new RoomPosition(path[i].x, path[i].y, this.room.name);
                var blockingCreeps = pathSpot.lookFor(LOOK_CREEPS);
                if (blockingCreeps.length > 0) {
                    this.memory.blocked ? this.memory.blocked++ : this.memory.blocked = 1;
                    if (this.memory.blocked > 0 && this.memory.blocked < 5) {
                        //this.creepLog('blocked by creep ' + blockingCreeps[0].name);
                        this.tellCreepToMove(blockingCreeps[0]);
                    }
                    else {
                        this.memory.target = null;
                        this.creepLog('giving up because blocked for ' + this.memory.blocked);
                        this.memory.blocked = 0;
                        return;
                    }
                }
                else {
                    if (this.memory.blocked) {
                        this.memory.blocked = 0;
                    }
                }
                break;
            }
            ;
            break;
        default:
            break;
    }
};
Creep.prototype.hasTarget = function () {
    if (this.memory.target != null) {
        //this.say('HasTarget!');
        return true;
    }
    else {
        //this.say('Notarget!');
        return false;
    }
};
Creep.prototype.hasEnergy = function () {
    if (this.carry[RESOURCE_ENERGY] > 0) {
        return true;
    }
    else {
        return false;
    }
};
Creep.prototype.hasPower = function () {
    if (this.carry[RESOURCE_POWER] > 0) {
        return true;
    }
    else {
        return false;
    }
};
Creep.prototype.hasMinerals = function () {
    // pull out energy, what's left is minerals
    var creepMins = _.omit(this.carry, RESOURCE_ENERGY);
    if (!_.isEmpty(creepMins)) {
        return true;
    }
    else {
        return false;
    }
};
Creep.prototype.getBoosted = function (boost) {
    // expects argument of mineral type to boost with
    // finds lab with that mineral, moves there, tells lab to boost it, then goes back to normal
    // need flag for boosted or not
    // set target to proper lab
};
Creep.prototype.inRangeToTarget = function (target) {
    var range = 1;
    switch (target.structureType) {
        default:
            range = 1;
            break;
    }
    if (this.pos.inRangeTo(target, range)) {
        return true;
    }
    else {
        return false;
    }
};
Creep.prototype.moveToRoom = function (room) {
    // expects room to be a room NAME
    var targetRoom = Game.rooms[room];
    if (targetRoom && targetRoom.controller) {
        switch (this.moveTo(targetRoom.controller, { visualizePathStyle: {} })) {
            case OK:
                break;
            case ERR_INVALID_TARGET:
                this.creepLog('invalid target err');
                break;
            default:
                this.say('moveerr');
        }
        ;
    }
    else {
        var exitDir = this.room.findExitTo(room);
        var exit = this.pos.findClosestByRange(exitDir);
        this.moveTo(exit, { visualizePathStyle: {} });
    }
};
Creep.prototype.getResources = function (target) {
    // target should be a game object
    if (this.pos.inRangeTo(target, 1)) {
        switch (this.withdraw(target, RESOURCE_ENERGY)) {
            case ERR_INVALID_TARGET:
                this.pickup(target);
                break;
            case OK:
                break;
            default:
                if (_.sum(this.carry) < this.carryCapacity) {
                    for (var r in (target.store)) {
                        this.withdraw(target, r);
                    }
                }
                ;
                break;
        }
        this.memory.target = null;
    }
    else {
        this.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
    }
};
Creep.prototype.flee = function (fleeTarget) {
    // right now this only works when the fleeTarget is close to (really, next to) the creep
    var newX = this.pos.x + (this.pos.x - fleeTarget.pos.x);
    var newY = this.pos.y + (this.pos.y - fleeTarget.pos.y);
    this.moveTo(newX, newY);
};
Creep.prototype.tellCreepToMove = function (creep) {
    var randomDir = Math.floor(Math.random() * 8 + 1);
    //creep.creepLog('moving in dir ' + randomDir);
    creep.move(randomDir);
};
Creep.prototype.getBody = function () {
    //        body = JSON.stringify(_.values(_.pick(this.body[0], ['type'])),null,4);
    function pullParts(part) {
        var r = _.values(_.pick(part, ['type']));
        //console.log(JSON.stringify(r,null,4));            
    }
    var bodyArr = this.body.map(pullParts);
    var newarr = [];
    bodyArr.forEach(function (e) {
        newarr.concat(e);
    });
    console.log(bodyArr);
    //        console.log(body);
};
Creep.prototype.respawn = function () {
    var body = [];
    var newCreepMemory = { role: this.memory.role, respawn: true };
    try {
        switch (this.memory.role) {
            case 'interhauler':
                newCreepMemory.targetRoom = this.memory.targetRoom;
                newCreepMemory.workRoom = this.memory.workRoom;
                newCreepMemory.baseRoom = this.memory.baseRoom;
                break;
            case 'harvester':
                newCreepMemory.targetRoom = this.memory.targetRoom;
                newCreepMemory.target = this.memory.target;
                break;
            case 'claimer':
            case 'patrol':
            case 'dismantle':
            case 'remoteworker':
            case 'warrior':
            case 'medic':
            case 'drainer':
            case 'archer':
                newCreepMemory.targetRoom = this.memory.targetRoom;
                break;
            case 'contracthauler':
                var memProps = ['pullTarget', 'dropTarget', 'job', 'upTo', 'resource', 'total', 'taskID', 'loadingTerminal', 'unloadingTerminal', 'processed'];
                memProps.forEach(function (memProp) {
                    if (this.memory[memProp]) {
                        newCreepMemory[memProp] = this.memory[memProp];
                    }
                }, this);
                break;
            default:
                break;
        }
        var spawnRoom = Game.rooms[this.memory.spawnRoom];
        //      const spawn = spawnRoom.find(FIND_MY_SPAWNS)[0];
        if (spawnRoom.addToCreepBuildQueue(this.memory.role, newCreepMemory)) {
            this.memory.respawn = false;
            return true;
        }
        else {
            this.creepLog('error adding self to build queue');
            return false;
        }
    }
    catch (err) {
        this.creepLog(err);
    }
};
Creep.prototype.findAnyDepositTarget = function () {
    var targets = [];
    // need to add links, spawns, extensions to this
    this.room.containers.forEach(function (container) {
        //this.creepLog('processing container ' + container.id);
        if ((_.sum(container.store) < (container.storeCapacity - _.sum(this.carry)))) {
            targets.push(container);
        }
    }, this);
    //this.creepLog('found ' + targets.length + ' containers to deposit in, picking closest');
    return this.pos.findClosestByPath(targets);
};
Creep.prototype.hasOnlyMoveParts = function () {
    var workparts = [CARRY, WORK, ATTACK, RANGED_ATTACK, HEAL, CLAIM];
    var numWorkingParts = 0;
    workparts.forEach(function (part) {
        numWorkingParts += this.getActiveBodyparts(part);
    }, this);
    if (numWorkingParts > 0) {
        return false;
    }
    else {
        return true;
    }
};
Creep.prototype.canHeal = function () {
    var healParts = [HEAL];
    var numHealParts = 0;
    healParts.forEach(function (part) {
        numHealParts += this.getActiveBodyparts(part);
    }, this);
    return numHealParts > 0 ? true : false;
};
module.exports = {
    handleCreep: function (creep) {
        // takes a creep as an argument
        // handles init etc and runs the appropriate role for that creep
        // meant to be called from the room loop
        var creepRoles = [
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
            { role: 'dismantle', run: roleDismantle.run },
            { role: 'contracthauler', run: roleContractHauler.run },
            { role: 'heisenberg', run: roleHeisenberg.run },
            { role: 'remoteworker', run: roleRemoteworker.run },
            { role: 'medic', run: roleMedic.run },
            { role: 'archer', run: roleArcher.run },
            { role: 'drainer', run: roleMedic.run },
            { role: 'powerProcessor', run: rolePowerProcessor.run }
        ];
        //    console.log('role: ' + creepMap[0].role + " function: " + creepMap[0].run);
        if (!creep.spawning) {
            if (creep.hasOnlyMoveParts() && (creep.memory.role != 'warrior')) {
                creep.creepLog('has only move parts, recycling');
                creep.memory.role = 'recycle';
            }
            if (typeof creep.memory.needsBoost !== 'undefined' && creep.memory.needsBoost.length > 0) {
                var boostTypes = ['armor', 'attack', 'move', 'heal'];
                boostTypes.forEach(function (bt) {
                    if (creep.memory.needsBoost.includes(bt)) {
                        creep.creepLog('needs Boost ' + bt);
                        if (creep.room.boostAvailable && creep.room.boostAvailable.includes(bt)) {
                            // try to boost
                            var boostLab;
                            switch (bt) {
                                case 'armor':
                                    boostLab = creep.room.labs[2];
                                    break;
                                case 'move':
                                    boostLab = creep.room.labs[3];
                                    break;
                                case 'attack':
                                    boostLab = creep.room.labs[0];
                                    break;
                                case 'heal':
                                    boostLab = creep.room.labs[1];
                                    break;
                                default:
                                    console.log(creep.room.name + ' unknown boost type: ' + bt);
                            }
                            switch (boostLab.boostCreep(creep)) {
                                case ERR_NOT_IN_RANGE:
                                    creep.moveToTarget(boostLab);
                                    break;
                                case OK:
                                    _.remove(creep.memory.needsBoost, function (b) { return b == bt; });
                                    break;
                                default:
                                    creep.creepLog('error trying to boost');
                            }
                        }
                        else {
                            creep.creepLog('no boost available, removing ' + bt);
                            _.remove(creep.memory.needsBoost, function (b) { return b == bt; });
                        }
                    }
                });
                return; // this is here because when we're boosting we can't send more move commands to creeps
            }
            if (creep.memory.targetRoom && (creep.memory.targetRoom != creep.room.name)) {
                creep.moveToRoom(creep.memory.targetRoom);
            }
            else {
                for (var i = 0; i < creepRoles.length; i++) {
                    if (creep.memory.role == creepRoles[i].role) {
                        creepRoles[i].run(creep);
                    }
                }
                // renew
                if (creep.memory.respawn && (creep.ticksToLive < 100)) {
                    creep.say("Respawning");
                    if (creep.respawn()) {
                        creep.memory.respawn = false;
                    }
                }
            }
        }
        else { // initialization stuff
            if (!creep.memory.spawnRoom) {
                creep.memory.spawnRoom = creep.room.name;
            }
            if (!creep.memory.processed) {
                creep.memory.processed = 0;
            }
            if (!creep.memory.targetRoom && !((creep.memory.role == 'interhauler') || (creep.memory.role == 'contracthauler') || (creep.memory.role == 'minhauler'))) {
                creep.memory.targetRoom = creep.room.name;
            }
            if (!creep.memory.needsBoost) {
                creep.memory.needsBoost = [];
                if (creep.memory.role == 'testsquad' || creep.memory.role == 'warrior') {
                    creep.memory.needsBoost.push('armor');
                    creep.memory.needsBoost.push('attack');
                }
                if (creep.memory.role == 'medic' || creep.memory.role == 'drainer') {
                    creep.memory.needsBoost.push('heal');
                    creep.memory.needsBoost.push('armor');
                }
            }
        }
    }
};
