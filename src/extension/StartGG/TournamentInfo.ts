import startGGContext from "./startGGContext";
import { graphql } from "./gql";
import { ConnectedAccounts, ConnectCodeIDs, SetInfo } from "./types";
import context from "../context";
import {
  ActivityState,
  EventEntrantsQuery,
  EventSetsQuery,
  FindSetIdQuery,
  FindSetInfoQuery,
  TournamentQueryQuery,
} from "./gql/graphql";
import _ from "lodash";

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
          }
        }
      }
    }
  }
`);

const findSetIdQuery = graphql(`
  query FindSetId($eventId: ID!, $entrantIds: [ID]!) {
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
        entrant {
          id
          name
        }
      }
    }
  }
`);

// Not sure what states are what other than 3 is COMPLETED
const findSetsInEventQuery = graphql(`
  query EventSets($eventId: ID!, $entrantIds: [ID]!) {
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
          totalGames
          games {
            winnerId
          }
          slots {
            id
            entrant {
              id
              name
              participants {
                connectedAccounts
              }
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

function parseTournamentInfo(url: string) {
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

/// if we cannot find the event/tournament then return a -1. Otherwise return the event ID
async function findEventId(): Promise<string | null> {
  const url = context.nodecg.readReplicant<string>("startGGUrl");

  const tournamentInfo = parseTournamentInfo(url);

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
): Promise<ConnectCodeIDs[]> {
  // Find an entrant's ID based on their connect code
  // This is gonna require getting the data for all entrants
  // since I don't think we can filter on connectedAccounts

  const eventId = await findEventId();
  let page = 1;
  const perPage = 25;
  let keepGoing = true;
  const results: ConnectCodeIDs[] = [];

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

    // try to find it
    const regex = /([a-zA-Z]+|\d+).*?([0-9]{1,3})/;

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
      const groups = regex.exec(connectedAccounts.slippi.value);

      if (!groups) {
        continue;
      }

      const entrantCode = `${groups[1].toUpperCase()}#${groups[2]}`;

      if (codes.some((c) => c == entrantCode)) {
        results.push({
          code: entrantCode,
          id: entrant.id,
          displayName: entrant.participants[0].gamerTag,
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
  connectCodeIDs: ConnectCodeIDs[]
): Promise<SetInfo | null> {
  const eventId = await findEventId();
  if (!eventId) {
    return null;
  }

  const entrantIds = connectCodeIDs.map((cc) => cc.id);

  let setIdRes: FindSetIdQuery;

  try {
    const sir = await startGGContext.client.request(findSetIdQuery, {
      eventId,
      entrantIds,
    });
    setIdRes = sir;
  } catch (e) {
    context.nodecg.log.error(e);
    return null;
  }

  const retVal: SetInfo = {
    id: "",
    roundInfo: "",
    bestOf: -1,
  };

  if (
    setIdRes.event &&
    setIdRes.event.sets &&
    setIdRes.event.sets.nodes &&
    setIdRes.event.sets.nodes
  ) {
    // check for a currently active set between them
    const activeSet = setIdRes.event.sets.nodes.find((s) => s?.state == 2);

    if (activeSet && activeSet.id) {
      // We have the set id
      // Now we need to try to find the round info
      let setInfoRes: FindSetInfoQuery;
      try {
        const sir = await startGGContext.client.request(findSetInfoQuery, {
          setId: activeSet.id,
        });
        setInfoRes = sir;
      } catch (e) {
        context.nodecg.log.error(e);
        return null;
      }

      if (setInfoRes && setInfoRes.set && setInfoRes.set.fullRoundText) {
        retVal.id = activeSet.id;
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
    }
  }

  return null;
}

// TODO: this should accept a set id and return the won game IDs
// The other stuff should be done elsewhere and call this
export async function findWonGamesOfSet(
  connectCodeIDs: ConnectCodeIDs[]
): Promise<string[]> {
  const eventId = await findEventId();
  if (!eventId) {
    return [];
  }

  const entrantIds = connectCodeIDs.map((cc) => cc.id);

  let res: EventSetsQuery;
  try {
    const r = await startGGContext.client.request(findSetsInEventQuery, {
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
