import { MatchInfo, StreamQueueOption } from "../../types";
import { MessageType } from "../../types/messages";
import { ReplicantType } from "../../types/replicants";
import context from "../context";
import { graphql } from "./gql";
import { StreamQueueInfoQuery, StreamQueueSetsQuery } from "./gql/graphql";
import startGGContext from "./startGGContext";
import { findSetInfo } from "./TournamentInfo";
import { ConnectCodeID } from "./types";
import {
  CONNECT_CODE_REGEX,
  getTournamentInfoFromUrl,
  setTeamsFromCCIDs,
  updateSubtitleFromStartGG,
} from "./util";

const findStreamQueues = graphql(`
  query StreamQueueInfo($tournamentSlug: String!) {
    tournament(slug: $tournamentSlug) {
      id
      streamQueue {
        id
        stream {
          streamSource
          streamName
        }
      }
    }
  }
`);

// sets array is in order of stream queue
const findStreamQueueSets = graphql(`
  query StreamQueueSets($tournamentSlug: String!) {
    tournament(slug: $tournamentSlug) {
      id
      streamQueue {
        id
        stream {
          streamSource
          streamName
        }
        sets {
          id
          slots {
            id
            standing {
              stats {
                score {
                  value
                }
              }
            }
            entrant {
              id
              name
              participants {
                connectedAccounts
                prefix
              }
            }
          }
        }
      }
    }
  }
`);

export function initStreamQueue() {
  context.nodecg.listenFor(MessageType.UseNextStreamQueue, () => {
    useNextStreamQueueSet();
  });

  updateStreamQueueOptions();
  context.nodecg.listenFor(MessageType.RefreshStreamQueues, () => {
    updateStreamQueueOptions();
  });
}

async function updateStreamQueueOptions() {
  const SQOptions = context.nodecg.Replicant<StreamQueueOption[]>(
    ReplicantType.StreamQueueOptions,
    { defaultValue: [] }
  );

  const tournamentInfo = getTournamentInfoFromUrl();

  if (!tournamentInfo || !startGGContext.client) {
    SQOptions.value = [];
    return null;
  }

  let streamQueueInfo: StreamQueueInfoQuery;
  try {
    const sqi = await startGGContext.client.request(
      findStreamQueues,
      tournamentInfo
    );
    streamQueueInfo = sqi;
  } catch (e) {
    context.nodecg.log.error(e);
    SQOptions.value = [];
    return null;
  }
  if (
    streamQueueInfo &&
    streamQueueInfo.tournament &&
    streamQueueInfo.tournament.streamQueue
  ) {
    const options = streamQueueInfo.tournament.streamQueue.map((sq) => {
      const option: StreamQueueOption = {
        id: sq?.id ?? "",
        name: sq?.stream?.streamName ?? "",
      };
      return option;
    });
    SQOptions.value = options;
  } else {
    SQOptions.value = [];
  }
}

async function useNextStreamQueueSet() {
  const SQSelectedOption = context.nodecg.Replicant<StreamQueueOption>(
    ReplicantType.StreamQueueSelectedOption,
    { defaultValue: { name: "none", id: "none" } }
  );

  const tournamentInfo = getTournamentInfoFromUrl();
  const results: [ConnectCodeID, number][] = [];

  if (!tournamentInfo || !startGGContext.client) {
    return;
  }

  let streamSets: StreamQueueSetsQuery;
  try {
    const sqs = await startGGContext.client.request(
      findStreamQueueSets,
      tournamentInfo
    );
    streamSets = sqs;
  } catch (e) {
    context.nodecg.log.error(e);
    return;
  }

  if (
    streamSets &&
    streamSets.tournament &&
    streamSets.tournament.streamQueue &&
    streamSets.tournament.streamQueue.length > 0 &&
    streamSets.tournament.streamQueue[0]?.sets &&
    streamSets.tournament.streamQueue[0]?.sets?.length > 0 &&
    streamSets.tournament.streamQueue[0]?.sets[0]?.slots
  ) {
    const streamQueue = streamSets.tournament.streamQueue.find((o) => {
      return o?.id == SQSelectedOption.value.id;
    });

    // Use the first match in the queue
    // Set the team info to the player name/prefix here
    // set the score to this
    // set the connect code on player to this
    // don't need to set character or player name

    if (streamQueue && streamQueue.sets && streamQueue.sets.length > 0) {
      const set = streamQueue.sets[0];
      set?.slots?.forEach((e) => {
        if (
          e &&
          e.entrant &&
          e.entrant.id &&
          e.entrant.name &&
          e.entrant.participants &&
          e.entrant.participants.length > 0 &&
          e.entrant.participants[0]
        ) {
          const groups = CONNECT_CODE_REGEX.exec(
            e.entrant.participants[0]?.connectedAccounts.slippi.value
          );

          let entrantCode = "";
          // If there is an included connect code add it
          if (groups) {
            entrantCode = `${groups[1].toUpperCase()}#${groups[2]}`;
          }

          let displayName = e.entrant.name;
          // if they have a prefix, add it
          if (e.entrant.participants[0].prefix) {
            displayName = `${e.entrant.participants[0].prefix} ${displayName}`;
          }

          results.push([
            {
              displayName: displayName,
              id: e.entrant.id,
              code: entrantCode,
            },
            e.standing?.stats?.score?.value ?? 0,
          ]);
        }
      });

      if (set && set.id) {
        // TODO: Should this be done here? Maybe somewhere else
        const setInfo = await findSetInfo(set.id);
        if (setInfo) {
          updateSubtitleFromStartGG(setInfo);
        }
      }

      setTeamsFromCCIDs(results.map((c) => c[0]));

      // TODO: apparently you can get set.slot[0].standing.stats.score.value to get how many games have been won

      if (results.length == 2) {
        const matchInfo = context.nodecg.Replicant<MatchInfo>(
          ReplicantType.MatchInfo
        );

        matchInfo.value.teams.forEach((t) => {
          const code = t.players[0].code;
          const pid = results.find((p) => p[0].code == code);

          if (pid) {
            t.score = pid[1];
          }
        });
      }
    }
  } else {
    // Do something here?
    context.nodecg.log.error("Can't get data from stream queue");
  }
}
