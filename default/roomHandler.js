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
        //delete this.memory.sources;
        if (this.memory.sources) {
            this._sources = this.memory.sources.map(function (id) { return Game.getObjectById(id); });
        }
        else {
            if (!this._sources) {
                this._sources = this.find(FIND_SOURCES);
            }
            this.memory.sources = this._sources.map(function (source) { return source.id; });
        }
        return this._sources;
    }
});
Object.defineProperty(Room.prototype, 'minerals', {
    get: function () {
        if (!this._minerals) {
            if (!this.memory.minerals) {
                this.memory.minerals = this.find(FIND_MINERALS).map(function (mineral) { return mineral.id; });
            }
            this._minerals = this.memory.minerals.map(function (id) { return Game.getObjectById(id); });
        }
        return this._minerals;
    }
});
Object.defineProperty(Room.prototype, 'spawns', {
    get: function () {
        if (!this._spawns) {
            this._spawns = this.find(FIND_MY_SPAWNS);
        }
        return this._spawns;
    }
});
Object.defineProperty(Room.prototype, 'contracthaulers', {
    get: function () {
        var contracthaulers = this.getTotalCreeps('contracthauler');
        return contracthaulers;
    }
});
Object.defineProperty(Room.prototype, 'extensions', {
    get: function () {
        if (!this._extensions) {
            this._extensions = this.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_EXTENSION } });
        }
        return this._extensions;
    }
});
Object.defineProperty(Room.prototype, 'towers', {
    get: function () {
        if (!this._towers) {
            this._towers = this.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } });
        }
        return this._towers;
    }
});
Object.defineProperty(Room.prototype, 'links', {
    get: function () {
        if (!this._links) {
            this._links = this.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_LINK } });
            this._links.forEach(function (link) {
                if (link.pos.inRangeTo(this.controller, 8)) {
                    link.isSource = true;
                }
                else {
                    link.isSource = false;
                }
            }, this);
        }
        return this._links;
    }
});
Object.defineProperty(Room.prototype, 'containers', {
    get: function () {
        if (!this._containers) {
            this._containers = this.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_CONTAINER } });
            this._containers.forEach(function (container) {
                //var sources = this.find(FIND_SOURCES);
                //const nearbySources =  _.filter(sources, (s) => {return container.pos.inRangeTo(s, 3)});
                var nearbySources = _.filter(this.sources, function (s) { return container.pos.inRangeTo(s, 3); });
                var nearbyMinerals = _.filter(this.minerals, function (m) { return container.pos.inRangeTo(m, 3); });
                if (nearbySources.length > 0 || nearbyMinerals.length > 0) {
                    container.isSource = true;
                }
                else {
                    container.isSource = false;
                }
            }, this);
            if (this.storage) {
                this.storage.isSource = false;
                this._containers.push(this.storage);
            }
        }
        return this._containers;
    }
});
Object.defineProperty(Room.prototype, 'labs', {
    get: function () {
        if (!this._labs) {
            this._labs = this.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_LAB } });
        }
        return this._labs;
    }
});
Object.defineProperty(Room.prototype, 'powerSpawn', {
    get: function () {
        if (!this._ps) {
            this._ps = this.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_POWER_SPAWN } })[0];
        }
        return this._ps;
    }
});
Object.defineProperty(Room.prototype, 'observer', {
    get: function () {
        if (!this._observer) {
            this._observer = this.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_OBSERVER } })[0];
        }
        return this._observer;
    }
});
Object.defineProperty(Room.prototype, 'nuker', {
    get: function () {
        if (!this._nk) {
            this._nk = this.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_NUKER } })[0];
        }
        return this._nk;
    }
});
Object.defineProperty(Room.prototype, 'droppedResources', {
    // returns an array of objectIDs of resources that can be picked up
    get: function () {
        if (!this._dropped) {
            this._droppedAll = this.find(FIND_DROPPED_RESOURCES);
            // only return piles with more than 50 so we don't waste time
            this._dropped = _.filter(this._droppedAll, function (r) { return r.amount > 50; });
        }
        return this._dropped;
    }
});
Object.defineProperty(Room.prototype, 'tombstones', {
    get: function () {
        if (!this._tombstones) {
            this._tombstones = this.find(FIND_TOMBSTONES);
        }
        return this._tombstones;
    }
});
Object.defineProperty(Room.prototype, 'ruins', {
    get: function () {
        if (!this._ruins) {
            this._ruins = this.find(FIND_RUINS);
        }
        return this._ruins;
    }
});
Object.defineProperty(Room.prototype, 'walls', {
    get: function () {
        if (!this._walls) {
            this._walls = this.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_WALL } });
        }
        return this._walls;
    }
});
Object.defineProperty(Room.prototype, 'ramparts', {
    get: function () {
        if (!this._ramparts) {
            this._ramparts = this.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_RAMPART } });
        }
        return this._ramparts;
    }
});
Object.defineProperty(Room.prototype, 'hostileCreeps', {
    get: function () {
        if (!this._hostileCreeps) {
            this._hostileCreeps = this.find(FIND_HOSTILE_CREEPS);
        }
        return this._hostileCreeps;
    }
});
Object.defineProperty(Room.prototype, 'junkyard', {
    get: function () {
        if (this._junkyard == 'nojunkyard') {
            return null;
        }
        else {
            if (this.memory.junkyard && this.memory.junkyard.x && this.memory.junkyard.y) {
                this._junkyard = new RoomObject(this.memory.junkyard.x, this.memory.junkyard.y, this.name);
            }
            else {
                this._junkyard = 'nojunkyard';
                return null;
            }
        }
        return this._junkyard;
    }
});
Room.prototype.findNearestRoomSelling = function (mineral) {
    var roomsWithMin = _.filter(Game.rooms, function (r) { if (r.minerals[0]) {
        return r.minerals[0].mineralType == mineral;
    } });
    var destRoomMatrix = [];
    roomsWithMin.forEach(function (room, i) {
        if (room.terminal) {
            destRoomMatrix[i] = { 'room': room, 'dist': Game.map.getRoomLinearDistance(this.name, room.name, true) };
        }
    }, this);
    destRoomMatrix.sort(function (a, b) { return a.dist - b.dist; });
    //console.log(JSON.stringify(destRoomMatrix,null,4));
    return destRoomMatrix[0].room;
};
Room.prototype.findNearestRoomNeedingEnergy = function (amountToSend) {
    // name is a misnomer right now, returns the room with the LOWEST energy, not the nearest one
    // find all rooms with less than threshold energy
    var roomsNeedingEnergy = _.filter(Game.rooms, function (r) { if (r.storage && r.terminal && r.memory.energyState == 'normal') {
        return r.storage.store[RESOURCE_ENERGY] < 500000 && r.terminal.store.getFreeCapacity() >= amountToSend;
    } });
    // var destRoomMatrix = [] ;
    roomsNeedingEnergy.sort(function (a, b) { return a.storage.store[RESOURCE_ENERGY] - b.storage.store[RESOURCE_ENERGY]; });
    //console.log(roomsNeedingEnergy);
    return roomsNeedingEnergy[0];
};
Room.prototype.getMinsFromNearestRoom = function (mineral) {
    var roomsWithMin = _.filter(Game.rooms, function (r) { if (r.controller && r.controller.my && r.terminal) {
        return r.terminal.store[mineral] > 10000;
    } });
    var destRoomMatrix = [];
    roomsWithMin.forEach(function (room, i) {
        if (room.terminal) {
            destRoomMatrix[i] = { 'room': room, 'dist': Game.map.getRoomLinearDistance(this.name, room.name, true) };
        }
    }, this);
    destRoomMatrix.sort(function (a, b) { return a.dist - b.dist; });
    //console.log(JSON.stringify(destRoomMatrix,null,4));
    if (destRoomMatrix.length == 0) {
        return false;
    }
    function sendMinsTo(room, thisRoom) {
        console.log(thisRoom.name + ' requesting ' + mineral + ' from ' + room.name);
        switch (room.terminal.send(mineral, 6000, thisRoom.name)) {
            case OK:
                return true;
            case ERR_TIRED:
                break;
            case ERR_NOT_ENOUGH_RESOURCES:
                // try the next one
                return 'next';
                break;
            default:
                console.log(this.name + ' error while requesting ' + mineral + ' from ' + destRoomMatrix[0].room.name);
        }
        //return destRoomMatrix[0].room;
    }
    switch (sendMinsTo(destRoomMatrix[0].room, this)) {
        case 'next':
            if (typeof destRoomMatrix[1] !== 'undefined') {
                sendMinsTo(destRoomMatrix[1].room, this);
            }
            break;
        case true:
            return destRoomMatrix[0].room;
    }
    ;
};
/**
 * Adds a task to the room's lab queue
 * @param {StructureLab} lab to haul to
 * @param {resourceType} mineral to bring
 */
