import { MatchInfo, PlayerInfo, TeamInfo } from "../types/index.d";

export function copyMatchInfo(info: MatchInfo): MatchInfo {
  const temp = new MatchInfo();

  info.teams.forEach((t) => {
    temp.teams.push(copyTeamInfo(t));
  });

  return temp;
}

export function copyTeamInfo(
  info: TeamInfo,
  playerOverride: PlayerInfo[] = []
): TeamInfo {
  const temp = new TeamInfo();

  if (playerOverride && playerOverride.length > 0) {
    playerOverride.forEach((p) => {
      temp.players.push(copyPlayerInfo(p));
    });
  } else {
    info.players.forEach((p) => {
      temp.players.push(copyPlayerInfo(p));
    });
  }

  temp.bracket = info.bracket;
  temp.score = info.score;
  temp.outcomeId = info.outcomeId;
  temp.name = info.name;
  temp.pointBet = info.pointBet;

  return temp;
}

export function copyPlayerInfo(info: PlayerInfo): PlayerInfo {
  const temp = new PlayerInfo();
  temp.character = info.character;
  temp.code = info.code;
  temp.color = info.color;
  temp.name = info.name;
  temp.port = info.port;
  return temp;
}

export function getPlayerIdentifier(info: PlayerInfo): string {
  return info.name
    ? info.name
    : info.code
    ? info.code
    : `P${info.port} ${info.color} ${info.character}`;
}
