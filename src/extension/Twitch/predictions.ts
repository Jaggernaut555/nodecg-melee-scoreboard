import { MatchInfo, TwitchPredictionStatus } from "../../types/index.d";
import { getPlayerIdentifier } from "../../util";

import twitchContext from "./twitchContext";
import context from "../context";

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
      autoLockAfter: 180,
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

export function endPrediction() {
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
