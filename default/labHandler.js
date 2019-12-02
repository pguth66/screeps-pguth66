/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('labHandler');
 * mod.thing == 'a thing'; // true
 */

const HaulTask = require('class.haultask');

/* creates a group of 3 labs with a specified purpose */
class LabGroup {
    constructor (reactant1, reactant2, product, target) {
        this.reactant1 = reactant1;
        this.reactant2 = reactant2;
        this.product = product;
        this.target = target;
    }

    produce (reactionMap) {
        //console.log(this.reactant1.room.name + " now making labgroup to make " + this.target);
                
       
         //   { target: 'zk', r1: RESOURCE_ZYNTHIUM, r2: RESOURCE_KEANIUM};
        const r1 = reactionMap[this.target].r1;
        const r2 = reactionMap[this.target].r2;

        if (typeof this.product === 'undefined') {
            console.log(this.reactant1.room.name + ' no lab to hold product!');
            return;
        }
        if (this.product.cooldown != 0) {
            return;
        }

        // right now this has an edge failure case if the two reactant labs contain the same mineral
        if ((this.reactant1.mineralType == r1) || (this.reactant1.mineralType == r2) && this.reactant1.mineralAmount >= 5 &&
            (this.reactant2.mineralType == r2) || (this.reactant2.mineralType == r1) && zkLabGroup.reactant2.mineralAmount >= 5) {
             //console.log(labGroup.product.id);
                if (this.product.cooldown == 0) {
                    switch(this.product.runReaction(this.reactant1,this.reactant2)) {
                        case OK:
                        break;
                    case ERR_NOT_IN_RANGE:
                        console.log(this.reactant1.room.name + ' not in range error when making ' + this.target);
                        break;
                    case ERR_INVALID_ARGS:
                        console.log(this.reactant1.room.name + " has wrong resources for " + this.target);
                        break;
                    case ERR_NOT_ENOUGH_RESOURCES:
                        //console.log(this.reactant1.room.name + ' not enough resources for ' + this.target);
                        break;
                    case ERR_FULL:
                        break;
                    default:
                        console.log(this.reactant1.room.name + " encountered error while running " + this.target + "reaction")
                    };
               }
            }
        else {
            //console.log(this.reactant1.room.name + " set up wrong to run " + this.target)
        } 
    }
}

/* empties a Lab of any minerals in it, taking them to terminal */
StructureLab.prototype.emptyLab = function () {
    if (!this.room.hasCreepWithJob('emptylab')) {
        console.log('emptying lab ' + this.id + " of " + this.store[this.mineralType] + " " + this.mineralType);
        this.room.addToCreepBuildQueue('contracthauler',{resource:this.mineralType, total:this.store[this.mineralType],job:'emptylab',pullTarget:this.id,dropTarget:this.room.terminal.id});
    }
}

