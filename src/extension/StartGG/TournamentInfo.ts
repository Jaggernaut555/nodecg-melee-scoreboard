import startGGContext from "./startGGContext";
import { graphql } from "./gql";
import { ConnectedAccounts, ConnectCodeID, SetInfo } from "./types";
import context from "../context";
import {
  ActivityState,
  EventActiveSetsQuery,
  EventEntrantsQuery,
  EventSetsForEntrantsQuery,
  FindSetIdFromEntrantsQuery,
  FindSetInfoQuery,
  TournamentQueryQuery,
} from "./gql/graphql";
import _ from "lodash";
import {
  CONNECT_CODE_REGEX,
  getTournamentInfoFromUrl,
  setTeamsFromCCIDs,
  updateSubtitleFromStartGG,
} from "./util";
import { MatchInfo, SetPreviewInfo } from "../../types";
import { ReplicantType } from "../../types/replicants";
import { MessageType } from "../../types/messages";

const findEntrantsInEventQuery = graphql(`
  query EventEntrants($eventId: ID!, $page: Int!, $perPage: Int!) {
    event(id: $eventId) {
      id
      name
      entrants(query: { page: $page, perPage: $perPage }) {
        pageInfo {
          total
          totalPages
        }
        nodes {
          id
          participants {
            id
            gamerTag
            connectedAccounts
            prefix
          }
        }
      }
    }
  }
`);

const findSetIdFromEntrantsQuery = graphql(`
  query findSetIdFromEntrants($eventId: ID!, $entrantIds: [ID]!) {
    event(id: $eventId) {
      id
      name
      sets(sortType: STANDARD, filters: { entrantIds: $entrantIds }) {
        nodes {
          id
          state
        }
      }
    }
  }
`);

const findSetInfoQuery = graphql(`
  query findSetInfo($setId: ID!) {
    set(id: $setId) {
      id
      state
      fullRoundText
      round
      phaseGroup {
        rounds {
          bestOf
          number
        }
      }
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
`);

// Not sure what states are what other than 3 is COMPLETED
const eventSetsForEntrantsQuery = graphql(`
  query EventSetsForEntrants($eventId: ID!, $entrantIds: [ID]!) {
    event(id: $eventId) {
      id
      name
      sets(
        sortType: STANDARD
        filters: { hideEmpty: true, state: [1, 2, 4], entrantIds: $entrantIds }
      ) {
        nodes {
          id
          state
          fullRoundText
          games {
            winnerId
          }
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

// Find all active sets for displaying in choice dialog
const eventActiveSetsQuery = graphql(`
  query EventActiveSets($eventId: ID!, $page: Int!) {
    event(id: $eventId) {
      id
      name
      sets(
        page: $page
        perPage: 20
        sortType: STANDARD
        filters: { hideEmpty: true, state: [1, 2, 4] }
      ) {
        pageInfo {
          total
          page
          perPage
        }
        nodes {
          id
          state
          fullRoundText
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
            }
          }
        }
      }
    }
  }
`);

const findEventIdQuery = graphql(/* GraphQL */ `
  query TournamentQuery($tournamentSlug: String, $eventSlug: String) {
    tournament(slug: $tournamentSlug) {
      id
      name
      events(filter: { slug: $eventSlug }) {
        id
        name
        state
      }
    }
  }
