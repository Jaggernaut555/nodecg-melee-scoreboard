import passport from "passport";
import { Strategy as TwitchStrategy, Scope } from "@hewmen/passport-twitch";
import session from "express-session";
import { ApiClient } from "@twurple/api";
import { RefreshingAuthProvider, AccessToken } from "@twurple/auth";

import context from "../context";
import twitchContext from "./twitchContext";

const SESSION_SECRET = "Some Text";
const SCOPE = [
  Scope.UserReadEmail,
  Scope.ChannelReadPredictions,
  Scope.ChannelManagePredictions,
];

export function initTwitchExpress(): boolean {
  const twitchClientId = context.nodecg.readReplicant<string>("twitchClientId");
  const twitchClientSecret =
    context.nodecg.readReplicant<string>("twitchClientSecret");

  if (!twitchClientId || !twitchClientSecret) {
    context.nodecg.log.error(
      "Set ClientId and ClientSecret to use twitch integration"
    );
    return false;
  }

  const app = context.nodecg.Router();

  app.use(
    session({
      secret: SESSION_SECRET,
      resave: true,
      saveUninitialized: true,
      cookie: { maxAge: 1000 * 5 },
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user: never, done) {
    done(null, user);
  });

  const strategy = new TwitchStrategy(
    {
      clientID: twitchClientId,
      clientSecret: twitchClientSecret,
      callbackURL: `http://${context.nodecg.config.baseURL}/auth/twitch/callback`,
      scope: SCOPE,
    },
    (accessToken, refreshToken, profile, done) => {
      if (!refreshToken) {
        context.nodecg.log.error("Refresh Token not valid");
        done(new Error("Refresh Token not valid"));
        return;
      }

      const twitchUser = context.nodecg.Replicant<string>("twitchUserId");
      twitchUser.value = profile.id;
      if (
        profile.broadcaster_type !== "affiliate" &&
        profile.broadcaster_type !== "partner"
      ) {
        context.nodecg.log.error(
          "User must be an affiliate or partner to run predictions"
        );
        done(
          new Error("User must be an affiliate or partner to run predictions")
        );
        return;
      }

      const tokenData =
        context.nodecg.Replicant<AccessToken>("twitchAccessToken");
      tokenData.value = {
        accessToken,
        refreshToken,
        expiresIn: 0,
        obtainmentTimestamp: 0,
        scope: SCOPE,
      };

      done(null, { twitchId: profile.id });
    }
  );

  // DEBUGGING: Useful for resetting the requested scopes
  // strategy.authorizationParams = () => {
  //   return {
  //     force_verify: true,
  //   };
  // };
  passport.use(strategy);

  app.get("/auth/twitch", passport.authenticate("twitch"));
  app.get(
    "/auth/twitch/callback",
    passport.authenticate("twitch", { failureRedirect: "/" }),
    (req, res) => {
      // Successful authentication, redirect home.
      context.nodecg.log.info("Logged in to twitch API");

      try {
        initApi();
      } catch (err) {
        context.nodecg.log.error(err);
      }

      res.redirect("/");
    }
  );

  context.nodecg.mount(app);

  const token = context.nodecg.readReplicant<AccessToken>("twitchAccessToken");
  if (token) {
    initApi();
  }

  return true;
}

function initApi() {
  const twitchClientId = context.nodecg.readReplicant<string>("twitchClientId");
  const twitchClientSecret =
    context.nodecg.readReplicant<string>("twitchClientSecret");
  const twitchUser = context.nodecg.readReplicant<string>("twitchUserId");

  if (!twitchClientId || !twitchClientSecret) {
    context.nodecg.log.error(
      "Set ClientId and ClientSecret to use twitch integration"
    );
    return;
  }

  const token = context.nodecg.readReplicant<AccessToken>("twitchAccessToken");

  if (!token) {
    context.nodecg.log.error("Re-log in to twitch to get a new token");
    return;
  }

  if (!twitchContext.authProvider) {
    twitchContext.authProvider = new RefreshingAuthProvider({
      clientId: twitchClientId,
      clientSecret: twitchClientSecret,
      onRefresh: async (newToken: AccessToken) => {
        const tokenData =
          context.nodecg.Replicant<AccessToken>("twitchAccessToken");
        tokenData.value = newToken;
        context.nodecg.log.debug("Refreshing token");
      },
    });
    twitchContext.authProvider.addUser(twitchUser, token);
  }
  if (!twitchContext.api) {
    twitchContext.api = new ApiClient({
      authProvider: twitchContext.authProvider,
    });
  }

  const validLogin = context.nodecg.Replicant<boolean>("twitchedValidLogin");
  validLogin.value = true;
}
