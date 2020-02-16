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
        // here want to have creep follow warriors in their squad
        // so 1. figure out if you're in a squad 2. get the warrior from that squad 
        // 3. move to that warrior if you haven't already moved
        try {
            const squadId = creep.memory.squad;
            if (typeof squadId !== 'undefined') {
                const warriorId = _.filter(Memory.squads[squadId].members, (m) => {return m.role == 'warrior'})[0].id;
                const warrior = _.filter(Game.creeps, (c) => {return c.memory.job == warriorId})[0];
                if (typeof warrior == "object") {
                    creep.moveToTarget(warrior);
                }
            }
        }
        catch(err) {
            creep.creepLog(err);
        }
    }
}

module.exports = roleMedic;