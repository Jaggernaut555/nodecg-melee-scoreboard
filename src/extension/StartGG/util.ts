import { SetInfo } from "./types";

export function formatStartGGRound(roundInfo: SetInfo) {
  return `${roundInfo.roundInfo} - Bo${roundInfo.bestOf}`;
}
