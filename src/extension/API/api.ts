import { MatchInfo, TwitchPredictionStatus } from "../../types/index.d";
import { swapTeamInfo } from "../../util";
import context from "../context";
import { initWebsocket } from "./websocket";

interface scoreDTO {
  team: number;
  operation: "add" | "subtract" | "get";
}

interface bracketDTO {
  team: number;
  bracket: "toggle" | "get";
}

interface predictionDTO {
  operation: "progress" | "create" | "lock" | "cancel" | "resolve" | "get";
}

// This is mostly for controlling quick actions with the stream deck
// But other things could use this api too
export function initAPI() {
  context.nodecg.log.info("Setting up API");

  const app = context.nodecg.Router();

  app.post("/api/v1/swap", (req, res) => {
    swapPlayers();
    res.sendStatus(200);
  });

  app.post("/api/v1/score", (req, res) => {
    res.send(updateScore(req.body));
  });

  app.post("/api/v1/bracket", (req, res) => {
    // set player in winners or losers bracket
    res.send(updateBracket(req.body));
  });

  app.post("/api/v1/reset", (req, res) => {
    resetScore();
    res.sendStatus(200);
  });

  // TODO: this should allow 'on', 'off', and 'toggle'
  app.post("/api/v1/scoreboard", (req, res) => {
    toggleScoreboard();
    res.sendStatus(200);
  });

  app.get("/api/v1/scoreboard", (req, res) => {
    const val = context.nodecg.readReplicant<boolean>("hideScoreboard");
    res.send(val != true ? "on" : "off");
  });

  app.post("/api/v1/prediction", async (req, res) => {
    res.send(updatePrediction(req.body));
  });

  app.get("/api/v1/prediction", (req, res) => {
    res.send(updatePrediction({ operation: "get" }));
  });

  context.nodecg.mount(app);

  initWebsocket();
}

function swapPlayers() {
  const matchInfo = context.nodecg.Replicant<MatchInfo>("matchInfo");

  if (
    matchInfo.value &&
    matchInfo.value.teams &&
    matchInfo.value.teams.length == 2
  ) {
    matchInfo.value = swapTeamInfo(matchInfo.value);
  } else {
    console.log("can't swap these teams");
  }
}

function updateScore(dto: scoreDTO) {
  const matchInfo = context.nodecg.Replicant<MatchInfo>("matchInfo");

  if (
    !matchInfo.value ||
    !matchInfo.value.teams ||
    matchInfo.value.teams.length <= dto.team ||
    !matchInfo.value.teams[dto.team]
  ) {
    return { error: "team does not exist" };
  }

  switch (dto.operation) {
    case "add":
      matchInfo.value.teams[dto.team].score =
        matchInfo.value.teams[dto.team].score + 1;
      break;
    case "subtract":
      matchInfo.value.teams[dto.team].score =
        matchInfo.value.teams[dto.team].score - 1;
      break;
    case "get":
      return { score: matchInfo.value.teams[dto.team].score };
    default:
      console.log("failed to update score");
      break;
  }

  return;
}

function updateBracket(dto: bracketDTO) {
  const matchInfo = context.nodecg.Replicant<MatchInfo>("matchInfo");

  if (
    !matchInfo.value ||
    !matchInfo.value.teams ||
    matchInfo.value.teams.length <= dto.team ||
    !matchInfo.value.teams[dto.team]
  ) {
    return { error: "team does not exist" };
  }

  switch (dto.bracket) {
    case "toggle":
      if (matchInfo.value.teams[dto.team].bracket == "[L]") {
        matchInfo.value.teams[dto.team].bracket = "[W]";
      } else {
        matchInfo.value.teams[dto.team].bracket = "[L]";
      }
      break;
    case "get":
      return { bracket: matchInfo.value.teams[dto.team].bracket };
    default:
      console.log("failed to update bracket");
      break;
  }

  return;
}

function resetScore() {
  const matchInfo = context.nodecg.Replicant<MatchInfo>("matchInfo");

  matchInfo.value.teams.forEach((t, i) => {
    matchInfo.value.teams[i].score = 0;
  });
}

function toggleScoreboard() {
  const sb = context.nodecg.Replicant<boolean>("hideScoreboard");

  sb.value = !sb.value;
}

function updatePrediction(dto: predictionDTO) {
  const predictionStatus = context.nodecg.readReplicant<TwitchPredictionStatus>(
    "twitchCurrentPredictionStatus"
  );
  let messageName: string;
  switch (dto.operation) {
    case "create":
      messageName = "twitchCreatePrediction";
      break;
    case "lock":
      messageName = "twitchLockPrediction";
      break;
    case "cancel":
      messageName = "twitchCancelPrediction";
      break;
    case "resolve":
      messageName = "twitchResolvePrediction";
      break;
    case "progress":
      messageName = "twitchProgressPrediction";
      break;
    case "get":
      return { status: predictionStatus };
    default:
      context.nodecg.log.error("Invalid option to update prediction");
      return;
  }

  context.nodecg.sendMessage(messageName);
}
