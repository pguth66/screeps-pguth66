var rolePowerProcessor = {

    /** @param {Creep} creep **/
    run: function (creep) {

        if (!creep.room.powerSpawn) {
            creep.creepLog(' is a power processor but there is no powerSpawn here!');
            return false;
        }

        if (creep.room.powerSpawn.store[RESOURCE_POWER] < 5) {
            // powerSpawn needs power
            if (creep.hasEnergy()) {
                switch(creep.transfer(creep.room.terminal, RESOURCE_ENERGY, creep.store[RESOURCE_ENERGY])) {
                    case ERR_NOT_IN_RANGE:
                        creep.moveTo(creep.room.terminal);
                        break;
                    case OK: 
                        return;
                    default:
                        creep.creepLog('error while dropping excess energy');
                }
            } else {
                if (creep.store[RESOURCE_POWER] == creep.store.getCapacity()) {
                    const amountToTransfer = creep.room.powerSpawn.store.getFreeCapacity(RESOURCE_POWER);
                    switch (creep.transfer(creep.room.powerSpawn, RESOURCE_POWER, amountToTransfer )) {
                        case ERR_NOT_IN_RANGE:
                            creep.moveTo(creep.room.powerSpawn);
                            break;
                        case OK:
                            return;
                        default:
                            creep.creepLog('error while transferring power to powerSpawn')
                    }
                } else {
                    const powerSources = creep.room.find(FIND_MY_STRUCTURES, {
                        filter: function (s) {
                            return s.structureType != STRUCTURE_POWER_SPAWN && s.store && s.store[RESOURCE_POWER] > 0;
                        }
                    })
                    const target = creep.pos.findClosestByPath(powerSources);
                    if (target) {
                        switch (creep.withdraw(target, RESOURCE_POWER)) {
                            case ERR_NOT_IN_RANGE:
                                creep.moveTo(target);
                                break;
                            case ERR_NOT_ENOUGH_RESOURCES:
                                creep.suicide();
                                break;
                            case OK:
                                return;
                            default:
                                creep.creepLog('error while picking up power from ' + target.id)
                        }
                    }
                }
            }
        } else {
            // powerSpawn needs energy
            if (creep.hasPower()) {
                switch(creep.transfer(creep.room.terminal, RESOURCE_POWER, creep.store[RESOURCE_POWER])) {
                    case ERR_NOT_IN_RANGE:
                        creep.moveTo(creep.room.terminal);
                        break;
                    case OK: 
                        return;
                    default:
                        creep.creepLog('error while dropping excess power');
                }
            } else {
                if (creep.store[RESOURCE_ENERGY] == creep.store.getCapacity()) {
                    switch (creep.transfer(creep.room.powerSpawn, RESOURCE_ENERGY, creep.store[RESOURCE_ENERGY])) {
                        case ERR_NOT_IN_RANGE:
                            creep.moveTo(creep.room.powerSpawn);
                            break;
                        case OK:
                            return;
                            break;
                        default:
                            creep.creepLog('error while transferring energy to powerSpawn');
                    }
                }
                else {
                    const energySources = creep.room.find(FIND_MY_STRUCTURES, {
                        filter: function (s) {
                            return  s.structureType != STRUCTURE_POWER_SPAWN && s.structureType != STRUCTURE_TOWER && s.structureType != STRUCTURE_NUKER && s.structureType != STRUCTURE_LAB && s.store && s.store[RESOURCE_ENERGY] > creep.store.getCapacity();
                        }
                    })
                    const target = creep.pos.findClosestByPath(energySources);
                    switch (creep.withdraw(target, RESOURCE_ENERGY)) {
                        case ERR_NOT_IN_RANGE:
                            creep.moveTo(target);
                            break;
                        case OK:
                            return;
                        default:
                            creep.creepLog('error while picking up energy');
                    }
                }
            }
        }
    }
}

module.exports = rolePowerProcessor;