Room.prototype.addToLabQueue = function (lab, resource) {
    //console.log('adding creep to build queue: '+ creepType);
    var lq = this.memory.labQueue;
    lq.push({ lab: lab, resource: resource });
    // verify it worked
    if (lq[lq.length - 1].lab == lab && lq[lq.length - 1].resource == resource) {
        return true;
    }
    else {
        return false;
    }
};
Room.prototype.addToCreepBuildQueue = function (creepType, memoryObject) {
    //console.log('adding creep to build queue: '+ creepType);
    var bq = this.memory.buildQueue;
    if (!memoryObject) {
        var memoryObject = { role: creepType };
    }
    bq.push({ role: creepType, memory: memoryObject });
    // verify it worked
    if (bq[bq.length - 1].role == creepType && bq[bq.length - 1].memory == memoryObject) {
        return true;
    }
    else {
        return false;
    }
    console.log(JSON.stringify(bq[bq.length - 1]));
};
/**
 * Return the proper body part array for a soldier
 * @param {object} parts - object containing what parts and how many, e.g. {tough:2,attack:2}
 */
Room.prototype.getSoldierBody = function (parts) {
    var newbody = [];
    // order matters here, this is how the body will be constructed
    for (var i = 0; i < parts.tough; i++) {
        newbody.push(TOUGH);
    }
    for (var i = 0; i < parts.attack; i++) {
        newbody.push(ATTACK);
    }
    for (var i = 0; i < parts.heal; i++) {
        newbody.push(HEAL);
    }
    for (var i = 0; i < parts.move; i++) {
        newbody.push(MOVE);
    }
    for (var i = 0; i < parts.rangedAttack; i++) {
        newbody.push(RANGED_ATTACK);
    }
    return newbody;
};
Room.prototype.getCreepBody = function (role, targetRoom) {
    // have to pass in targetRoom to handle the special case of harvesters being sent to other
    // rooms to work in. We have to check that room's controller to see how big the body is.
    // Not used for any other cases atm.
    var body = [];
    //var room: Room = {};
    //var room = new Room('temp');
    //console.log('targetRoom is ' + targetRoom);
    //console.log('this in getCreepbody is ' + this);
    if (targetRoom && (role == 'harvester' || role == 'upgrader')) {
        var room = Game.rooms[targetRoom];
    }
    else {
        var room = this;
    }
    //console.log('room is now ' + room);
    if (room.memory.stage == 'start' && role != 'patrol') {
        //console.log('using small creep bodies');
        switch (role) {
            case 'harvester':
                if (room.energyAvailable <= 450) {
                    body = [WORK, WORK, CARRY, MOVE];
                }
                else {
                    body = [WORK, WORK, WORK, CARRY, MOVE, MOVE];
                }
                break;
            case 'hauler':
                body = [CARRY, CARRY, MOVE, MOVE];
                break;
            default:
                body = [WORK, CARRY, MOVE];
                break;
        }
    }
    else {
        switch (role) {
            case 'dismantle':
                body = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
                break;
            case 'interhauler':
                body = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
                break;
            case 'harvester':
            case 'miner':
                //console.log('harvester getBody with targetRoom ' + Game.rooms[targetRoom]);
                if (targetRoom && Game.rooms[targetRoom].controller.level < 4) {
                    body = [WORK, WORK, WORK, CARRY, MOVE, MOVE];
                }
                else {
                    body = [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE];
                }
                break;
            case 'claimer':
                body = [CLAIM, MOVE];
                break;
            case 'contracthauler':
            case 'minhauler':
            case 'powerProcessor':
                body = [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE];
                break;
            case 'patrol':
            case 'warrior':
                body = this.getSoldierBody({ tough: 10, attack: 20, move: 15 });
                //body = [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
                break;
            case 'testsquad':
                body = this.getSoldierBody({ tough: 1, attack: 1, move: 1 });
                break;
            case 'hauler':
                if (this.controller.level == 8) {
                    body = [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
                }
                else {
                    body = [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
                }
                break;
            case 'healer':
            case 'builder':
            case 'upgrader':
                if (targetRoom && Game.rooms[targetRoom].controller.level < 4) {
                    body = [WORK, WORK, CARRY, MOVE, MOVE];
                }
                else {
                    body = [WORK, WORK, WORK, CARRY, WORK, CARRY, MOVE, MOVE, MOVE];
                }
                break;
            case 'remoteworker':
                body = [WORK, WORK, WORK, CARRY, MOVE, MOVE];
                break;
            case 'drainer':
                body = this.getSoldierBody({ tough: 15, heal: 10, move: 13 });
                break;
            case 'medic':
                body = this.getSoldierBody({ tough: 5, heal: 10, move: 8 });
                //body = [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
                break;
            case 'archer':
                body = this.getSoldierBody({ tough: 5, rangedAttack: 10, move: 8 });
                break;
            default:
                body = [WORK, CARRY, WORK, CARRY, WORK, CARRY, MOVE, MOVE, MOVE];
        }
    }
    return body;
};
Room.prototype.runBuildQueue = function () {
    var bq = this.memory.buildQueue;
    console.log(this.name + ' build queue length ' + bq.length);
    var availableSpawns = _.filter(this.spawns, { 'spawning': null });
    //console.log('available spawns: ' + availableSpawns);
    availableSpawns.forEach(function (spawn) {
        if (bq.length == 0) {
            return;
        }
        ;
        var embryo = bq.shift();
        //console.log('executing build queue');
        embryo.memory.role = embryo.role; // all creeps need this
        var creepname = this.name + '-' + spawn.name + '-' + Game.time;
        //const body = [WORK,CARRY,WORK,CARRY,MOVE,MOVE];
        var body = this.getCreepBody(embryo.role, embryo.memory.targetRoom);
        switch (spawn.spawnCreep(body, creepname, { dryRun: true, memory: embryo.memory })) {
            case OK:
                //console.log(spawn.id + ' spawning ' + embryo.role );
                if (spawn.spawnCreep(body, creepname, { memory: embryo.memory }) == OK) {
                    return;
                }
                else {
                    // not adding the creep back, because this shouldn't happen since dry run succeeded!
                    console.log('error spawning creep');
                }
                break;
            case ERR_INVALID_ARGS:
                console.log(spawn + 'invalid args error spawning ' + embryo.role + ' with name ' + creepname);
                break;
            default:
                // put the creep back in the queue, but at the end
                bq.push(embryo);
                console.log(spawn + ' cannot spawn ' + embryo.role + ' with ' + body.length + ' body parts');
        }
    }, this);
};
Room.prototype.drawRoad = function (pos1, pos2) {
    // finds a path between pos1 and pos2, then drops construction sites for roads along that path
    var path = this.findPath(pos1, pos2, { ignoreCreeps: true, ignoreRoads: true, range: 1 });
    path.forEach(function (pos) {
        var x = pos.x;
        var y = pos.y;
        this.createConstructionSite(x, y, STRUCTURE_ROAD);
        //        console.log(x + ',' + y);
    }, this);
    console.log('path found has length ' + path.length);
};
Room.prototype.buildRoomRoads = function () {
    this.sources.forEach(function (source) {
        this.drawRoad(source.pos, this.controller.pos);
        this.spawns.forEach(function (spawn) {
            this.drawRoad(source.pos, spawn.pos);
        }, this);
        if (this.storage) {
            this.drawRoad(source.pos, this.storage.pos);
        }
        if (this.controller.level > 5 && this.minerals) {
            this.drawRoad(source.pos, this.minerals[0].pos);
        }
        if (this.terminal) {
            this.drawRoad(source.pos, this.terminal.pos);
        }
    }, this);
    this.labs.forEach(function (lab) {
        this.drawRoad(lab.pos, this.storage.pos);
    }, this);
    if (this.terminal && this.minerals[0]) {
        this.drawRoad(this.terminal.pos, this.minerals[0].pos);
    }
};
Room.prototype.buildSourceContainers = function () {
    this.sources.forEach(function (source) {
        var path = this.findPath(source.pos, this.controller.pos, { ignoreCreeps: true, ignoreRoads: true, range: 1 });
        console.log('building container at ' + path[0].x + ',' + path[0].y);
        if (this.createConstructionSite(path[0].x, path[0].y, STRUCTURE_CONTAINER) != 0) {
            console.log(this.name + ': Error creating contruction site');
        }
    }, this);
};
/**
 * Spawns a contracthauler to refill a terminal - defaults to energy
 * @param {string} [energy] One of the RESOURCE_ constants
 */
Room.prototype.refillTerminal = function (rsrc) {
    // this odesn't work right now, use typeof === 'undefined' instead?
    if (!rsrc) {
        var rsrc_1 = 'energy';
    }
    if (rsrc != 'energy') {
        console.log('refillTerminal only does energy at this time');
        return false;
    }
    switch (this.memory.energyState) {
        case 'sending':
            var amountToRefill = 50000 - this.terminal.store[RESOURCE_ENERGY];
            break;
        default:
            var amountToRefill = 20000 - this.terminal.store[RESOURCE_ENERGY];
            break;
    }
    this.addToCreepBuildQueue('contracthauler', { resource: rsrc, total: amountToRefill, dropTarget: this.terminal.id, pullTarget: this.storage.id, job: 'refillTerminal' });
};
/**
 * Checks if there's already a creep performing a specific job
 * Returns true if there is, false if there is not
 * @param {string} job - the job to check on
 */
Room.prototype.hasCreepWithJob = function (j) {
    var _this = this;
    var roomCreeps2 = _.filter(Game.creeps, function (creep) { return creep.room.name == _this.name; });
    var queuedCreeps = _.filter(this.memory.buildQueue, function (c) { return c.memory.job == j; });
    var allCreeps = roomCreeps2.concat(queuedCreeps);
    if (_.filter(allCreeps, function (c) { return c.memory.job == j; }).length > 0) {
        return true;
    }
    else {
        return false;
    }
};
Room.prototype.getTotalCreeps = function (role) {
    var _this = this;
    // returns an array of the existing creeps with this role in this room plus those in the build queue
    var roomCreeps2 = _.filter(Game.creeps, function (creep) { return creep.room.name == _this.name; });
    var creepsTargetingRoom = _.filter(Game.creeps, function (creep) { return creep.memory.targetRoom == _this.name || creep.memory.workRoom == _this.name; });
    var totalCreeps = _.uniq(roomCreeps2.concat(creepsTargetingRoom));
    //console.log(this.name + ' has ' + roomCreeps2.length + ' creeps with role ' + role);
    var liveCreeps = _.filter(totalCreeps, function (creep) { return creep.memory.role == role; });
    //TODO: this needs to include buildqueues of all rooms, not just this one 
    // so walk the array of rooms. go through each buildqueue, and look for any creeps with role targeting this room
    var potentialCreeps = _.filter(this.memory.buildQueue, { role: role });
    return liveCreeps.concat(potentialCreeps);
};
Room.prototype.minWallStrength = function () {
    // find all walls, sum their strength, divide by number of them
    var wallHits = this.walls.map(function (w) { return w.hits; });
    return _.min(wallHits);
};
/**
 * Observes a target room from the current room
 * @param {string} roomToObserve - name of room to observe
 */
Room.prototype.observeRoom = function (roomToObserve) {
    if (this.observer) {
        switch (this.observer.observeRoom(roomToObserve)) {
            case OK:
                break;
            default:
                console.log(this.name + ' error observing room ' + roomToObserve);
                return false;
        }
        ;
    }
};
/* Gauges threat level to the room - returns the count of attack and heal body parts on hostile creeps */
Room.prototype.getThreatLevel = function () {
    var hostileCreeps = this.find(FIND_HOSTILE_CREEPS);
    var threatLevel = 0;
    hostileCreeps.forEach(function (creep) {
        //console.log(this.name + 'found creep attacker ' + creep.name)
        threatLevel += creep.getActiveBodyparts(ATTACK);
        threatLevel += creep.getActiveBodyparts(RANGED_ATTACK);
        threatLevel += creep.getActiveBodyparts(HEAL);
    }, this);
    return threatLevel;
};
module.exports = {
    handleRoom: function (room, minsToTrack) {
        // don't process rooms without controllers
        if (!room.controller) {
            return;
        }
        ;
        // don't process rooms I don't own
        if (!room.controller.my) {
            return;
        }
        ;
        // init
        try {
            if (!room.memory.labQueue) {
                room.memory.labQueue = [];
            }
            if (!room.memory.buildQueue) {
                room.memory.buildQueue = [];
            }
            if (!room.memory.energyState) {
                room.memory.energyState = 'normal';
            }
            if (!room.memory.wallLevel) {
                room.memory.wallLevel = (room.controller.level * room.controller.level) * 12000;
            }
            if (!room.memory.minType) {
                room.memory.minType = 'generic';
            }
        }
        catch (err) {
            console.log(room.name + " error during init: " + err);
        }
        room.boostAvailable = [];
        if (room.memory.minType == 'boosttest' || room.memory.frontier) {
            var attackBoostLab = room.labs[0];
            var healBoostLab = room.labs[1];
            var armorBoostLab = room.labs[2];
            //const moveBoostLab = room.labs[3];
            if (attackBoostLab) {
                if ((attackBoostLab.store[RESOURCE_UTRIUM_HYDRIDE] >= 300 || attackBoostLab.store[RESOURCE_UTRIUM_ACID] >= 300 || attackBoostLab.store[RESOURCE_CATALYZED_UTRIUM_ACID] >= 300)
                    && attackBoostLab.store[RESOURCE_ENERGY] >= 200) {
                    room.boostAvailable.push('attack');
                }
            }
            if (healBoostLab) {
                if ((healBoostLab.store[RESOURCE_LEMERGIUM_OXIDE] >= 300 || healBoostLab.store[RESOURCE_LEMERGIUM_ALKALIDE] >= 300 || healBoostLab.store[RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE] >= 300)
                    && healBoostLab.store[RESOURCE_ENERGY] >= 200) {
                    room.boostAvailable.push('heal');
                }
            }
            if (armorBoostLab) {
                if ((armorBoostLab.store[RESOURCE_GHODIUM_OXIDE] >= 300 || armorBoostLab.store[RESOURCE_GHODIUM_ALKALIDE] >= 300 || armorBoostLab.store[RESOURCE_CATALYZED_GHODIUM_ALKALIDE] >= 300)
                    && armorBoostLab.store[RESOURCE_ENERGY] >= 200) {
                    room.boostAvailable.push('armor');
                }
            }
            /*    if (moveBoostLab) {
                   if ((moveBoostLab.store[RESOURCE_ZYNTHIUM_OXIDE] >= 300 || moveBoostLab.store[RESOURCE_ZYNTHIUM_ALKALIDE] >= 300 || moveBoostLab.store[RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE] >= 300)
                   && moveBoostLab.store[RESOURCE_ENERGY] >= 200) {
                       room.boostAvailable.push('move');
                   }
                } */
            //console.log(room.name + room.boostAvailable);
        }
        var towers = room.towers;
        var dismantleTarget; //have to define up here so tower code can find it
        for (var i in towers) {
            var tower = towers[i];
            if (!room.memory.foundHostiles && (tower.energy > tower.energyCapacity / 2)) {
                var damagedCreeps = tower.room.find(FIND_MY_CREEPS, {
                    filter: function (c) { return ((c.hits < c.hitsMax)); }
                });
                var closestDamagedCreep = tower.pos.findClosestByRange(damagedCreeps);
                if (closestDamagedCreep) {
                    tower.heal(closestDamagedCreep);
                    console.log(room + ' healing creep ' + closestDamagedCreep.name);
                }
                var DamagedStructures = tower.room.find(FIND_STRUCTURES, {
                    filter: function (structure) { return ((structure.hits < structure.hitsMax) && (structure.hits < 5000)); }
                });
                DamagedStructures.forEach(function (s) {
                    if (s.pos.lookFor(LOOK_FLAGS, { filter: { color: COLOR_RED } }).length > 0) {
                        _.remove(DamagedStructures, s);
                    }
                });
                var closestDamagedStructure = tower.pos.findClosestByRange(DamagedStructures);
                if (closestDamagedStructure) {
                    if (!(closestDamagedStructure == dismantleTarget)) {
                        tower.repair(closestDamagedStructure);
                    }
                }
            }
            else {
                // this is duplicated with main.js right now - should really pass it in //TODO
                //var enemies = room.find(FIND_HOSTILE_CREEPS);
                // whitelist for nice dude next to me
                /* if (room.name == 'W27N26') {
                    _.remove(this.hostileCreeps, function (e) { return e.owner.username == 'Totalschaden' });
                } */
                var enemyHealers = _.filter(room.hostileCreeps, function (c) { return c.canHeal(); });
                var closestHostile = {};
                var closestHealer = tower.pos.findClosestByRange(enemyHealers);
                if (tower.pos.getRangeTo(closestHealer) < 12) {
                    closestHostile = closestHealer;
                }
                else {
                    closestHostile = tower.pos.findClosestByRange(room.hostileCreeps);
                }
                if (closestHostile) {
                    if (tower.pos.getRangeTo(closestHostile) < 12) {
                        tower.attack(closestHostile);
                    }
                }
            }
            if (room.memory.foundHostiles && tower.hits < (tower.hitsMax / 2)) {
                room.needsSafeRoom = true;
            }
        } // end towers
        if (room.storage && room.terminal) {
            var amountToSend = 30000; // how much energy to send between rooms 
            switch (room.memory.energyState) {
                case 'normal':
                    if (room.storage.store[RESOURCE_ENERGY] > 700000) {
                        if (room.terminal.store.getFreeCapacity() < amountToSend) {
                            console.log(room.name + ' terminal too full to load energy');
                            break;
                        }
                        console.log(room.name + ' needs to send energy, has ' + room.storage.store[RESOURCE_ENERGY]);
                        room.memory.energyState = 'loading';
                    }
                    break;
                case 'loading':
                    if (!room.hasCreepWithJob('loadingTerminal')) {
                        //console.log(room.name + ' would be spawning CH here');
                        room.memory.taskID = Memory.taskID;
                        Memory.taskID++;
                        room.addToCreepBuildQueue('contracthauler', { respawn: true, resource: RESOURCE_ENERGY, total: amountToSend, dropTarget: room.terminal.id, pullTarget: room.storage.id, taskID: room.memory.taskID, job: 'loadingTerminal' });
                    }
                    var taskCreep = _.filter(room.contracthaulers, function (c) { return c.memory.taskID == room.memory.taskID; })[0];
                    if (taskCreep && taskCreep.memory.processed >= amountToSend) {
                        room.memory.energyState = 'sending';
                        taskCreep.memory.role = 'recycle';
                        console.log(room.name + ' finished loading');
                    }
                    break;
                case 'sending':
                    var targetRoom = room.findNearestRoomNeedingEnergy(amountToSend);
                    try {
                        //console.log(room.name + ' sending energy to ' + targetRoom.name);
                        if (typeof targetRoom === 'undefined') {
                            break;
                        }
                        ;
                        switch (room.terminal.send(RESOURCE_ENERGY, amountToSend, targetRoom.name)) {
                            case 0:
                                room.memory.energyState = 'normal';
                                targetRoom.memory.energyState = 'unloading';
                                console.log(room.name + ' finished sending to ' + targetRoom.name);
                                break;
                            case -11:
                                // terminal in cooldown
                                console.log(room.name + ' wants to send energy but terminal is in cooldown');
                                break;
                            case -6:
                                // not enough energy to send
                                console.log(room.name + " does not have enough energy to send");
                                if (!room.hasCreepWithJob('refillTerminal')) {
                                    console.log(room.name + ' spawning refill creep');
                                    room.refillTerminal('energy');
                                }
                                break;
                            default:
                                console.log(room.name + 'Error sending from ' + room.name + ' to ' + targetRoom.name);
                                Game.notify('Error sending from ' + room.name + ' to ' + targetRoom.name);
                                break;
                        }
                    }
                    catch (err) {
                        console.log(err + ' while sending in ' + room.name);
                    }
                    break;
                case 'unloading':
                    if (!room.hasCreepWithJob('unloadingTerminal')) {
                        room.memory.taskID = Memory.taskID;
                        Memory.taskID++;
                        var amtToWithdraw = room.terminal.store[RESOURCE_ENERGY] >= amountToSend ? amountToSend : room.terminal.store[RESOURCE_ENERGY];
                        console.log(room.name + ' ' + amtToWithdraw);
                        if (amtToWithdraw <= 20000) {
                            console.log(room.name + ' trying to withdraw too much energy, resetting energyState');
                            room.memory.energyState = 'normal';
                            break;
                        }
                        ;
                        room.addToCreepBuildQueue('contracthauler', { respawn: true, resource: RESOURCE_ENERGY, total: amtToWithdraw, dropTarget: room.storage.id, pullTarget: room.terminal.id, taskID: room.memory.taskID, job: 'unloadingTerminal' });
                    }
                    var unloadTaskCreep = _.filter(room.contracthaulers, function (c) { return c.memory.taskID == room.memory.taskID; })[0];
                    if (unloadTaskCreep && unloadTaskCreep.memory.processed >= amountToSend) {
                        room.memory.energyState = 'normal';
                        unloadTaskCreep.memory.role = 'recycle';
                        console.log(room.name + ' finished unloading');
                    }
                    break;
                default:
                    break;
            }
        }
        try {
            if (room.memory.buildQueue.length > 0) {
                room.runBuildQueue();
            }
        }
        catch (err) {
            console.log(room.name + ' ' + err);
        }
        if (room.powerSpawn) {
            if (room.powerSpawn.energy > 50 && room.powerSpawn.power > 1) {
                room.powerSpawn.processPower();
            }
        }
        minsToTrack.forEach(function (min) {
            if (typeof room.terminal !== 'undefined') {
                Game.minTotal[min] += room.terminal.store[min];
            }
        });
        //console.log(room.avgWallStrength() + ' ' + room.memory.wallLevel);
        if ((Game.time % 79) == 0) {
            if ((room.controller.level == 8) && (room.minWallStrength() >= room.memory.wallLevel)) {
                console.log(room.name + ' increasing wall level to ' + (room.memory.wallLevel + 10000));
                room.memory.wallLevel = room.memory.wallLevel + 10000;
            }
            // reset wall strength at halfway through earlier RCLs
            if ((room.controller.level < 8) && (((room.controller.progress / room.controller.progressTotal) < 0.55) && ((room.controller.progress / room.controller.progressTotal) > 0.45))) {
                room.memory.wallLevel = (room.controller.level * room.controller.level) * 12000;
            }
        }
    }
};