`);

/// if we cannot find the event/tournament then return a -1. Otherwise return the event ID
async function findEventId(): Promise<string | null> {
  const tournamentInfo = getTournamentInfoFromUrl();

  if (!tournamentInfo || !startGGContext.client) {
    return null;
  }

  let eventIdRes: TournamentQueryQuery;
  try {
    const eir = await startGGContext.client.request(
      findEventIdQuery,
      tournamentInfo
    );
    eventIdRes = eir;
  } catch (e) {
    context.nodecg.log.error(e);
    return null;
  }

  if (
    !eventIdRes.tournament ||
    !eventIdRes.tournament.events ||
    eventIdRes.tournament.events.length == 0 ||
    eventIdRes.tournament.events[0]?.state != ActivityState.Active ||
    !eventIdRes.tournament.events[0].id
  ) {
    return null;
  }

  return eventIdRes.tournament.events[0].id;
}

export async function findEntrantIDs(
  codes: string[]
): Promise<ConnectCodeID[]> {
  // Find an entrant's ID based on their connect code
  // This is gonna require getting the data for all entrants
  // since I don't think we can filter on connectedAccounts

  const eventId = await findEventId();
  let page = 1;
  const perPage = 25;
  let keepGoing = true;
  const results: ConnectCodeID[] = [];

  if (!eventId) {
    return [];
  }

  while (keepGoing) {
    let res: EventEntrantsQuery;
    try {
      const r = await startGGContext.client.request(findEntrantsInEventQuery, {
        eventId,
        page,
        perPage,
      });
      res = r;
    } catch (e) {
      // If this errors just return none of the results
      context.nodecg.log.error(e);
      return [];
    }

    if (
      !res.event ||
      !res.event.entrants ||
      !res.event.entrants.nodes ||
      res.event.entrants.nodes?.length == 0
    ) {
      return [];
    }

    for (const entrant of res.event.entrants.nodes) {
      if (
        !entrant ||
        !entrant.id ||
        !entrant.participants ||
        entrant.participants?.length == 0 ||
        !entrant.participants[0]?.gamerTag
      ) {
        continue;
      }

      const connectedAccounts = entrant?.participants[0]
        ?.connectedAccounts as ConnectedAccounts;

      if (
        !connectedAccounts ||
        !connectedAccounts.slippi ||
        !connectedAccounts.slippi.value
      ) {
        continue;
      }
      const groups = CONNECT_CODE_REGEX.exec(connectedAccounts.slippi.value);

      if (!groups) {
        continue;
      }

      const entrantCode = `${groups[1].toUpperCase()}#${groups[2]}`;

      if (codes.some((c) => c == entrantCode)) {
        let displayName = entrant.participants[0].gamerTag;
        // if they have a prefix, add it
        if (entrant.participants[0].prefix) {
          displayName = `${entrant.participants[0].prefix} ${displayName}`;
        }
        results.push({
          code: entrantCode,
          id: entrant.id,
          displayName: displayName,
        });
      }
    }

    // Either continue if more results or quit out now
    if (res.event.entrants.nodes?.length < perPage) {
      keepGoing = false;
    }

    page += 1;
  }

  return results;
}

// Finds the info of the first found active set between two entrants
export async function findCommonSetInfo(
  connectCodeIDs: ConnectCodeID[]
): Promise<SetInfo | null> {
  const eventId = await findEventId();
  if (!eventId) {
    return null;
  }

  const entrantIds = connectCodeIDs.map((cc) => cc.id);

  let setIdRes: FindSetIdFromEntrantsQuery;

  try {
    const sir = await startGGContext.client.request(
      findSetIdFromEntrantsQuery,
      {
        eventId,
        entrantIds,
      }
    );
    setIdRes = sir;
  } catch (e) {
    context.nodecg.log.error(e);
    return null;
  }

  if (
    setIdRes.event &&
    setIdRes.event.sets &&
    setIdRes.event.sets.nodes &&
    setIdRes.event.sets.nodes
  ) {
    // check for a currently active set between them
    const activeSet = setIdRes.event.sets.nodes.find((s) => s?.state == 2);

    if (activeSet && activeSet.id) {
      return findSetInfo(activeSet.id);
    }
  }

  return null;
}

// TODO: this should accept a set id and return the won game IDs
// The other stuff should be done elsewhere and call this
export async function findWonGamesOfSet(
  connectCodeIDs: ConnectCodeID[]
): Promise<string[]> {
  const eventId = await findEventId();
  if (!eventId) {
    return [];
  }

  const entrantIds = connectCodeIDs.map((cc) => cc.id);

  let res: EventSetsForEntrantsQuery;
  try {
    const r = await startGGContext.client.request(eventSetsForEntrantsQuery, {
      eventId,
      entrantIds,
    });
    res = r;
  } catch (e) {
    context.nodecg.log.error(e);
    return [];
  }

  if (
    res.event &&
    res.event.sets &&
    res.event.sets.nodes &&
    res.event.sets.nodes
  ) {
    // check for a currently active set between them
    const activeSets = res.event.sets.nodes.find((s) => s?.state == 2);

    // TODO: Use the alternative way from set.slots[i].standing.stats.score.value
    if (activeSets && activeSets.games && activeSets.games.length > 0) {
      const games = activeSets.games.filter((g) => g?.winnerId);
      // All of these games have winners
      if (games) {
        const winningCodes = games.map((g) => {
          const p = connectCodeIDs.find((cci) => cci.id == `${g?.winnerId}`);
          return p?.code;
        });

        return _.compact(winningCodes);
      }
    }
  }

  return [];
}

