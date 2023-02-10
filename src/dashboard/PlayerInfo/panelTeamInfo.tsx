import React, { Dispatch, useEffect, useState } from "react";
import { Bracket, PlayerInfo, TeamInfo } from "../../types/index.d";
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


    // TODO: limit this to max 3 players or something
    // unless want to support crew battle or something
    const addPlayer = () => {
        let pi = new PlayerInfo();
        let teamInfo = props.info;
        // console.log(teamInfo);
        teamInfo.players.push(pi);
        props.updateInfo(teamInfo, props.index)
    }

    const updatePlayer = (pi: PlayerInfo, index: number) => {
        let teamInfo = props.info;
        teamInfo.players[index] = pi;
        props.updateInfo(teamInfo, props.index);
    }

    const removeTeam = () => {
        props.removeTeam(props.index);
    }

    const updateScore = () => {
        let teamInfo = props.info;
        teamInfo.score = teamScore;
        props.updateInfo(teamInfo, props.index)
    }

    const updateBracket = () => {
        let teamInfo = props.info;
        teamInfo.bracket = teamBracket;
        props.updateInfo(teamInfo, props.index)
    }

    const removePlayer = () => {
        // TODO: remove player
    }

    useEffect(() => {
        console.log("updating display");
        if (teamBracket != props.info.bracket) setTeamBracket(props.info.bracket);
        if (teamScore != props.info.score) setTeamScore(props.info.score);
    }, [props.info.score, props.info.bracket])

    useEffect(() => {
        console.log("updating replicant")
        if (teamBracket != props.info.bracket) updateBracket();
        if (teamScore != props.info.score) updateScore();
    }, [teamBracket, teamScore])

    // create a thing for each member of the team
    return (
        <div>
            <div>
                Team {props.index + 1}
            </div>
            <div>
                <button onClick={removeTeam}>Remove Team</button>
            </div>
            <div>
                <label>score</label>
                <input type="number" style={{ width: '35px' }} value={teamScore} onChange={e => setTeamScore(Number(e.target.value))}></input>
                <select value={teamBracket} onChange={e => setTeamBracket(e.target.value as Bracket)}>
                <option value="[W]">winners</option>
                <option value="[L]">losers</option>
            </select>
                <button hidden={props.info.players.length > 0} onClick={addPlayer}>Add Player</button>
            </div>
            <div>
                {props.info && props.info.players && props.info.players.map((pi,index) => {
                    return (
                        <PanelPlayerInfo updateInfo={updatePlayer} info={pi} index={index} key={`PI_${props.index}_${index}`}/>
                    )
                })}
            </div>
        </div>
    )
};

export default PanelTeamInfo;
