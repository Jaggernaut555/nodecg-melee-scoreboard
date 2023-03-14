import { MatchInfo, TwitchPredictionStatus } from "../../types/index.d";
import { getPlayerIdentifier } from "../../util";
import { EventSubWsListener } from "@twurple/eventsub-ws";

import twitchContext from "./twitchContext";
import context from "../context";
import { MessageType } from "../../types/messages";

// prediction time in seconds
// TODO: could configure in ui
const PREDICTION_TIME = 300;

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
    })
    .catch((err) => {
      context.nodecg.log.error(err);
      // If we can't cancel it make sure the prediction is stopped
      const predictionStatus = context.nodecg.Replicant<TwitchPredictionStatus>(
        "twitchCurrentPredictionStatus"
      );
      predictionStatus.value = "Stopped";
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

export function initEventSubListener() {
  const twitchUser = context.nodecg.readReplicant<string>("twitchUserId");

  const listener = new EventSubWsListener({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiClient: twitchContext.api as any,
    // TODO:
    // for some reason type @twurple/api/lib/client/ApiClient
    // is not assignable to type
    // @twurple/eventsub-base/node_modules/@twurple/api/lib/client/ApiClient
  });

  listener.start();

  listener.onChannelPredictionBegin(twitchUser, (pred) => {
    const predictionStatus = context.nodecg.Replicant<TwitchPredictionStatus>(
      "twitchCurrentPredictionStatus"
    );
    predictionStatus.value = "Started";
    const predictionId = context.nodecg.Replicant<string>(
      "twitchCurrentPredictionId"
    );
    predictionId.value = pred.id;

    const matchInfo = context.nodecg.Replicant<MatchInfo>("matchInfo");

    let teamsFound = 0;
    for (const outcome of pred.outcomes) {
      const t = matchInfo.value.teams.find((t) => t.outcomeId == outcome.id);

      if (t) {
        teamsFound += 1;
        t.pointBet = 0;
      }
    }

    // No use displaying the graphic if the prediction doesn't match what we expected from the setup
    if (teamsFound == 2) {
      context.nodecg.sendMessage(MessageType.PredictionStarted);
    }
  });

  listener.onChannelPredictionEnd(twitchUser, (pred) => {
    const predictionStatus = context.nodecg.Replicant<TwitchPredictionStatus>(
      "twitchCurrentPredictionStatus"
    );
    predictionStatus.value = "Stopped";
    const predictionId = context.nodecg.Replicant<string>(
      "twitchCurrentPredictionId"
    );
    predictionId.value = "";

    if (pred.winningOutcomeId) {
      context.nodecg.sendMessage(
        MessageType.PredictionEnded,
        pred.winningOutcomeId
      );
    } else {
      context.nodecg.sendMessage(MessageType.PredictionCancelled);
    }
  });

  listener.onChannelPredictionLock(twitchUser, (pred) => {
    const predictionStatus = context.nodecg.Replicant<TwitchPredictionStatus>(
      "twitchCurrentPredictionStatus"
    );
    predictionStatus.value = "Locked";
    const predictionId = context.nodecg.Replicant<string>(
      "twitchCurrentPredictionId"
    );
    predictionId.value = pred.id;

    context.nodecg.sendMessage(MessageType.PredictionLocked);
  });

  // This gets updated every time someone bets
  listener.onChannelPredictionProgress(twitchUser, (pred) => {
    const matchInfo = context.nodecg.Replicant<MatchInfo>("matchInfo");

    for (const outcome of pred.outcomes) {
      const t = matchInfo.value.teams.find((t) => t.outcomeId == outcome.id);

      if (t) {
        t.pointBet = outcome.channelPoints;
      }
    }
  });
}
