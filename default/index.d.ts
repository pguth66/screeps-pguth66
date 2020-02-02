interface CreepMemory {
    role: string;
    job?: string;
    respawn?: boolean;
    targetSource?: string;
    targetRoom?: string;
    workRoom?: string;
    baseRoom?: string;
    target?: string;
    spawnRoom?: string;
}

interface RoomMemory {
    priorityRefill?: boolean;
    energyState: string;
    stage?: string;
}

interface Creep {
    respawn(): boolean;
    canHeal(): boolean;
    findAnyDepositTarget(): Structure[];
    hasOnlyMoveParts(): boolean;
    getBody(): void;
    tellCreepToMove(creep: Creep): void;
    flee(fleeTarget: any): void;
    getResources(target: any): void;
    inRangeToTarget(target: any): boolean;
    getBoosted(boost: string): void;
    hasMinerals(): boolean;
    moveToRoom(room: string): void;
    hasPower(): boolean;
    hasEnergy(): boolean;
    hasTarget(): boolean;
    moveToTarget(target: any): void;
    attackTarget(target: any): boolean;
    creepLog(text: string): void;
    move(direction: any): number;
}

interface Room {
    addToCreepBuildQueue(creepType: string, MemoryObject: CreepMemory): boolean;
    findNearestRoomSelling(mineral: string): Room;
    findNearestRoomNeedingEnergy(amountToSend: number): Room;
    getMinsFromNearestRoom(mineral: string): any;
    addToLabQueue(lab: StructureLab, resource:string): boolean;
    getSoldierBody(parts: any): string[];
    getCreepBody(role: string, targetRoom: string): string[];
    runBuildQueue(): void;
    drawRoad(pos1: RoomPosition, pos2: RoomPosition): void;
    buildRoomRoads(): void;
    buildSourceContainers(): void;
    refillTerminal(rsrc?: string): void;
    hasCreepWithJob(j: string): boolean;
    getTotalCreeps(role: string): Creep[];
    minWallStrength(): number;
    observeRoom(roomToObserve: Room): boolean;
    getThreatLevel(): number;
    minerals?: any[];
    terminal?: StructureTerminal;
}

interface Memory {
    roomToAttack: string;
    taskID: number;
}

interface Game {
    minTotal: object;
}