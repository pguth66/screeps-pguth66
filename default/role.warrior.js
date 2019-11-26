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

        // build array of targets, then attack closest one
        // if target is controller, have to use different method

        var hostiles = [] ;
        var closestHostile = {} ;

        const hostileCreeps = creep.room.hostileCreeps;
        const hostileStructures = creep.room.find(FIND_HOSTILE_STRUCTURES);

        const role = creep.room.my ? 'defense' : 'offense'; 

        hostiles = hostileCreeps.concat(hostileStructures);
        hostileTowers = _.remove(hostiles, {structureType: STRUCTURE_TOWER});
        hostileSpawns = _.remove(hostiles, {structureType: STRUCTURE_SPAWN});
        const powerBank = creep.room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_POWER_BANK}});

        typesToRemove = [ STRUCTURE_RAMPART, STRUCTURE_CONTROLLER, STRUCTURE_STORAGE, STRUCTURE_TERMINAL ];
        typesToRemove.forEach(function (t) {
            const removed = _.remove(hostiles, {structureType: t});
            //creep.creepLog('removed ' + removed.length + ' targets of type ' + t);
        })
        
//        _.remove(hostiles, {structureType: STRUCTURE_RAMPART}); 
//        _.remove(hostiles, {structureType: STRUCTURE_CONTROLLER}); 
        

        // need to prioritize towers here, and attack/heal creeps

        // console.log(hostiles.length);

        if (role == 'defense') {
            // only worry about creeps, and prioritize healers
            var healers = _.filter(hostileCreeps, function (c) { return c.getActiveBodyparts(HEAL) > 0 });
            if (healers.length > 0) {
                closestHostile = creep.pos.findClosestByPath(healers, {ignoreCreeps:true});
            }
            else {
                closestHostile = creep.pos.findClosestByPath(hostileCreeps, {ignoreCreeps:true});
            }
        }
        if (role == 'offense') {
            if(hostileTowers.length > 0) {
                closestHostile = creep.pos.findClosestByPath(hostileTowers);
            }
            else {
                if (hostileSpawns.length > 0) {
                    closestHostile = creep.pos.findClosestByPath(hostileSpawns);
                }
                else {
                    closestHostile = creep.pos.findClosestByPath(hostiles, {ignoreCreeps:true});
                }
            }
        }
    
        if(closestHostile) {
            switch(creep.attack(closestHostile)) {
                case ERR_NOT_IN_RANGE: 
                    var onRamp = false ;
                    const look = creep.pos.lookFor(LOOK_STRUCTURES);
                    look.forEach(function(l) {
                        if (l.structureType == STRUCTURE_RAMPART) {
                            onRamp = true ;
                        }
                    })
                    if (!onRamp) {
                        creep.moveTo(closestHostile, {visualizePathStyle: {}});
                    }
                    break;
                case ERR_INVALID_TARGET:
                    creep.say('inv target');
                    break;
                case OK:
                    creep.say('ATTACK!');                
                    break;
                default:
                    creep.say('attackerr');
            }
        }   
        else {
            if(powerBank && creep.hits > (creep.hitsMax / 2)) {
                creep.attackTarget(powerBank);
            }
            if(!(Memory.roomToAttack) && (hostiles.length == 0)) {
                //creep.memory.role='recycle';
                return;
            }
            if((creep.room != Game.rooms[Memory.roomToAttack]) && (creep.room.name != creep.memory.targetRoom)) {
                creep.say("ToROom");
                const exitDir=creep.room.findExitTo(Memory.roomToAttack);
                const exit=creep.pos.findClosestByRange(exitDir);
                creep.moveTo(exit);
            }
            else {
                attackFlags = creep.room.find(FIND_FLAGS, {filter: {color: COLOR_BROWN}});
                if(attackFlags.length > 0) {
                    closestFlag = creep.pos.findClosestByPath(attackFlags);
                    //creep.creepLog(' closestFlag is ' + closestFlag);
                    creep.say('Flag!');
                    if(closestFlag) {
                        targetArr=closestFlag.pos.findInRange(FIND_STRUCTURES,0);
                        if(targetArr.length >0) {
                            target = targetArr[0];
                            //creep.creepLog(' attacking ' + target.id);
                            if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(target, {visualizePathStyle: {}});
                            }
                        }
                        else {
                            closestFlag.remove;
                        }
                    }
                }
                else {
                    //creep.moveTo(24,24, {visualizePathStyle: {}});
                    creep.memory.role='recycle';
                }
            }
        }
    }
};

module.exports = roleWarrior;