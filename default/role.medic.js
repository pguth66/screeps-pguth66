var roleMedic = {

    /** @param {Creep} creep **/
    run: function(creep) {

        const targets = creep.room.find(FIND_MY_CREEPS, {filter: function (c) { return c.memory.role == 'warrior' || c.memory.role == 'medic' || c.memory.role=='drainer'}});
        var target = {} ;

        if (creep.hits < (creep.hitsMax / 2)) {
            creep.say('self');
            creep.heal(creep);
        }
        else {
            if (targets.length == 1) {
                target = targets[0];
            } else {
                target = targets.sort(function(a,b) {return (b.hitsMax - b.hits) - (a.hitsMax - a.hits)})[0];
            }
            if (target) {
                creep.say('heal');
                switch (creep.heal(target)) {
                    case ERR_NOT_IN_RANGE:
                        switch (creep.rangedHeal(target)) {
                            case ERR_NOT_IN_RANGE:
                                creep.moveToTarget(target);
                                break;
                            default:
                                creep.moveToTarget(target);
                                break;
                        }
                        break;
                    case OK:
                        break;
                    default:
                        creep.say('hepl');
                    }
                }

            }
        }
    }

module.exports = roleMedic;