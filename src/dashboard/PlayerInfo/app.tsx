import React, { useEffect, useState } from "react";
import { useReplicant } from 'use-nodecg';
import { Bracket, MatchInfo, PlayerInfo, TeamInfo } from "../../types/index.d";
import PanelPlayerInfo from "./panelPlayerInfo";
import PanelTeamInfo from "./panelTeamInfo";

function App() {
    const [matchInfo, setMatchInfo] = useReplicant<MatchInfo>('matchInfo', new MatchInfo());

    const updatePlayerInfo = (e: React.MouseEvent) => {
        // TODO:
        // use this instead of live updating?
        // setPlayer1Info(player1DisplayedInfo);
        // setPlayer2Info(player2DisplayedInfo);
    };

    const updateTeamInfo = (ti: TeamInfo, index: number) => {
        let newTeamInfo = matchInfo;
        matchInfo.teams[index] = ti;
        setMatchInfo(newTeamInfo);
    }

    const addTeam = () => {
        let ti = new TeamInfo();
        let newMatchInfo = matchInfo;
        newMatchInfo.teams.push(ti);
        setMatchInfo(newMatchInfo);
    }

    const removeTeam = (index: number) => {
        let newMatchInfo = matchInfo;
        newMatchInfo.teams = newMatchInfo.teams.splice(index, 1);
        if (!newMatchInfo.teams) {
            newMatchInfo.teams = [];
        }
        console.log(newMatchInfo);
        // setMatchInfo(newMatchInfo);
    }

    const swapPlayers = () => {
        // send message to the function in extensions/API/api.ts
    };

    return (
        <div>
            {matchInfo && matchInfo.teams && matchInfo.teams.map((ti, index) => {
                return (
                    <div key={`TI_${index}`}>
                        <PanelTeamInfo index={index} updateInfo={updateTeamInfo} removeTeam={removeTeam} info={ti}/>
                        <br />
                    </div>
                )
            })}
            <button disabled={matchInfo.teams.length >= 2} onClick={addTeam}>Add Team</button>
            <button onClick={updatePlayerInfo}>update</button>
            {/* <button onClick={swapPlayers}>swap</button> */}
        </div>
    );
}

export default App;
