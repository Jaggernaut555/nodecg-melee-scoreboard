import { MatchInfo, TwitchPredictionStatus } from "../../types/index.d";
import { getPlayerIdentifier } from "../../util";

import twitchContext from "./twitchContext";
import context from "../context";

// prediction time in seconds
// TODO: could configure in ui
const PREDICTION_TIME = 180;

export async function updatePredictionStatus() {
  const twitchUser = context.nodecg.readReplicant<string>("twitchUserId");
  const predictionId = context.nodecg.readReplicant<string>(
    "twitchCurrentPredictionId"
  );
  const predictionStatus = context.nodecg.Replicant<TwitchPredictionStatus>(
    "twitchCurrentPredictionStatus"
  );

  if (!twitchUser || !predictionId) {
    predictionStatus.value = "Stopped";
    return;
  }

  return twitchContext.api.predictions
    .getPredictionById(twitchUser, predictionId)
    .then((pred) => {
      // If no prediction set to stopped
      if (!pred) {
        predictionStatus.value = "Stopped";
        return;
      }

      // if it has ended set to stopped
      if (pred.endDate) {
        predictionStatus.value = "Stopped";
      } else if (pred.lockDate) {
        // if it is locked set to locked
        predictionStatus.value = "Locked";
      } else {
        // if it is running set to started
        predictionStatus.value = "Started";
      }
    });
}

// TODO: Could track prediction stats and display them on overlay
export function createPrediction() {
  const matchInfo = context.nodecg.Replicant<MatchInfo>("matchInfo");
  const subtitle = context.nodecg.readReplicant<string>("TournamentSubtitle");
  const twitchUser = context.nodecg.readReplicant<string>("twitchUserId");

  if (!twitchUser) {
    context.nodecg.log.error("Can't create prediction");
    return;
  }

  if (!matchInfo.value.teams || matchInfo.value.teams.length < 2) {
    context.nodecg.log.error("Invalid teams to create prediction");
    return;
  }

  twitchContext.api.predictions
    .createPrediction(twitchUser, {
      title: subtitle ? subtitle : "Who wins?",
      outcomes: matchInfo.value.teams.map((t) =>
        t.players.map((p) => getPlayerIdentifier(p)).join("+")
      ),
      autoLockAfter: PREDICTION_TIME,
    })
    .then((pred) => {
      const predictionId = context.nodecg.Replicant<string>(
        "twitchCurrentPredictionId"
      );
      predictionId.value = pred.id;
      pred.outcomes.forEach((outcomes, i) => {
        matchInfo.value.teams[i].outcomeId = outcomes.id;
      });
      const predictionStatus = context.nodecg.Replicant<TwitchPredictionStatus>(
        "twitchCurrentPredictionStatus"
      );
      predictionStatus.value = "Started";

      // Try to update the prediction status just after it should time out
      setTimeout(() => {
        updatePredictionStatus();
      }, (PREDICTION_TIME + 5) * 1000);
    })
    .catch((err) => {
      context.nodecg.log.error(err);
    });
}

export function lockPrediction() {
  const twitchUser = context.nodecg.readReplicant<string>("twitchUserId");
  const predictionId = context.nodecg.readReplicant<string>(
    "twitchCurrentPredictionId"
  );

  if (!twitchUser || !predictionId) {
    context.nodecg.log.error("Can't lock prediction");
    return;
  }

  twitchContext.api.predictions
    .lockPrediction(twitchUser, predictionId)
    .then((pred) => {
      context.nodecg.log.debug(`Locked prediction ${pred.id}`);
      const predictionStatus = context.nodecg.Replicant<TwitchPredictionStatus>(
        "twitchCurrentPredictionStatus"
      );
      predictionStatus.value = "Locked";
    })
    .catch((err) => {
      context.nodecg.log.error(err);
    });
}

export function resolvePrediction() {
  const twitchUser = context.nodecg.readReplicant<string>("twitchUserId");
  const predictionId = context.nodecg.readReplicant<string>(
    "twitchCurrentPredictionId"
  );
  const matchInfo = context.nodecg.readReplicant<MatchInfo>("matchInfo");

  if (!twitchUser || !predictionId) {
    context.nodecg.log.error("Can't resolve prediction");
    return;
  }

  // pick the winner index based on higher score
  const winningScore = matchInfo.teams.reduce((prev, cur) => {
    return prev.score > cur.score ? prev : cur;
  }).score;
  const winners = matchInfo.teams.filter((t) => t.score == winningScore);
  if (winners.length != 1) {
    context.nodecg.log.error("Not one winner in prediction");
    return;
  }

  twitchContext.api.predictions
    .resolvePrediction(twitchUser, predictionId, winners[0].outcomeId)
    .then((pred) => {
      context.nodecg.log.debug(`Completed prediction ${predictionId}`);
      const predictionStatus = context.nodecg.Replicant<TwitchPredictionStatus>(
        "twitchCurrentPredictionStatus"
      );
      predictionStatus.value = "Stopped";
      context.nodecg.log.debug(`resolved ${pred.id}`);
    })
    .catch((err) => {
      context.nodecg.log.error(err);
    });
}

export function cancelPrediction() {
  const twitchUser = context.nodecg.readReplicant<string>("twitchUserId");
  const predictionId = context.nodecg.readReplicant<string>(
    "twitchCurrentPredictionId"
  );

  if (!twitchUser || !predictionId) {
    context.nodecg.log.error("Can't cancel prediction");
    const predictionStatus = context.nodecg.Replicant<TwitchPredictionStatus>(
      "twitchCurrentPredictionStatus"
    );
    predictionStatus.value = "Stopped";
    return;
  }

  twitchContext.api.predictions
    .cancelPrediction(twitchUser, predictionId)
    .then((pred) => {
      context.nodecg.log.debug(`Cancelled prediction ${pred.id}`);
      const predictionStatus = context.nodecg.Replicant<TwitchPredictionStatus>(
        "twitchCurrentPredictionStatus"
      );
      predictionStatus.value = "Stopped";
    })
    .catch((err) => {
      context.nodecg.log.error(err);
    });
}

export function progressPrediction() {
  const predictionStatus = context.nodecg.readReplicant<TwitchPredictionStatus>(
    "twitchCurrentPredictionStatus"
  );

  switch (predictionStatus) {
    case "Stopped":
      createPrediction();
      break;
    case "Started":
      lockPrediction();
      break;
    case "Locked":
      resolvePrediction();
      break;
    default:
      context.nodecg.log.error("Invalid state to progress prediction");
      return;
  }
}
