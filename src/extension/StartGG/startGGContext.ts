import { GraphQLClient } from "graphql-request";

let token = "";
const url = "https://api.start.gg/gql/alpha";
let client: GraphQLClient;

export default {
  get token() {
    return token;
  },

  set token(newToken) {
    token = newToken;
    client = new GraphQLClient(url, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
  },

  get url() {
    return url;
  },

  set url(_) {
    throw new Error("The StartGG api URL cannot be changed");
  },

  get client() {
    return client;
  },

  set client(_) {
    throw new Error("Cannot manually set a client");
  },
};
