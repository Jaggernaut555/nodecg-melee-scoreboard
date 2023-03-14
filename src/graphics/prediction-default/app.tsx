import * as React from "react";
import { useReplicant, useListenFor } from "use-nodecg";
import "./prediction-default.css";
import { MatchInfo, TeamInfo } from "../../types/index.d";
import { MessageType } from "../../types/messages";
import PredictionBox from "./prediction-box";
import NodeCG from "nodecg-types/types/browser"; // eslint-disable-line

function App() {
  const { nodecg } = window || globalThis || {};

  const [matchInfo] = useReplicant<MatchInfo>("matchInfo", new MatchInfo());

  const [team1Info, setTeam1Info] = React.useState<TeamInfo>(new TeamInfo());
  const [team2Info, setTeam2Info] = React.useState<TeamInfo>(new TeamInfo());

  const [isHidden, setIsHidden] = React.useState<boolean>(true);

  const [winnerId, setWinnerId] = React.useState<string>("");

  const hideTimeout = React.useRef<ReturnType<typeof setTimeout>>();

  useListenFor(MessageType.PredictionStarted, () => {
    nodecg.playSound("prediction-start");
    setIsHidden(false);
    setWinnerId("");
  });

  useListenFor(MessageType.PredictionLocked, () => {
    setIsHidden(false);

    if (hideTimeout.current) {
      clearInterval(hideTimeout.current);
    }

    hideTimeout.current = setTimeout(() => {
      setIsHidden(true);
    }, 10 * 1000);
  });

  useListenFor(MessageType.PredictionCancelled, () => {
    setIsHidden(true);
  });

  useListenFor(MessageType.PredictionEnded, (justWonId: string) => {
    if (team1Info.outcomeId != justWonId && team2Info.outcomeId != justWonId) {
      return;
    }

    setWinnerId(justWonId);
    setIsHidden(false);

    nodecg.playSound("prediction-end");

    if (hideTimeout.current) {
      clearInterval(hideTimeout.current);
    }

    hideTimeout.current = setTimeout(() => {
      setIsHidden(true);
    }, 10 * 1000);
  });

  React.useEffect(() => {
    if (matchInfo.teams.length == 2) {
      setTeam1Info(matchInfo.teams[0]);
      setTeam2Info(matchInfo.teams[1]);
    } else {
      setTeam1Info(new TeamInfo());
      setTeam2Info(new TeamInfo());
    }
  }, [matchInfo]);

  return (
    <div className="prediction">
      <PredictionBox
        pointsBet={team1Info.pointBet}
        index={1}
        hidden={isHidden}
        won={!!team1Info.outcomeId && winnerId == team1Info.outcomeId}
      ></PredictionBox>
      <PredictionBox
        pointsBet={team2Info.pointBet}
        index={2}
        hidden={isHidden}
        won={!!team2Info.outcomeId && winnerId == team2Info.outcomeId}
      ></PredictionBox>
    </div>
  );
}

export default App;