export async function findSetInfo(setId: string): Promise<SetInfo | null> {
  let setInfoRes: FindSetInfoQuery;
  try {
    const sir = await startGGContext.client.request(findSetInfoQuery, {
      setId: setId,
    });
    setInfoRes = sir;
  } catch (e) {
    context.nodecg.log.error(e);
    return null;
  }

  if (setInfoRes && setInfoRes.set && setInfoRes.set.fullRoundText) {
    const retVal: SetInfo = {
      id: "",
      roundInfo: "",
      bestOf: -1,
    };
    retVal.id = setId;
    retVal.roundInfo = setInfoRes.set.fullRoundText;

    if (
      setInfoRes.set.round &&
      setInfoRes.set.phaseGroup &&
      setInfoRes.set.phaseGroup.rounds &&
      setInfoRes.set.phaseGroup.rounds.some(
        (r) => r?.number == setInfoRes.set?.round
      )
    ) {
      retVal.bestOf =
        setInfoRes.set.phaseGroup.rounds.find(
          (r) => r?.number == setInfoRes.set?.round
        )?.bestOf ?? -1;
    }

    return retVal;
  }

  return null;
}

export async function getAllActiveSets(page = 1) {
  const eventId = await findEventId();
  if (!eventId) {
    context.nodecg.log.error("No event ID to search for active sets");
    return [];
  }

  let res: EventActiveSetsQuery;
  try {
    const r = await startGGContext.client.request(eventActiveSetsQuery, {
      eventId: eventId,
      page: page,
    });
    res = r;
  } catch (e) {
    context.nodecg.log.error(e);
    return [];
  }

  if (
    res &&
    res.event &&
    res.event.sets &&
    res.event.sets.nodes &&
    res.event.sets.nodes.length
  ) {
    if (
      res.event.sets.pageInfo &&
      res.event.sets.pageInfo.total &&
      res.event.sets.pageInfo.total > 20
    ) {
      // Use navigation
      context.nodecg.sendMessage(MessageType.UseSetPageNavigation);
    }

    const sets = res.event.sets.nodes
      .map((n) => {
        if (n && n.id && n.fullRoundText && n.slots && n.slots.length == 2) {
          const players = n.slots.map((s) => {
            // For some reason sometimes the score is -1 for a match that hasn't yet started
            const score = s?.standing?.stats?.score?.value ?? 0;
            return {
              name: s?.entrant?.name ?? "",
              score: score < 0 ? 0 : score,
            };
          });

          if (players.some((p) => !p.name)) {
            return null;
          }

          const val: SetPreviewInfo = {
            id: n.id,
            round: n.fullRoundText,
            players,
          };
          return val;
        }
        return null;
      })
      .filter((n): n is SetPreviewInfo => n != null);

    return sets;
  }
  return [];
}

/**
 * Assigns the set found at the set ID to the match info
 *
 * @param setId Set ID to use
 * @returns
 */
export async function useSetInfo(setId: string): Promise<void> {
  let setInfoRes: FindSetInfoQuery;
  try {
    const sir = await startGGContext.client.request(findSetInfoQuery, {
      setId: setId,
    });
    setInfoRes = sir;
  } catch (e) {
    context.nodecg.log.error(e);
    return;
  }

  if (setInfoRes && setInfoRes.set && setInfoRes.set.fullRoundText) {
    const players: [ConnectCodeID, number][] = [];
    const setInfo: SetInfo = {
      id: "",
      roundInfo: "",
      bestOf: -1,
    };
    setInfo.id = setId;
    setInfo.roundInfo = setInfoRes.set.fullRoundText;

    if (
      setInfoRes.set.round &&
      setInfoRes.set.phaseGroup &&
      setInfoRes.set.phaseGroup.rounds &&
      setInfoRes.set.phaseGroup.rounds.some(
        (r) => r?.number == setInfoRes.set?.round
      )
    ) {
      setInfo.bestOf =
        setInfoRes.set.phaseGroup.rounds.find(
          (r) => r?.number == setInfoRes.set?.round
        )?.bestOf ?? -1;
    }

    setInfoRes.set.slots?.forEach((e) => {
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

        const score = e.standing?.stats?.score?.value ?? 0;

        players.push([
          {
            displayName: displayName,
            id: e.entrant.id,
            code: entrantCode,
          },
          score < 0 ? 0 : score,
        ]);
      }
    });

    // set set info
    updateSubtitleFromStartGG(setInfo);

    // set player info + scores
    if (players.length == 2) {
      setTeamsFromCCIDs(players.map((c) => c[0]));
      const matchInfo = context.nodecg.Replicant<MatchInfo>(
        ReplicantType.MatchInfo
      );

      matchInfo.value.teams.forEach((t) => {
        const code = t.players[0].code;
        const pid = players.find((p) => p[0].code == code);

        if (pid) {
          t.score = pid[1];
        }
      });
    }
  }
}
