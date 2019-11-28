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

/**
 * Class to represent squads
 * @constructor
 * @param {string} spawnRoom - name of the room where squad soldiers should be spawned
 * @param {string[]} members - array of soldier types to make up the squad
 * @param {string} mission - type of mission
 * @param {string} target - describes the target of the mission
 * @param {string} targetRoom - name of the room where the mission is
 * @param {number} id - essentially the primary key for the squads table in memory
 * @param {string} state - FSM state of the squad (comes from memory if not init)
 * 
 */
class Squadron {
    constructor (spawnRoom,members,mission,target,targetRoom,id,state) {
        this.spawnRoom = spawnRoom; // room name, not room object
        this.members = members; // array of roles 
        // memberState = [ init, queued, spawned ]
        this.mission = mission;
        this.target = target;
        this.targetRoom = targetRoom; // note you need to have the Room object (via observer) or this gets weird
        this.id = id;
        this.state = state;

        this.serialNumberPattern = 'squad-' + id + '-'; // used to construct member IDs

        this.members.forEach(function (member, i) {
            //console.log (JSON.stringify(member) + ' ' + i)
            return this.members[i] = {role:member,id:this.serialNumberPattern  + member + '-' + i, memberState: 'init'};
        },this)

        //console.log('squad ' + this.id + ' has member length ' + members.length);

        // this Memory object is used to persist the squad across ticks
        // if it doesn't exist, create it and store stuff
        if (!Memory.squads[this.id]) {
            console.log('init memory for ' + this.id);
            Memory.squads[this.id] = {};
            this.state = 'init';
            this.saveState();
            console.log(spawnRoom + ' creating squadron of ' + members.length);
        } else {
            //rebuild object from what's stored in Memory
            const     properties = [ 'id', 'spawnRoom', 'mission', 'target', 'targetRoom', 'state'];
            properties.forEach(function (p) {
                this[p] = Memory.squads[this.id][p];
            },this);
            Memory.squads[this.id]['members'].forEach(function (m,i) {
                this['members'][i] = m;
            },this);
        }
    } // end constructor

    saveState() {
        const     properties = [ 'id', 'spawnRoom', 'mission', 'target', 'targetRoom', 'state'];
        properties.forEach(function(p) {
            //console.log(p);
            Memory.squads[this.id][p] = this[p];
        },this);
        Memory.squads[this.id].members = [];
        this.members.forEach(function (m,i) {
            //console.log('storing memory for ' + this.id + ' member ' + m.id)
            Memory.squads[this.id]['members'][i] = m;
        },this);
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

        if (currId == 14) {
            testSquad = new Squadron('W29N28',['testsquad','testsquad'],'attack','powerSpawn','W29N23',currId,'init');
            Memory.currentSquadNum += 1;
        }
         if (currId == 11) {
                testSquad2 = new Squadron('W29N29',['warrior','medic','warrior'],'attack','powerSpawn','W29N30',currId);
                Memory.currentSquadNum += 1;
        } 


        try {
        //process each squad
        // rebuild the squad from Memory
        // do its thing
        // store the updated info back into Memory
        Object.keys(Memory.squads).forEach( function (key) {
            // first rebuild the Squadron object from Memory
            if (Memory.squads[key].state != 'inactive') {
                const id = key;
                const spawnRoomName = Memory.squads[key].spawnRoom;
                let members = Memory.squads[key].members;
                //console.log(JSON.stringify(members[0]));
/*                 members.forEach(function (member,i) {
                    return members[i] = JSON.parse(member);
                }); */

                let memberRoles = [];
                members.forEach(function (m) {
                    //console.log('role ' + m.role)
                    memberRoles.push(m.role);
                })
                const mission = Memory.squads[key].mission;
                const target = Memory.squads[key].target;
                const targetRoom = Memory.squads[key].targetRoom;
                const state = Memory.squads[key].state;

                squad = new Squadron(spawnRoomName,memberRoles,mission,target,targetRoom,id,state)
            
                const spawnRoom = Game.rooms[Memory.squads[key].spawnRoom]; // get the room object, for spawning

                //console.log('squad ' + Memory.squads[key].id + ' has ' + Memory.squads[key].members.length + ' members')
                switch (squad.state) {
                    case 'init':
                        //console.log('init state');
                        squad.members.forEach(function (member, i) {
                            console.log("member " + i + ' has state ' + member.memberState);
                            // because dry runs work one creep at a time, need to only add one creep per turn to build queue
                            if (member.memberState == 'init' && ((Game.time % squad.members.length) == i)) {
                                if (!spawnRoom.hasCreepWithJob(member.id)) {
                                    console.log('would spawn ' + member.id + ' with target ' + targetRoom);
                                    if (!spawnRoom.addToCreepBuildQueue(member.role,{targetRoom:targetRoom,respawn:true,job:member.id})) {
                                        console.log('spawning error');
                                        return;
                                    }
                                    console.log('setting to queued');
                                    return squad.members[i].memberState = 'queued';
                                }
                            }
                            //console.log(memberID);
                        });
                        squad.saveState();
                        //Memory.squads[key].state = 'waitForSpawn';
                        break;
                    case 'waitForSpawn':
                        break;
                    default:
                        console.log('error processing squad ' + squad.id);
                }
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