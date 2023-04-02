import React, { useEffect, useState } from "react";
import { Bracket, PlayerInfo, TeamInfo } from "../../types";
import PanelPlayerInfo from "./panelPlayerInfo";

interface PanelTeamInfoProps {
  updateInfo: (ti: TeamInfo, index: number) => void;
  removeTeam: (index: number) => void;
  info: TeamInfo;
  index: number;
}

function PanelTeamInfo(props: PanelTeamInfoProps) {
  const [teamScore, setTeamScore] = useState<number>(props.info.score);
  const [teamBracket, setTeamBracket] = useState<Bracket>(props.info.bracket);
  const [teamName, setTeamName] = useState<string>(props.info.name);

  // TODO: limit this to max 3 players or something
  // unless want to support crew battle or something
  const addPlayer = () => {
    const pi = new PlayerInfo();
    const teamInfo = props.info;
    teamInfo.players.push(pi);
    props.updateInfo(teamInfo, props.index);
  };

  const updatePlayer = (pi: PlayerInfo, index: number) => {
    const teamInfo = props.info;
    teamInfo.players[index] = pi;
    props.updateInfo(teamInfo, props.index);
  };

  const removeTeam = () => {
    props.removeTeam(props.index);
  };

  const updateScore = () => {
    const teamInfo = props.info;
    teamInfo.score = teamScore;
    props.updateInfo(teamInfo, props.index);
  };

  const updateBracket = () => {
    const teamInfo = props.info;
    teamInfo.bracket = teamBracket;
    props.updateInfo(teamInfo, props.index);
  };

  const updateTeamName = () => {
    const teamInfo = props.info;
    teamInfo.name = teamName;
    props.updateInfo(teamInfo, props.index);
  };

  // const removePlayer = () => {
  //     // TODO: remove player
  // }

  useEffect(() => {
    if (teamBracket != props.info.bracket) setTeamBracket(props.info.bracket);
    if (teamScore != props.info.score) setTeamScore(props.info.score);
    if (teamName != props.info.name) setTeamName(props.info.name);
    // We don't want to call this on updates to the displayed info
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.info.score, props.info.bracket, props.info.name]);

  useEffect(() => {
    if (teamBracket != props.info.bracket) updateBracket();
    if (teamScore != props.info.score) updateScore();
    if (teamName != props.info.name) updateTeamName();
    // We don't want to call this on updates to the props
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamBracket, teamScore, teamName]);

  // create a thing for each member of the team
  return (
    <div>
      <div>Team {props.index + 1}</div>
      <div>
        <button onClick={removeTeam}>Remove Team</button>
      </div>
      <div>
        <label>Score: </label>
        <input
          type="number"
          style={{ width: "35px" }}
          value={teamScore}
          onChange={(e) => setTeamScore(Number(e.target.value))}
        ></input>
        <select
          value={teamBracket}
          onChange={(e) => setTeamBracket(e.target.value as Bracket)}
        >
          <option value="[W]">winners</option>
          <option value="[L]">losers</option>
        </select>
        <input
          type="text"
          placeholder="Team Name"
          style={{ width: "70px" }}
          onChange={(e) => setTeamName(e.target.value)}
          value={teamName}
        />
        <button hidden={props.info.players.length > 0} onClick={addPlayer}>
          Add Player
        </button>
      </div>
      <div>
        {props.info &&
          props.info.players &&
          props.info.players.map((pi, index) => {
            return (
              <PanelPlayerInfo
                updateInfo={updatePlayer}
                info={pi}
                index={index}
                teamIndex={props.index}
                key={`PI_${props.index}_${index}`}
              />
            );
          })}
      </div>
    </div>
  );
}

export default PanelTeamInfo;
