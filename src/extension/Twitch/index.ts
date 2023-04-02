import { AccessToken } from "@twurple/auth/";
import { TwitchPredictionStatus } from "../../types";

import context from "../context";
import { initTwitchExpress } from "./express";
import {
  cancelPrediction,
  createPrediction,
  resolvePrediction,
  lockPrediction,
  progressPrediction,
  initEventSubListener,
} from "./predictions";
import twitchContext from "./twitchContext";
import { ReplicantType } from "../../types/replicants";
import { MessageType } from "../../types/messages";

export function initTwitch() {
  initMessages();
  initReplicants();
  initTwitchExpress();
  cleanApi();
  initEventSubListener();
}

function initReplicants() {
  const twitchCallbackUrl = context.nodecg.Replicant<string>(
    ReplicantType.TwitchCallbackUrl
  );
  twitchCallbackUrl.value = `http://${context.nodecg.config.baseURL}/auth/twitch/callback`;

  const validLogin = context.nodecg.Replicant<boolean>(
    ReplicantType.TwitchValidLogin
  );
  validLogin.value = false;

  const twitchClientId = context.nodecg.Replicant<string>(
    ReplicantType.TwitchClientId
  );
  twitchClientId.once("change", (newValue) => {
    context.nodecg.log.debug(`twitchClientId ${newValue}`);
  });
  const twitchClientSecret = context.nodecg.Replicant<string>(
    ReplicantType.TwitchClientSecret
  );
  twitchClientSecret.once("change", (newValue) => {
    context.nodecg.log.debug(`twitchClientSecret ${newValue}`);
  });

  // TODO: replicant initialization
  // For some reason this doesn't happen if I'm not listening for it
  const twitchUser = context.nodecg.Replicant<string>(
    ReplicantType.TwitchUserId
  );
  twitchUser.once("change", (newValue) => {
    context.nodecg.log.debug(`twitchUserId ${newValue}`);
  });

  const tokenData = context.nodecg.Replicant<AccessToken>(
    ReplicantType.TwitchAccessToken
  );
  tokenData.once("change", (newValue) => {
    context.nodecg.log.debug(newValue);
  });
  // initialize prediction id
  context.nodecg.Replicant<string>(ReplicantType.TwitchCurrentPredictionId, {
    defaultValue: "",
  });
  context.nodecg.Replicant<TwitchPredictionStatus>(
    ReplicantType.TwitchCurrentPredictionStatus,
    {
      defaultValue: "Stopped",
    }
  );
}

function initMessages() {
  context.nodecg.listenFor(MessageType.TwitchCreatePrediction, () => {
    createPrediction();
  });

  context.nodecg.listenFor(MessageType.TwitchLockPrediction, () => {
    lockPrediction();
  });

  context.nodecg.listenFor(MessageType.TwitchCancelPrediction, () => {
    cancelPrediction();
  });

  context.nodecg.listenFor(MessageType.TwitchResolvePrediction, () => {
    resolvePrediction();
  });

  context.nodecg.listenFor(MessageType.TwitchProgressPrediction, () => {
    progressPrediction();
  });

  context.nodecg.listenFor(MessageType.TwitchCheckToken, (val, ack) => {
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
  const twitchUser = context.nodecg.readReplicant<string>(
    ReplicantType.TwitchUserId
  );
  const predictionId = context.nodecg.Replicant<string>(
    ReplicantType.TwitchCurrentPredictionId
  );
  const predictionStatus = context.nodecg.Replicant<TwitchPredictionStatus>(
    ReplicantType.TwitchCurrentPredictionStatus
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
