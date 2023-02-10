import { NodeCG } from "nodecg-types/types/server";

export class PlayerInfo {
    name: string = "";
    code: string = "";
    character: string = "Fox";
    color: string = "default";
    port: number = 0;
}

export class TeamInfo {
    players: PlayerInfo[] = [];
    score: number = 0;
    bracket: Bracket = '[W]';
}

// replicants must be an object, not an array
export class MatchInfo {
    teams: TeamInfo[] = [];
}

export type Bracket = '[W]' | '[L]';

export type SlippiMethod = "realtime" | "fileWatcher";

export type ConnectionStatus = "connected" | "disconnected";
