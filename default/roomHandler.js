/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('roomHandler');
 * mod.thing == 'a thing'; // true
 */

Object.defineProperty(Room.prototype, 'sources', {
    get: function () {
        if (!this._sources) {
            this._sources = this.find(FIND_SOURCES);
        }
        return this._sources;
    }
})

Object.defineProperty(Room.prototype, 'minerals', {
    get: function () {
        if (!this._minerals) {
            this._minerals = this.find(FIND_MINERALS);
        }
        return this._minerals;
    }
})

Object.defineProperty(Room.prototype, 'links', {
    get: function () {
        if (!this._links) {
            this._links = this.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_LINK}});
            this._links.forEach(function (link) {
                if(link.pos.inRangeTo(this.controller,4)) {
                    link.isSource=true;
                }
                else {
                    link.isSource=false;
                }
            },this)
        }
        return this._links;
    }
})

Object.defineProperty(Room.prototype, 'containers', {
    get: function () {
        if(!this._containers) {
            this._containers = this.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_CONTAINER}});
            this._containers.forEach(function (container) {
                //var sources = this.find(FIND_SOURCES);
                //const nearbySources =  _.filter(sources, (s) => {return container.pos.inRangeTo(s, 3)});
                const nearbySources = _.filter(this.sources, (s) => {return container.pos.inRangeTo(s, 3)});
                const nearbyMinerals = _.filter(this.minerals, (m) => { return container.pos.inRangeTo(m, 3)});
                if (nearbySources.length > 0 || nearbyMinerals.length > 0) {
                    container.isSource = true;
                }
                else {
                    container.isSource = false;
                }
            },this)
            if(this.storage) {
                this._containers.push(this.storage);
            }
        }
        return this._containers;
    }
})

Object.defineProperty(Room.prototype, 'labs', {
    get: function () {
        if (!this._labs) {
            this._labs = this.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_LAB}});
        }
        return this._labs;
    }
})

/*module.exports = {

};
*/