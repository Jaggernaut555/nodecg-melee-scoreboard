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
 * Therefore it is highly recommended to use the babel-plugin for production.
 */
const documents = {
    "\n  query EventEntrants($eventId: ID!, $page: Int!, $perPage: Int!) {\n    event(id: $eventId) {\n      id\n      name\n      entrants(query: { page: $page, perPage: $perPage }) {\n        pageInfo {\n          total\n          totalPages\n        }\n        nodes {\n          id\n          participants {\n            id\n            gamerTag\n            connectedAccounts\n            prefix\n          }\n        }\n      }\n    }\n  }\n": types.EventEntrantsDocument,
    "\n  query FindSetId($eventId: ID!, $entrantIds: [ID]!) {\n    event(id: $eventId) {\n      id\n      name\n      sets(sortType: STANDARD, filters: { entrantIds: $entrantIds }) {\n        nodes {\n          id\n          state\n        }\n      }\n    }\n  }\n": types.FindSetIdDocument,
    "\n  query findSetInfo($setId: ID!) {\n    set(id: $setId) {\n      id\n      state\n      fullRoundText\n      round\n      phaseGroup {\n        rounds {\n          bestOf\n          number\n        }\n      }\n      slots {\n        id\n        entrant {\n          id\n          name\n        }\n      }\n    }\n  }\n": types.FindSetInfoDocument,
    "\n  query EventSets($eventId: ID!, $entrantIds: [ID]!) {\n    event(id: $eventId) {\n      id\n      name\n      sets(\n        sortType: STANDARD\n        filters: { hideEmpty: true, state: [1, 2, 4], entrantIds: $entrantIds }\n      ) {\n        nodes {\n          id\n          state\n          fullRoundText\n          totalGames\n          games {\n            winnerId\n          }\n          slots {\n            id\n            entrant {\n              id\n              name\n              participants {\n                connectedAccounts\n                prefix\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n": types.EventSetsDocument,
    "\n  query TournamentQuery($tournamentSlug: String, $eventSlug: String) {\n    tournament(slug: $tournamentSlug) {\n      id\n      name\n      events(filter: { slug: $eventSlug }) {\n        id\n        name\n        state\n      }\n    }\n  }\n": types.TournamentQueryDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
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
export function graphql(source: "\n  query FindSetId($eventId: ID!, $entrantIds: [ID]!) {\n    event(id: $eventId) {\n      id\n      name\n      sets(sortType: STANDARD, filters: { entrantIds: $entrantIds }) {\n        nodes {\n          id\n          state\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query FindSetId($eventId: ID!, $entrantIds: [ID]!) {\n    event(id: $eventId) {\n      id\n      name\n      sets(sortType: STANDARD, filters: { entrantIds: $entrantIds }) {\n        nodes {\n          id\n          state\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query findSetInfo($setId: ID!) {\n    set(id: $setId) {\n      id\n      state\n      fullRoundText\n      round\n      phaseGroup {\n        rounds {\n          bestOf\n          number\n        }\n      }\n      slots {\n        id\n        entrant {\n          id\n          name\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query findSetInfo($setId: ID!) {\n    set(id: $setId) {\n      id\n      state\n      fullRoundText\n      round\n      phaseGroup {\n        rounds {\n          bestOf\n          number\n        }\n      }\n      slots {\n        id\n        entrant {\n          id\n          name\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query EventSets($eventId: ID!, $entrantIds: [ID]!) {\n    event(id: $eventId) {\n      id\n      name\n      sets(\n        sortType: STANDARD\n        filters: { hideEmpty: true, state: [1, 2, 4], entrantIds: $entrantIds }\n      ) {\n        nodes {\n          id\n          state\n          fullRoundText\n          totalGames\n          games {\n            winnerId\n          }\n          slots {\n            id\n            entrant {\n              id\n              name\n              participants {\n                connectedAccounts\n                prefix\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query EventSets($eventId: ID!, $entrantIds: [ID]!) {\n    event(id: $eventId) {\n      id\n      name\n      sets(\n        sortType: STANDARD\n        filters: { hideEmpty: true, state: [1, 2, 4], entrantIds: $entrantIds }\n      ) {\n        nodes {\n          id\n          state\n          fullRoundText\n          totalGames\n          games {\n            winnerId\n          }\n          slots {\n            id\n            entrant {\n              id\n              name\n              participants {\n                connectedAccounts\n                prefix\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TournamentQuery($tournamentSlug: String, $eventSlug: String) {\n    tournament(slug: $tournamentSlug) {\n      id\n      name\n      events(filter: { slug: $eventSlug }) {\n        id\n        name\n        state\n      }\n    }\n  }\n"): (typeof documents)["\n  query TournamentQuery($tournamentSlug: String, $eventSlug: String) {\n    tournament(slug: $tournamentSlug) {\n      id\n      name\n      events(filter: { slug: $eventSlug }) {\n        id\n        name\n        state\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;