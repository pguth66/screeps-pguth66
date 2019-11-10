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

    produce () {
        //console.log(this.reactant1.room.name + " now making labgroup to make " + this.target);
                
        const reactionMap = {
            'zk': { r1: RESOURCE_ZYNTHIUM, r2: RESOURCE_KEANIUM},
            'ul': { r1: RESOURCE_UTRIUM, r2: RESOURCE_LEMERGIUM},
            'g': { r1: RESOURCE_UTRIUM_LEMERGITE, r2: RESOURCE_ZYNTHIUM_KEANITE}
        }
         //   { target: 'zk', r1: RESOURCE_ZYNTHIUM, r2: RESOURCE_KEANIUM};
        const r1 = reactionMap[this.target].r1;
        const r2 = reactionMap[this.target].r2;

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
                        console.log(this.reactant1.room.name + " invalid args for " + this.target);
                        break;
                    case ERR_NOT_ENOUGH_RESOURCES:
                        console.log(this.reactant1.room.name + ' not enough resources for ' + this.target);
                        break;
                    case ERR_FULL:
                        break;
                    default:
                        console.log(this.reactant1.room.name + " encountered error while running " + this.target + "reaction")
                    };
               }
            }
        else {
            console.log(this.reactant1.room.name + " set up wrong to run " + this.target)
        } 
    }
}

/* empties a Lab of any minerals in it, taking them to terminal */
StructureLab.prototype.emptyLab = function () {
    console.log('emptying lab ' + this.id + " of " + this.store[this.mineralType] + " " + this.mineralType);
    if (!this.room.hasCreepWithJob('emptylab')) {
        this.room.addToCreepBuildQueue('contracthauler',{resource:this.mineralType, total:this.store[this.mineralType],job:'emptylab',pullTarget:this.id,dropTarget:this.room.terminal.id});
    }
}

module.exports = {

    run: function(room) {

        if (room.memory.minType == 'ghodium') {
            // console.log('running lab stuff in ' + room.name);
            zkLabGroup = new LabGroup (room.labs[0], room.labs[1], room.labs[2], 'zk');
            ulLabGroup = new LabGroup (room.labs[4], room.labs[5], room.labs[8], 'ul');
            gLabGroup = new LabGroup(room.labs[2], room.labs[8], room.labs[3], 'g');

            function fillLab(lab,resource,jobName) {
                if (lab.mineralType == resource) {
                    if (lab.store[resource] < 500 && (!room.hasCreepWithJob(jobName))) {
                        console.log(room.name + " filling lab " + lab.id + ' with ' + resource);
                        room.addToCreepBuildQueue('contracthauler', {resource:resource, upTo:3000, job:jobName, pullTarget:room.terminal.id, dropTarget:lab.id})
                    }
                } else {
                    console.log(room.name + " emptying lab");
                    lab.emptyLab();
                }
            }

            fillLab(ulLabGroup.reactant1,RESOURCE_UTRIUM,'fillul1');
            fillLab(ulLabGroup.reactant2,RESOURCE_LEMERGIUM,'fillul2');
            fillLab(zkLabGroup.reactant1,RESOURCE_ZYNTHIUM,'fillzk1');
            fillLab(zkLabGroup.reactant2,RESOURCE_KEANIUM,'fillzk2');
            //console.log('product lab is ' + zkLabGroup.product.id);

            zkLabGroup.produce();
            ulLabGroup.produce();
            gLabGroup.produce();

            return;
        }
        else {
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