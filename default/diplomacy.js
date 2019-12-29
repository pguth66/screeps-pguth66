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
            //console.log(p + this[p]);
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

        if (currId == 28) {
            testSquad = new Squadron('W29N28',['testsquad','testsquad'],'attack','powerBank','W29N23',currId,'init');
            Memory.currentSquadNum += 1;
        }
         if (currId == 32) {
                testSquad2 = new Squadron('W29N23',['warrior','medic','warrior'],'attack','powerBank','W30N24',currId);
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
                        let numMembers = squad.members.length;
                        let numQueued = 0;

                        squad.members.forEach(function (member, i) {
                            console.log("member " + i + ' has state ' + member.memberState);
                            // because dry runs work one creep at a time, need to only add one creep per turn to build queue
                            if (member.memberState == 'init' && ((Game.time % squad.members.length) == i)) {
                                if (!spawnRoom.hasCreepWithJob(member.id)) {
                                    console.log('would spawn ' + member.id + ' with target ' + squad.targetRoom);
                                    if (!spawnRoom.addToCreepBuildQueue(member.role,{targetRoom:squad.targetRoom,respawn:true,job:member.id})) {
                                        console.log('spawning error');
                                        return;
                                    }
                                    console.log('setting to queued');
                                    return squad.members[i].memberState = 'queued';
                                }
                            }
                            if (member.memberState == 'queued') {
                                numQueued += 1;
                            }
 
                            //console.log(memberID);
                        });
                        if (numQueued == numMembers) {
                            console.log('squad ' + key  + ' setting to waitForSpawn')
                            squad.state = 'waitForSpawn';
                        }
                        break;
                    case 'waitForSpawn':
                        squad.state = 'waitForStage';
                        break;
                    case 'waitForStage':
                        squad.state = 'goToTarget';
                        break;
                    case 'goToTarget':
                        squad.state = 'performMission';
                        break;
                    case 'performMission':
                        let targetRoom = Game.rooms[squad.targetRoom];
                        if (typeof targetRoom === 'undefined') {return};
                        switch(squad.target) {
                            case 'powerSpawn':
                                //console.log('squad ' + squad.id + ' performing mission');
                                /* 
                                substages
                                    powerBank there - attack it
                                    powerBank down to (say) 200k - spawn interhaulers
                                    powerBank gone but resources there - guard
                                    powerBank gone, resources gone - cleanup
                                */
                                if (targetRoom.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_POWER_BANK}}).length > 0) {
                                    console.log('squad ' + squad.id + ' has powerBank in room');
                                } else {
                                    if (targetRoom.find(FIND_DROPPED_RESOURCES).length > 0) {
                                        console.log('squad ' + squad.id + ' has resources to gather');
                                    }
                                    else {
                                        console.log('cleanup');
                                        squad.members.forEach(function (member, i) {
                                            if (member.role == 'warrior' || member.role == 'medic') {
                                                console.log('setting ' + member.id + ' to recycle');
                                            }
                                        })
                                        squad.state = 'inactive';
                                    }
                                }
                                break;
                            default:
                                //console.log('NO TARGET')
                        }
                        break;
                    
                    default:
                        console.log('error processing squad ' + squad.id);
                }
                squad.saveState();
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