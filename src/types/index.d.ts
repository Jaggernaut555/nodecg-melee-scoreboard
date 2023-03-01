// TODO: rename this file to types.ts or index.ts and redo all imports

export class PlayerInfo {
  name = "";
  code = "";
  character = "Fox";
  color = "default";
  port = 0;
}

export class TeamInfo {
  players: PlayerInfo[] = [];
  score = 0;
  bracket: Bracket = "[W]";
  outcomeId = "";
  /**
   * The amount of channel points bet on this team
   */
  pointBet = 0;
  name = "";
}

// replicants must be an object, not an array
export class MatchInfo {
  teams: TeamInfo[] = [];
}

export type Bracket = "[W]" | "[L]";

export type SlippiMethod = "realtime" | "fileWatcher";

export type ConnectionStatus = "connected" | "disconnected";

export type TwitchPredictionStatus =
  | "Started"
  | "Locked"
  | "Stopped"
  | "External";