module.exports = {

    run: function(room) {

        function fillLab(lab,resource,jobName) {
            if (typeof lab === 'undefined') {
                console.log(room.name + ' missing lab!');
                return;
            }
            if (lab.mineralType == resource || lab.mineralType === undefined ) {
                //console.log(room.name +  " " + lab.mineralType + resource + jobName)
                if ((lab.store[resource] < 500) && (!room.hasCreepWithJob(jobName))) {
                    if (room.terminal.store[resource] > 500) { 
                        console.log(room.name + " filling lab " + lab.id + ' with ' + resource);
                        let amountToGet = lab.store.getFreeCapacity(resource);
                        if (amountToGet > 3000) { amountToGet = 3000 };
                        if (amountToGet > room.terminal.store[resource]) {amountToGet = room.terminal.store[resource]};
                        room.addToCreepBuildQueue('contracthauler', {resource:resource, total:amountToGet, job:jobName, pullTarget:room.terminal.id, dropTarget:lab.id})
                    }
                    else {
                        // add something to get needed resource here
                    }
                }
            } else {
                //console.log(room.name + " emptying lab");
                lab.emptyLab();
            }
        }
        
        function makeCompounds(compoundsToMake) {
            compoundsToMake.forEach( function (compound) {
                switch (compound) {
                    case 'UO':
                    case 'OH':
                    case 'ZO':
                        lg = new LabGroup (room.labs[0], room.labs[1], room.labs[2], compound);
                        break;
                    case 'UH':
                    case 'KO':
                        lg = new LabGroup (room.labs[3], room.labs[4], room.labs[5], compound);
                        break;
                    case 'UH2O':
                        lg = new LabGroup (room.labs[5],room.labs[7],room.labs[8],compound);
                        break;
                    case 'KHO2':
                        lg = new LabGroup ( room.labs[5], room.labs[6], room.labs[7], compound);
                        break;
                    case 'LO':
                        lg = new LabGroup (room.labs[0], room.labs[4], room.labs[2], compound);
                        break;
                    case 'LHO2':
                        lg = new LabGroup (room.labs[2], room.labs[1], room.labs[3], compound);
                        break;
                }
                fillLab(lg.reactant1,reactionMap[compound].r1,'filllab' + reactionMap[compound].r1);
                fillLab(lg.reactant2,reactionMap[compound].r2, 'filllab' + reactionMap[compound].r2);
                // if the 'product' lab has the wrong minerals in it, empty it
                if (lg.product.store[lg.product.mineralType] > 0 && lg.product.mineralType != compound) {
                    let emptyJob = 'empty' + compound + 'productlab';
                    if (!room.hasCreepWithJob(emptyJob)) {
                        console.log('need to empty lab for ' + compound);
                        room.addToCreepBuildQueue('contracthauler',{resource:lg.product.mineralType,job:emptyJob,total:lg.product.store[lg.product.mineralType],pullTarget:lg.product.id,dropTarget:room.terminal.id});
                    } else {
                        // no point running the reaction if the product lab is occupied
                        return;
                    }
                }
                lg.produce(reactionMap);
                let emptyJob = 'empty' + compound;
                if (lg.product.store[lg.product.mineralType] >= 2900 && !room.hasCreepWithJob(emptyJob)) {
                    console.log(room.name + 'emptying lab of ' + compound)
                    room.addToCreepBuildQueue('contracthauler',{resource:lg.product.mineralType,job:emptyJob,total:lg.product.store[lg.product.mineralType],pullTarget:lg.product.id,dropTarget:room.terminal.id});
 
                }
                [reactionMap[compound].r1, reactionMap[compound].r2].forEach( (m) => {
                    if (room.terminal.store[m] < 3000) {
                        room.getMinsFromNearestRoom(m);
                    }
                })
            });
        }
        const reactionMap = {
            'ZK': { r1: RESOURCE_ZYNTHIUM, r2: RESOURCE_KEANIUM},
            'UL': { r1: RESOURCE_UTRIUM, r2: RESOURCE_LEMERGIUM},
            'G': { r1: RESOURCE_UTRIUM_LEMERGITE, r2: RESOURCE_ZYNTHIUM_KEANITE},
            'OH': { r1: RESOURCE_OXYGEN, r2: RESOURCE_HYDROGEN},
            'LO' : {r1: RESOURCE_LEMERGIUM, r2: RESOURCE_OXYGEN},
            'LHO2' : {r1: RESOURCE_LEMERGIUM_OXIDE, r2:RESOURCE_HYDROXIDE},
            'GHO2': {r1: RESOURCE_GHODIUM_OXIDE, r2:RESOURCE_HYDROXIDE},
            'UO': {r1: RESOURCE_UTRIUM, r2: RESOURCE_OXYGEN},
            'UH': {r1: RESOURCE_UTRIUM, r2: RESOURCE_HYDROGEN},
            'UH2O': {r1: RESOURCE_UTRIUM_HYDRIDE, r2: RESOURCE_HYDROXIDE},
            'KO': {r1: RESOURCE_KEANIUM, r2: RESOURCE_OXYGEN},
            'ZO': {r1: RESOURCE_ZYNTHIUM, r2: RESOURCE_OXYGEN},
            'KHO2' : {r1:RESOURCE_KEANIUM_OXIDE, r2:RESOURCE_HYDROXIDE}
        }

        var compoundsToMake = [];
        switch (room.memory.minType) {
            case 'ghodium':
                // console.log('running lab stuff in ' + room.name);
                zkLabGroup = new LabGroup (room.labs[0], room.labs[1], room.labs[2], 'ZK');
                ulLabGroup = new LabGroup (room.labs[4], room.labs[5], room.labs[8], 'UL');
                gLabGroup = new LabGroup(room.labs[2], room.labs[8], room.labs[3], 'G');

                fillLab(ulLabGroup.reactant1,RESOURCE_UTRIUM,'fillul1');
                fillLab(ulLabGroup.reactant2,RESOURCE_LEMERGIUM,'fillul2');
                fillLab(zkLabGroup.reactant1,RESOURCE_ZYNTHIUM,'fillzk1');
                fillLab(zkLabGroup.reactant2,RESOURCE_KEANIUM,'fillzk2');
                //console.log('product lab is ' + zkLabGroup.product.id);

                zkLabGroup.produce(reactionMap);
                ulLabGroup.produce(reactionMap);
                gLabGroup.produce(reactionMap);

                if (gLabGroup.product.store[RESOURCE_GHODIUM] >= 2900 && !room.hasCreepWithJob('emptyG')) {
                    room.addToCreepBuildQueue('contracthauler',{resource:RESOURCE_GHODIUM,job:'emptyG',total:gLabGroup.product.store[RESOURCE_GHODIUM],pullTarget:gLabGroup.product.id,dropTarget:room.terminal.id});
                }

                goLabGroup = new LabGroup(room.labs[6],room.labs[7],room.labs[9], 'GHO2');

                fillLab(goLabGroup.reactant1,RESOURCE_GHODIUM_OXIDE,'fullgo1');
                fillLab(goLabGroup.reactant2,RESOURCE_HYDROXIDE,'fillgo2');
                goLabGroup.produce(reactionMap);
                return;
                break;
            case 'hydroxide':
                compoundsToMake = [ 'OH' ];
                makeCompounds(compoundsToMake);
                return;

                break;
            case 'LO':
                compoundsToMake = [ 'LO', 'LHO2' ];
                makeCompounds(compoundsToMake);

                // use labs 8 and 9 to make catalyzed
                return;

            case 'UO':
                compoundsToMake = [ 'UO','UH', 'UH2O'];
                makeCompounds(compoundsToMake);

                return;
            
            case 'KO':
                compoundsToMake = [ 'KO'];
                makeCompounds(compoundsToMake);
                return;

            case 'boosttest':
                const attackBoostLab = room.labs[0];
                const healBoostLab = room.labs[1];
                const armorBoostLab = room.labs[2];

                fillLab(attackBoostLab,RESOURCE_UTRIUM_HYDRIDE,'fillattk');
                fillLab(healBoostLab,RESOURCE_LEMERGIUM_OXIDE,'fillheal');
                fillLab(armorBoostLab,RESOURCE_GHODIUM_OXIDE,'fillarmor');

                labs = [attackBoostLab, healBoostLab, armorBoostLab];
                labs.forEach(function (lab) {
                    //console.log(lab.id + ' has ' + lab.store.getUsedCapacity(RESOURCE_ENERGY) + ' energy');
                    if (lab.store.getUsedCapacity(RESOURCE_ENERGY) < 500 && !room.hasCreepWithJob('refilllabenergy')) {
                        room.addToCreepBuildQueue('contracthauler',{resource:RESOURCE_ENERGY,job:'refilllabenergy',upTo:lab.store.getCapacity(RESOURCE_ENERGY),dropTarget:lab.id,pullTarget:room.storage.id})
                    }
                });

                return;

            default:
                return;
        }        

        if (!Memory.rooms[room.name].taskqueue) {
            Memory.rooms[room.name].taskqueue = [] ;
        }

        if (!Memory.rooms[room.name].labs) {
            Memory.rooms[room.name].labs = {} ;
        }

        Memory.rooms['W29N29'].labs = {
            reactant1id: '59d2d4844fc7a444cccf0f68',
            reactant2id: '59d31c27299d5e073fc87275',
            productid: '59d35ba22b0e1e176fa5ef10'            
        }       
        Memory.rooms['W28N25'].labs = {
            reactant1id: '5a6f05369c16e97620e7df4d',
            reactant2id: '5a6fb44d85a8177633e50e35',
            productid: '5a7023fa5467b13946ef374a'            
        }
        Memory.rooms['W27N27'].labs = {
            reactant1id: '59eb4aac5fdbbd40d309cf93',
            reactant2id: '59eb11ff1f682b67d0295eb6',
            productid: '59eb916eb2bec028a1725a5d'
        }
        Memory.rooms['W27N26'].labs = {
            reactant1id: '59f606501263aa5284f9a904',
            reactant2id: '59f617b42c3ab178089d2f96',
            productid: '59f60ce4ebd5be0b420d5666'
        }
        var taskQueue = [] ;
        const r1lab = Game.getObjectById(Memory.rooms[room.name].labs.reactant1id);
        const r2lab = Game.getObjectById(Memory.rooms[room.name].labs.reactant2id);
        const plab = Game.getObjectById(Memory.rooms[room.name].labs.productid);

        //console.log(room.name);

        const labGroup = new LabGroup (r1lab,r2lab,plab);
        try {
        if (r1lab.mineralType == RESOURCE_LEMERGIUM && r1lab.mineralAmount >= 5 &&
            r2lab.mineralType == RESOURCE_OXYGEN && r2lab.mineralAmount >= 5) {
             //console.log(labGroup.product.id);
                if (labGroup.product.cooldown == 0) {
                    labGroup.product.runReaction(labGroup.reactant1,labGroup.reactant2);
               }
            } 
        }
        catch(error) {
            console.log(error);
        }


        //taskQueue[0] = new HaulTask(RESOURCE_ENERGY, '59d31c27299d5e073fc87275', 1000);
        //console.log('task queue has ' + taskQueue.length + ' items.');
    }
};