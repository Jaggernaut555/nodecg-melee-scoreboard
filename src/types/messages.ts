export enum MessageType {
  PredictionStarted = "PredictionStarted",
  PredictionLocked = "PredictionLocked",
  PredictionEnded = "PredictionEnded",
  PredictionCancelled = "PredictionCancelled",

  TwitchCreatePrediction = "twitchCreatePrediction",
  TwitchLockPrediction = "twitchLockPrediction",
  TwitchCancelPrediction = "twitchCancelPrediction",
  TwitchResolvePrediction = "twitchResolvePrediction",
  TwitchProgressPrediction = "twitchProgressPrediction",
  TwitchCheckToken = "twitchCheckToken",

  UseNextStreamQueue = "UseNextStreamQueue",
  RefreshStreamQueues = "RefreshStreamQueues",

  FindStartGGMatches = "FindStartGGMatches",
  SelectStartGGMatch = "SelectStartGGMatch",

  UseSetPageNavigation = "UseSetPageNavigation",

  SlippiTryConnect = "slippiTryConnect",
  SlippiTryDisconnect = "slippiTryDisconnect",
  SlippiConnectionStatus = "slippiConnectionStatus",
}
