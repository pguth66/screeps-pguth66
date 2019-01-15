/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('labHandler');
 * mod.thing == 'a thing'; // true
 */

const HaulTask = require('class.haultask');

class LabGroup {
    constructor (reactant1, reactant2, product) {
        this.reactant1 = reactant1;
        this.reactant2 = reactant2;
        this.product = product;
    }
}

module.exports = {

    run: function(room) {
        if ((room.name == 'W29N29') || (room.name == 'W28N25') || (room.name == 'W27N26')) {
            //console.log('running lab stuff in ' + room.name);
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

        if (r1lab.mineralType == RESOURCE_LEMERGIUM && r1lab.mineralAmount >= 5 &&
            r2lab.mineralType == RESOURCE_OXYGEN && r2lab.mineralAmount >= 5) {
             //console.log(labGroup.product.id);
                if (labGroup.product.cooldown == 0) {
                    labGroup.product.runReaction(labGroup.reactant1,labGroup.reactant2);
               }
            } 


        //taskQueue[0] = new HaulTask(RESOURCE_ENERGY, '59d31c27299d5e073fc87275', 1000);
        //console.log('task queue has ' + taskQueue.length + ' items.');
    }
};