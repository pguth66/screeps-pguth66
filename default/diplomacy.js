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
        else {
            return false;
        }
    }
}

module.exports = {

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