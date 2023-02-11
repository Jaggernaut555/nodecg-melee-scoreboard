import { PlayerInfo, TeamInfo } from "../types/index.d";

export function copyTeamInfo(info: TeamInfo): TeamInfo {
  const temp = new TeamInfo();

  info.players.forEach((p) => {
    temp.players.push(copyPlayerInfo(p));
  });

  temp.bracket = info.bracket;
  temp.score = info.score;
  temp.outcomeId = info.outcomeId;

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
