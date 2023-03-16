import { Server } from "socket.io";
import { MatchInfo, TwitchPredictionStatus } from "../../types/index.d";
import context from "../context";
import {
  swapPlayers,
  updateBracket,
  updatePrediction,
  updateScore,
  updateScoreboardHidden,
} from "./api";

let io: Server;

export function initWebsocket() {
  io = new Server();

  io.on("connection", (client) => {
    client.on("join", (roomId) => {
      client.join(roomId);
    });

    client.on("Score", (TeamIndex) => {
      const matchInfo = context.nodecg.readReplicant<MatchInfo>("matchInfo");
      if (
        !matchInfo ||
        !matchInfo.teams ||
        matchInfo.teams.length <= TeamIndex ||
        !matchInfo.teams[TeamIndex]
      ) {
        return;
      }
      io.to("Score").emit("ScoreUpdate", {
        Score: matchInfo.teams[TeamIndex].score,
        TeamIndex,
      });
    });

    client.on("Bracket", (TeamIndex) => {
      const matchInfo = context.nodecg.readReplicant<MatchInfo>("matchInfo");
      if (
        !matchInfo ||
        !matchInfo.teams ||
        matchInfo.teams.length <= TeamIndex ||
        !matchInfo.teams[TeamIndex]
      ) {
        return;
      }
      io.to("Bracket").emit("BracketUpdate", {
        Bracket: matchInfo.teams[TeamIndex].bracket,
        TeamIndex,
      });
    });

    client.on("Prediction", () => {
      const predictionStatus =
        context.nodecg.readReplicant<TwitchPredictionStatus>(
          "twitchCurrentPredictionStatus"
        );
      io.to("Prediction").emit("PredictionUpdate", {
        PredictionStatus: predictionStatus,
      });
    });

    client.on("HideScoreboard", () => {
      const hideScoreboard =
        context.nodecg.readReplicant<boolean>("hideScoreboard");
      io.to("HideScoreboard").emit("HideScoreboardUpdate", {
        HideScoreboard: hideScoreboard,
      });
    });

    client.on("Update", (data) => {
      switch (data.type) {
        case "bracket":
          updateBracket(data);
          break;
        case "score":
          updateScore(data);
          break;
        case "prediction":
          updatePrediction(data);
          break;
        case "hideScoreboard":
          updateScoreboardHidden(data);
          break;
        default:
          context.nodecg.log.error("Got a bad Websocket Update request");
      }
    });

    client.on("Swap", () => {
      swapPlayers();
    });
  });

  io.listen(9091);

  initReplicantListeners();
}

function initReplicantListeners() {
  const matchInfo = context.nodecg.Replicant<MatchInfo>("matchInfo");

  matchInfo.on("change", (newValue, oldValue) => {
    if (!newValue || !newValue.teams) {
      return;
    }

    newValue.teams.forEach((team, index) => {
      let noOldValue = false;
      if (!oldValue || oldValue.teams.length <= index) {
        noOldValue = true;
      }

      if (noOldValue || team.score != oldValue?.teams[index].score) {
        io.to("Score").emit("ScoreUpdate", {
          TeamIndex: index,
          Score: team.score,
        });
      }

      if (noOldValue || team.bracket != oldValue?.teams[index].bracket) {
        io.to("Bracket").emit("BracketUpdate", {
          TeamIndex: index,
          Bracket: team.bracket,
        });
      }
    });
  });

  const hideScoreboard = context.nodecg.Replicant<boolean>("hideScoreboard");
  hideScoreboard.on("change", (newValue, oldValue) => {
    if (newValue === null || newValue == oldValue) {
      return;
    }
    io.to("HideScoreboard").emit("HideScoreboardUpdate", {
      HideScoreboard: newValue,
    });
  });

  const predictionStatus = context.nodecg.Replicant<TwitchPredictionStatus>(
    "twitchCurrentPredictionStatus"
  );
  predictionStatus.on("change", (newValue, oldValue) => {
    if (newValue === null || !newValue || newValue == oldValue) {
      return;
    }
    io.to("Prediction").emit("PredictionUpdate", {
      PredictionStatus: newValue,
    });
  });
}
