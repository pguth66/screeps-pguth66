var roleOperator = {

    /** @param {Creep} creep **/
    run: function (creep) {

        // start with doing just labs
        // if don't have enough ops (>10), generate ops
        // if no labs to operate, generate ops
        // if have enough ops and there's a lab that needs it, move to it and operate it
        // renew self when TTL < 250

        if (!creep.ticksToLive > 0) { return };

        var labsToOperate = [];
        switch (creep.room.name) {
            case 'W27N27':
                labsToOperate = [ '5a4b17b4c5e760084b6224a2', '5a4ac96bbfd0365429ac83cb', '5a4961d94c3fe43d8d039ca2' ]; // hardcoded list from W27N27 for now
                break;
            case 'W28N27':
                labsToOperate = [ '5dea737d8d4c4c6fc9d9f55c', '5de9767e4643c04198fc057d', '5de588533a7ad706a429f70f'];
                break;
            case 'W28N26':
                labsToOperate = [ '5a41f056155d9b4992bfd8e2'];
                break;
            default:
                console.log(creep.room.name + ' unknown labs to operate')
        }
        
        const lab = Game.getObjectById(labsToOperate[0])
        creep.moveTo(lab);
        if (creep.ticksToLive < 250) {
            switch(creep.renew(creep.room.powerSpawn)) {
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(creep.room.powerSpawn);
                    break;
                case OK:
                    break;
                default:
                    console.log('error renewing ' + creep.name);
                    break;
            }
        }

        if (creep.store[RESOURCE_OPS] < 10) {
            if (creep.powers[PWR_GENERATE_OPS].cooldown == 0) {
                creep.usePower(PWR_GENERATE_OPS);
            } else {
                // not enough OPS to do anything
                return;
            }
        } else {
            // assuming only one effect, and it's PWR_OPERATE_LAB
            for (const l of labsToOperate) {
                //console.log('checking lab ' + l);
                let lab = Game.getObjectById(l);
                try {
                    if (creep.powers[PWR_OPERATE_LAB].cooldown == 0 && (typeof lab.effects === 'undefined' || typeof lab.effects[0] === 'undefined' || lab.effects[0].ticksRemaining == 0)) {
                        creep.say('OPLAB');
                        switch (creep.usePower(PWR_OPERATE_LAB, lab)) {
                            case ERR_NOT_IN_RANGE:
                                creep.moveTo(lab);
                                break;
                            case OK:
                                // successfully operated a lab, don't want to do anything else as it might overwrite
                                return;
                                break;
                            default:
                                console.log('error operating lab ' + lab)
                        }
                    }
                }
                catch (err) {
                    console.log(err);
                }
            }
            // if we made it out of forEach without return'ing, now generate ops
            if (creep.powers[PWR_GENERATE_OPS].cooldown == 0) {
                creep.usePower(PWR_GENERATE_OPS);
            }
            // if we're getting full, go deposit ops in storage
            if (creep.store[RESOURCE_OPS] > 375) {
                let amtToDep = creep.store[RESOURCE_OPS] - 350;
                switch (creep.transfer(creep.room.storage, RESOURCE_OPS, amtToDep)) {
                    case ERR_NOT_IN_RANGE:
                        creep.moveTo(creep.room.storage);
                        break;
                    case OK:
                        break;
                    default:
                        console.log(creep.room.name + ' error depsiting OPS in storage');
                }
            }
        }
    }
}

module.exports = roleOperator;