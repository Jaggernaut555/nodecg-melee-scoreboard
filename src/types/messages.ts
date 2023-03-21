export enum MessageType {
  PredictionStarted = "PredictionStarted",
  PredictionLocked = "PredictionLocked",
  PredictionEnded = "PredictionEnded",
  PredictionCancelled = "PredictionCancelled",

  UseNextStreamQueue = "UseNextStreamQueue",
  RefreshStreamQueues = "RefreshStreamQueues",

  FindStartGGMatches = "FindStartGGMatches",
  SelectStartGGMatch = "SelectStartGGMatch",
}
