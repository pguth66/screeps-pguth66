/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('diplomacy');
 * mod.thing == 'a thing'; // true
 */
Room.prototype.hasFullNuker = function () {
    const nuker = this.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_NUKER}});
    if (nuker[0]) {
        if (nuker.energy == nuker.energyCapacity && nuker.ghodium == nuker.ghodiumCapacity) {
            return true;
        }
    }
    else {
        return false;
    }
}

class Squadron {
    constructor (spawnRoom,members,mission,target,targetRoom,id) {
        this.spawnRoom = spawnRoom; // room name, not room object
        this.members = members;
        this.mission = mission;
        this.target = target;
        this.targetRoom = targetRoom; // note you need to have the Room object (via observer) or this gets weird
        this.id = id;
        this.state = 'init';

        // this Memory object is used to persist the squad across ticks
        Memory.squads[this.id] = {};
        const properties = [ 'id', 'spawnRoom', 'members', 'mission', 'target', 'targetRoom', 'state'];
        properties.forEach(function(p) {
            //console.log(p);
            Memory.squads[this.id][p] = this[p];
        },this);
        console.log(spawnRoom + ' creating squadron of ' + members.length);
    }
}

module.exports = {

    run: function () {
        //console.log('running diplomacy');
        if (!Memory.squads) {
            console.log('initializing memory for squads');
            Memory.squads = {};
            Memory.currentSquadNum = 1;
        }
        const currId = Memory.currentSquadNum;

        if (!Memory.currentSquadNum == 1) {
            testSquad = new Squadron('W29N29',['medic','warrior'],'attack','powerSpawn','W30N27',currId);
            Memory.currentSquadNum += 1;
        }


        try {
        //process each squad
        Object.keys(Memory.squads).forEach( function (key) {
            const spawnRoom = Game.rooms[Memory.squads[key].spawnRoom]; // get the room object, for spawning
            const targetRoom = Memory.squads[key].targetRoom; // room name, not object

            //console.log('squad ' + Memory.squads[key].id + ' has ' + Memory.squads[key].members.length + ' members')
            switch (Memory.squads[key].state) {
                case 'init':
                    //console.log('init state');
                    const spawnNamePattern = 'squad-' + Memory.squads[key].id + '-';
                    //console.log(spawnNamePattern)
                    Memory.squads[key].members.forEach(function (member, i) {
                        const memberID = spawnNamePattern + member + '-' + i;
                        if (spawnRoom.getTotalCreeps(member) == 0) {
                            console.log('would spawn ' + memberID + ' with target ' + targetRoom);
                            if (!spawnRoom.addToCreepBuildQueue(member,{targetRoom:targetRoom})) {
                                console.log('spawning error');
                                return;
                            }
                           Memory.squads[key].state = 'waitForSpawn';
                        }
                        //console.log(memberID);
                    });
                    break;
                case 'waitForSpawn':
                    break;
                default:
                    console.log('error processing squad ' + Memory.squads[key].id);
            }
        })
    } catch(err) {
        console.log(err)
    }
    },

    /**
     * Walks an array of rooms, and nukes them from your rooms with nukers.
     * @param {string[]} roomsToNuke Array of rooms that you are going to nuke
     */

     nukeTheWorld: function (roomsToNuke) {

        const myRooms = _.filter(Game.rooms, (r) => { if (r.controller && r.controller.owner) { return r.controller.owner.username == 'MixtySix'}} ) ;
        const nukingRooms = _.filter(myRooms, (r) => { return r.hasFullNuker() });
        console.log(nukingRooms.length + " rooms ready to nuke from");
        nukingRooms.forEach(function (r) {
            console.log(r.name + ' BOOM!');
        })
    }
};