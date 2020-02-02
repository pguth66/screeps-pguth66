interface CreepMemory {
    role: string;
    respawn?: boolean;
    targetSource?: string;
    targetRoom?: string;
    workRoom?: string;
    baseRoom?: string;
    target?: string;
}

interface RoomMemory {
    priorityRefill?: boolean;
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
}

interface Memory {
    roomToAttack: string;
}