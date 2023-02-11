import { AccessToken } from "@twurple/auth/";
import { TwitchPredictionStatus } from "../../types/index.d";

import context from "../context";
import { initTwitchExpress } from "./express";
import {
  cancelPrediction,
  createPrediction,
  resolvePrediction,
  lockPrediction,
  progressPrediction,
} from "./predictions";
import twitchContext from "./twitchContext";

export function initTwitch() {
  initMessages();
  initReplicants();
  initTwitchExpress();
  cleanApi();
}

function initReplicants() {
  const twitchCallbackUrl =
    context.nodecg.Replicant<string>("twitchCallbackUrl");
  twitchCallbackUrl.value = `http://${context.nodecg.config.baseURL}/auth/twitch/callback`;

  const validLogin = context.nodecg.Replicant<boolean>("twitchedValidLogin");
  validLogin.value = false;

  const twitchClientId = context.nodecg.Replicant<string>("twitchClientId");
  twitchClientId.once("change", (newValue) => {
    context.nodecg.log.debug(`twitchClientId ${newValue}`);
  });
  const twitchClientSecret =
    context.nodecg.Replicant<string>("twitchClientSecret");
  twitchClientSecret.once("change", (newValue) => {
    context.nodecg.log.debug(`twitchClientSecret ${newValue}`);
  });

  // TODO: replicant initialization
  // For some reason this doesn't happen if I'm not listening for it
  const twitchUser = context.nodecg.Replicant<string>("twitchUserId");
  twitchUser.once("change", (newValue) => {
    context.nodecg.log.debug(`twitchUserId ${newValue}`);
  });

  const tokenData = context.nodecg.Replicant<AccessToken>("twitchAccessToken");
  tokenData.once("change", (newValue) => {
    context.nodecg.log.debug(newValue);
  });
  // initialize prediction id
  context.nodecg.Replicant<string>("twitchCurrentPredictionId", {
    defaultValue: "",
  });
  context.nodecg.Replicant<TwitchPredictionStatus>(
    "twitchCurrentPredictionStatus",
    {
      defaultValue: "Stopped",
    }
  );
}

function initMessages() {
  context.nodecg.listenFor("twitchCreatePrediction", () => {
    createPrediction();
  });

  context.nodecg.listenFor("twitchLockPrediction", () => {
    lockPrediction();
  });

  context.nodecg.listenFor("twitchCancelPrediction", () => {
    cancelPrediction();
  });

  context.nodecg.listenFor("twitchResolvePrediction", () => {
    resolvePrediction();
  });

  context.nodecg.listenFor("twitchProgressPrediction", () => {
    progressPrediction();
  });

  context.nodecg.listenFor("twitchCheckToken", (val, ack) => {
    if (!initTwitchExpress()) {
      if (ack && !ack.handled) ack(new Error("Client settings not configured"));
      return;
    }

    if (ack && !ack.handled) {
      ack(null);
    }
  });
}

export async function cleanApi() {
  const twitchUser = context.nodecg.readReplicant<string>("twitchUserId");
  const predictionId = context.nodecg.Replicant<string>(
    "twitchCurrentPredictionId"
  );
  const predictionStatus = context.nodecg.Replicant<TwitchPredictionStatus>(
    "twitchCurrentPredictionStatus"
  );

  if (twitchContext.api && predictionId.value) {
    const prediction = await twitchContext.api.predictions.getPredictionById(
      twitchUser,
      predictionId.value
    );

    if (prediction) {
      if (prediction.endDate) {
        predictionId.value = "";
        predictionStatus.value = "Stopped";
      } else if (prediction.lockDate) {
        predictionStatus.value = "Locked";
      }
    } else {
      predictionId.value = "";
      predictionStatus.value = "Stopped";
    }
  } else {
    predictionId.value = "";
    predictionStatus.value = "Stopped";
  }
}
