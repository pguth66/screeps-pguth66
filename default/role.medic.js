var roleMedic = {

    /** @param {Creep} creep **/
    run: function(creep) {

        const targets = creep.room.find(FIND_MY_CREEPS, {filter: function (c) { return c.memory.role == 'warrior'}});
        var target = {} ;
        if (creep.hits < (creep.hitsMax / 2)) {
            creep.heal(creep);
        }
        else {
            if (targets.length == 1) {
                target = targets[0];
            } else {
                target = targets.sort(function(a,b) {return (b.hitsMax - b.hits) - (a.hitsMax - a.hits)})[0];
            }
            if (target) {

                switch (creep.heal(target)) {
                    case ERR_NOT_IN_RANGE:
                        creep.moveToTarget(target);
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