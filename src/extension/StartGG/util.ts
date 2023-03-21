import { MatchInfo, PlayerInfo, TeamInfo } from "../../types";
import { Replicants } from "../../types/replicants";
import context from "../context";
import { ConnectCodeID, SetInfo } from "./types";

export const CONNECT_CODE_REGEX = /([a-zA-Z]+|\d+).*?([0-9]{1,3})/;

export function getTournamentInfoFromUrl() {
  const url = context.nodecg.readReplicant<string>(Replicants.StartGGUrl);
  return parseTournamentInfo(url);
}

export function updateSubtitleFromStartGG(setInfo: SetInfo) {
  const subtitleInfo = context.nodecg.Replicant<string>(
    Replicants.TournamentSubtitle
  );
  subtitleInfo.value = formatStartGGRound(setInfo);
}

export function formatStartGGRound(roundInfo: SetInfo) {
  const includeBestOf = roundInfo.bestOf > 0;
  return `${roundInfo.roundInfo}${
    includeBestOf ? ` - Bo${roundInfo.bestOf}` : ""
  }`;
}

export function setTeamsFromCCIDs(playerIDs: ConnectCodeID[]) {
  const matchInfo = context.nodecg.Replicant<MatchInfo>(Replicants.MatchInfo);

  if (playerIDs.length == 2) {
    if (
      matchInfo.value.teams.every((t) => {
        return t.players.every((op) => {
          return playerIDs.some((p) => p.code == op.code);
        });
      })
    ) {
      // Selecting a match from StartGG after already spectating a match just update the information
      matchInfo.value.teams.forEach((t) => {
        const code = t.players[0].code;
        const pid = playerIDs.find((p) => p.code == code);

        if (pid) {
          t.name = pid.displayName;
        }
      });
    } else {
      // Make new teams
      const teams: TeamInfo[] = [];
      playerIDs.forEach((ccid) => {
        const ti = new TeamInfo();
        ti.name = ccid.displayName;
        const pi = new PlayerInfo();
        pi.code = ccid.code;
        ti.players.push(pi);
        teams.push(ti);
      });
      matchInfo.value.teams = teams;
    }
  } else {
    context.nodecg.log.error("Not two players found fot setTeamsFromCCIDs");
  }
}

export function parseTournamentInfo(url: string) {
  // format
  // https://start.gg/tournament/{take this}/event/{event Slug}/brackets/{PhaseId}/{PhaseGroupId}
  // Phase Group ID is for different waves in a single phase

  if (!url) {
    // Don't log here as we don't care about StartGG if there's no URL set
    return null;
  }

  // Required tournament and event slug
  // phase and phaseGroup IDs are optional
  const regex =
    /start\.gg\/tournament\/([a-zA-Z0-9-]+)\/event\/([a-zA-Z0-9-]+)(?:\/brackets\/)?([0-9]+)?(?:\/)?([0-9]+)?/;

  const groups = regex.exec(url);

  if (!groups) {
    context.nodecg.log.error("Groups not found");
    return null;
  }

  return {
    tournamentSlug: groups[1],
    eventSlug: groups[2],
    phaseId: groups[3] ? Number(groups[3]) : null,
    phaseGroup: groups[4] ? Number(groups[4]) : null,
  };
}
