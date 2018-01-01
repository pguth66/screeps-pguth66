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

Object.defineProperty(Room.prototype, 'spawns', {
    get: function () {
        if (!this._spawns) {
            this._spawns = this.find(FIND_MY_SPAWNS);
        }
        return this._spawns;
    }
})

Object.defineProperty(Room.prototype, 'links', {
    get: function () {
        if (!this._links) {
            this._links = this.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_LINK}});
            this._links.forEach(function (link) {
                if(link.pos.inRangeTo(this.controller,8)) {
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

Room.prototype.addToCreepBuildQueue = function (creepType, memoryObject) {
    //console.log('adding creep to build queue: '+ creepType);
    var bq = this.memory.buildQueue;

    if (!memoryObject) {
        memoryObject={};
    }

    bq.push({role:creepType, memory:memoryObject});

    console.log(JSON.stringify(bq[bq.length - 1]));
}

Room.prototype.getCreepBody = function (role) {
    
    var body = [];

    switch (role) {
        case 'contracthauler':
            body = [CARRY,CARRY,CARRY,CARRY,MOVE,MOVE];
            break;
        default:
            body = [WORK,CARRY,WORK,CARRY,MOVE,MOVE];
    }
    return body ;
}

Room.prototype.runBuildQueue = function () {
    var bq = this.memory.buildQueue;

    console.log(this.name + ' build queue length ' + bq.length);
    availableSpawns = _.filter(this.spawns, { 'spawning':null });
    //console.log('available spawns: ' + availableSpawns);

    availableSpawns.forEach(function (spawn) {
        if (bq.length == 0) { return };
        const embryo = bq.pop();
        embryo.memory.role=embryo.role; // all creeps need this
        const creepname = this.name + '-' + Game.time
        //const body = [WORK,CARRY,WORK,CARRY,MOVE,MOVE];
        const body = this.getCreepBody(embryo.role);
        if (spawn.spawnCreep(body, creepname, {dryRun: true, memory:embryo.memory}) == OK) {
            console.log(spawn.id + ' spawning ' + embryo.role );
            if (spawn.spawnCreep(body, creepname, {memory:embryo.memory}) == OK) { 
                return; 
            }
            else {
                console.log('error spawning creep');
            }
        }
    }, this)
}

module.exports = {

    handleRoom: function(room) {

        // init

        if (!room.memory.buildQueue) {
            room.memory.buildQueue = [];
        }
        if (room.memory.buildQueue.length > 0) {
            room.runBuildQueue();
        }
    }
};