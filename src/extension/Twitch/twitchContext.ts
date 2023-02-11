import { ApiClient } from "@twurple/api";
import { RefreshingAuthProvider } from "@twurple/auth";

let api: ApiClient;
let authProvider: RefreshingAuthProvider;

export default {
  get api() {
    return api;
  },

  set api(apiClient) {
    api = apiClient;
  },

  get authProvider() {
    return authProvider;
  },
  set authProvider(auth) {
    authProvider = auth;
  },
};
