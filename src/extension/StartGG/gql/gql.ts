/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n  query EventEntrants($eventId: ID!, $page: Int!, $perPage: Int!) {\n    event(id: $eventId) {\n      id\n      name\n      entrants(query: { page: $page, perPage: $perPage }) {\n        pageInfo {\n          total\n          totalPages\n        }\n        nodes {\n          id\n          participants {\n            id\n            gamerTag\n            connectedAccounts\n            prefix\n          }\n        }\n      }\n    }\n  }\n": types.EventEntrantsDocument,
    "\n  query findSetIdFromEntrants($eventId: ID!, $entrantIds: [ID]!) {\n    event(id: $eventId) {\n      id\n      name\n      sets(sortType: STANDARD, filters: { entrantIds: $entrantIds }) {\n        nodes {\n          id\n          state\n        }\n      }\n    }\n  }\n": types.FindSetIdFromEntrantsDocument,
    "\n  query findSetInfo($setId: ID!) {\n    set(id: $setId) {\n      id\n      state\n      fullRoundText\n      round\n      phaseGroup {\n        rounds {\n          bestOf\n          number\n        }\n      }\n      slots {\n        id\n        standing {\n          stats {\n            score {\n              value\n            }\n          }\n        }\n        entrant {\n          id\n          name\n          participants {\n            connectedAccounts\n            prefix\n          }\n        }\n      }\n    }\n  }\n": types.FindSetInfoDocument,
    "\n  query EventSetsForEntrants($eventId: ID!, $entrantIds: [ID]!) {\n    event(id: $eventId) {\n      id\n      name\n      sets(\n        sortType: STANDARD\n        filters: { hideEmpty: true, state: [1, 2, 4], entrantIds: $entrantIds }\n      ) {\n        nodes {\n          id\n          state\n          fullRoundText\n          games {\n            winnerId\n          }\n          slots {\n            id\n            standing {\n              stats {\n                score {\n                  value\n                }\n              }\n            }\n            entrant {\n              id\n              name\n              participants {\n                connectedAccounts\n                prefix\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n": types.EventSetsForEntrantsDocument,
    "\n  query EventActiveSets($eventId: ID!) {\n    event(id: $eventId) {\n      id\n      name\n      sets(\n        sortType: STANDARD\n        filters: { hideEmpty: true, state: [1, 2, 3, 4] }\n      ) {\n        nodes {\n          id\n          state\n          fullRoundText\n          slots {\n            id\n            standing {\n              stats {\n                score {\n                  value\n                }\n              }\n            }\n            entrant {\n              id\n              name\n            }\n          }\n        }\n      }\n    }\n  }\n": types.EventActiveSetsDocument,
    "\n  query TournamentQuery($tournamentSlug: String, $eventSlug: String) {\n    tournament(slug: $tournamentSlug) {\n      id\n      name\n      events(filter: { slug: $eventSlug }) {\n        id\n        name\n        state\n      }\n    }\n  }\n": types.TournamentQueryDocument,
    "\n  query StreamQueueInfo($tournamentSlug: String!) {\n    tournament(slug: $tournamentSlug) {\n      id\n      streamQueue {\n        id\n        stream {\n          streamSource\n          streamName\n        }\n      }\n    }\n  }\n": types.StreamQueueInfoDocument,
    "\n  query StreamQueueSets($tournamentSlug: String!) {\n    tournament(slug: $tournamentSlug) {\n      id\n      streamQueue {\n        id\n        stream {\n          streamSource\n          streamName\n        }\n        sets {\n          id\n          slots {\n            id\n            standing {\n              stats {\n                score {\n                  value\n                }\n              }\n            }\n            entrant {\n              id\n              name\n              participants {\n                connectedAccounts\n                prefix\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n": types.StreamQueueSetsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query EventEntrants($eventId: ID!, $page: Int!, $perPage: Int!) {\n    event(id: $eventId) {\n      id\n      name\n      entrants(query: { page: $page, perPage: $perPage }) {\n        pageInfo {\n          total\n          totalPages\n        }\n        nodes {\n          id\n          participants {\n            id\n            gamerTag\n            connectedAccounts\n            prefix\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query EventEntrants($eventId: ID!, $page: Int!, $perPage: Int!) {\n    event(id: $eventId) {\n      id\n      name\n      entrants(query: { page: $page, perPage: $perPage }) {\n        pageInfo {\n          total\n          totalPages\n        }\n        nodes {\n          id\n          participants {\n            id\n            gamerTag\n            connectedAccounts\n            prefix\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query findSetIdFromEntrants($eventId: ID!, $entrantIds: [ID]!) {\n    event(id: $eventId) {\n      id\n      name\n      sets(sortType: STANDARD, filters: { entrantIds: $entrantIds }) {\n        nodes {\n          id\n          state\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query findSetIdFromEntrants($eventId: ID!, $entrantIds: [ID]!) {\n    event(id: $eventId) {\n      id\n      name\n      sets(sortType: STANDARD, filters: { entrantIds: $entrantIds }) {\n        nodes {\n          id\n          state\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query findSetInfo($setId: ID!) {\n    set(id: $setId) {\n      id\n      state\n      fullRoundText\n      round\n      phaseGroup {\n        rounds {\n          bestOf\n          number\n        }\n      }\n      slots {\n        id\n        standing {\n          stats {\n            score {\n              value\n            }\n          }\n        }\n        entrant {\n          id\n          name\n          participants {\n            connectedAccounts\n            prefix\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query findSetInfo($setId: ID!) {\n    set(id: $setId) {\n      id\n      state\n      fullRoundText\n      round\n      phaseGroup {\n        rounds {\n          bestOf\n          number\n        }\n      }\n      slots {\n        id\n        standing {\n          stats {\n            score {\n              value\n            }\n          }\n        }\n        entrant {\n          id\n          name\n          participants {\n            connectedAccounts\n            prefix\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query EventSetsForEntrants($eventId: ID!, $entrantIds: [ID]!) {\n    event(id: $eventId) {\n      id\n      name\n      sets(\n        sortType: STANDARD\n        filters: { hideEmpty: true, state: [1, 2, 4], entrantIds: $entrantIds }\n      ) {\n        nodes {\n          id\n          state\n          fullRoundText\n          games {\n            winnerId\n          }\n          slots {\n            id\n            standing {\n              stats {\n                score {\n                  value\n                }\n              }\n            }\n            entrant {\n              id\n              name\n              participants {\n                connectedAccounts\n                prefix\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query EventSetsForEntrants($eventId: ID!, $entrantIds: [ID]!) {\n    event(id: $eventId) {\n      id\n      name\n      sets(\n        sortType: STANDARD\n        filters: { hideEmpty: true, state: [1, 2, 4], entrantIds: $entrantIds }\n      ) {\n        nodes {\n          id\n          state\n          fullRoundText\n          games {\n            winnerId\n          }\n          slots {\n            id\n            standing {\n              stats {\n                score {\n                  value\n                }\n              }\n            }\n            entrant {\n              id\n              name\n              participants {\n                connectedAccounts\n                prefix\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query EventActiveSets($eventId: ID!) {\n    event(id: $eventId) {\n      id\n      name\n      sets(\n        sortType: STANDARD\n        filters: { hideEmpty: true, state: [1, 2, 3, 4] }\n      ) {\n        nodes {\n          id\n          state\n          fullRoundText\n          slots {\n            id\n            standing {\n              stats {\n                score {\n                  value\n                }\n              }\n            }\n            entrant {\n              id\n              name\n            }\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query EventActiveSets($eventId: ID!) {\n    event(id: $eventId) {\n      id\n      name\n      sets(\n        sortType: STANDARD\n        filters: { hideEmpty: true, state: [1, 2, 3, 4] }\n      ) {\n        nodes {\n          id\n          state\n          fullRoundText\n          slots {\n            id\n            standing {\n              stats {\n                score {\n                  value\n                }\n              }\n            }\n            entrant {\n              id\n              name\n            }\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TournamentQuery($tournamentSlug: String, $eventSlug: String) {\n    tournament(slug: $tournamentSlug) {\n      id\n      name\n      events(filter: { slug: $eventSlug }) {\n        id\n        name\n        state\n      }\n    }\n  }\n"): (typeof documents)["\n  query TournamentQuery($tournamentSlug: String, $eventSlug: String) {\n    tournament(slug: $tournamentSlug) {\n      id\n      name\n      events(filter: { slug: $eventSlug }) {\n        id\n        name\n        state\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query StreamQueueInfo($tournamentSlug: String!) {\n    tournament(slug: $tournamentSlug) {\n      id\n      streamQueue {\n        id\n        stream {\n          streamSource\n          streamName\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query StreamQueueInfo($tournamentSlug: String!) {\n    tournament(slug: $tournamentSlug) {\n      id\n      streamQueue {\n        id\n        stream {\n          streamSource\n          streamName\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query StreamQueueSets($tournamentSlug: String!) {\n    tournament(slug: $tournamentSlug) {\n      id\n      streamQueue {\n        id\n        stream {\n          streamSource\n          streamName\n        }\n        sets {\n          id\n          slots {\n            id\n            standing {\n              stats {\n                score {\n                  value\n                }\n              }\n            }\n            entrant {\n              id\n              name\n              participants {\n                connectedAccounts\n                prefix\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query StreamQueueSets($tournamentSlug: String!) {\n    tournament(slug: $tournamentSlug) {\n      id\n      streamQueue {\n        id\n        stream {\n          streamSource\n          streamName\n        }\n        sets {\n          id\n          slots {\n            id\n            standing {\n              stats {\n                score {\n                  value\n                }\n              }\n            }\n            entrant {\n              id\n              name\n              participants {\n                connectedAccounts\n                prefix\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;