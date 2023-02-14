import { SetInfo } from "./types";

export function formatStartGGRound(roundInfo: SetInfo) {
  const includeBestOf = roundInfo.bestOf > 0;
  return `${roundInfo.roundInfo}${
    includeBestOf ? ` - Bo${roundInfo.bestOf}` : ""
  }`;
}
