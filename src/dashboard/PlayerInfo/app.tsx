import React from "react";
import { useReplicant } from "use-nodecg";
import { MatchInfo, TeamInfo } from "../../types";
import { copyMatchInfo, copyTeamInfo } from "../../util";
import PanelTeamInfo from "./panelTeamInfo";
import { ReplicantType } from "../../types/replicants";

function App() {
  // NOTE: Do not mess with object properties directly.
  // Copy it THEN modify those copied ones
  // SEE: `info={copyTeamInfo(ti)} or `copyMatchInfo(matchInfo)` in this file
  const [matchInfo, setMatchInfo] = useReplicant<MatchInfo>(
    ReplicantType.MatchInfo,
    new MatchInfo()
  );

  // const updatePlayerInfo = (e: React.MouseEvent) => {
  //     // TODO:
  //     // use this save button instead of live updating?
  //     // setPlayer1Info(player1DisplayedInfo);
  //     // setPlayer2Info(player2DisplayedInfo);
  // };

  const updateTeamInfo = (ti: TeamInfo, index: number) => {
    const newMatchInfo = copyMatchInfo(matchInfo);
    newMatchInfo.teams[index] = ti;
    setMatchInfo(newMatchInfo);
  };

  const addTeam = () => {
    const ti = new TeamInfo();
    const newMatchInfo = copyMatchInfo(matchInfo);
    newMatchInfo.teams.push(ti);
    setMatchInfo(newMatchInfo);
  };

  const removeTeam = (index: number) => {
    const newMatchInfo = copyMatchInfo(matchInfo);
    newMatchInfo.teams.splice(index, 1);
    setMatchInfo(newMatchInfo);
  };

  // const swapPlayers = () => {
  //   // TODO:
  //   // send message to the function in extensions/API/api.ts
  // };

  return (
    <div>
      {matchInfo &&
        matchInfo.teams &&
        matchInfo.teams.map((ti, index) => {
          return (
            <div key={`TI_${index}`}>
              <PanelTeamInfo
                index={index}
                updateInfo={updateTeamInfo}
                removeTeam={removeTeam}
                info={copyTeamInfo(ti)}
              />
              <br />
            </div>
          );
        })}
      <button
        disabled={matchInfo.teams && matchInfo.teams.length >= 2}
        onClick={addTeam}
      >
        Add Team
      </button>
      {/* <button onClick={updatePlayerInfo}>update</button> */}
      {/* <button onClick={swapPlayers}>swap</button> */}
    </div>
  );
}

export default App;
