import React, { Dispatch, useEffect, useState } from "react";
import { Bracket, PlayerInfo, TeamInfo } from "../../types/index.d";

const characterOptions = ['Bowser', 'DK', 'Doc', 'Falco', 'Falcon', 'Fox', 'Ganon', 'G&W', 'ICs', 'Kirby', 'Link', 'Luigi', 'Mario', 'Marth', 'Mewtwo', 'Ness', 'Peach', 'Pichu', 'Pikachu', 'Puff', 'Roy', 'Samus', 'Sheik', 'YLink', 'Yoshi', 'Zelda']

interface PanelPlayerInfoProps {
    updateInfo: (pi: PlayerInfo, index: number) => void;
    info: PlayerInfo;
    index: number;
}

function PanelPlayerInfo(props: PanelPlayerInfoProps) {
    const [playerName, setPlayerName] = useState<string>(props.info.name);
    const [playerCode, setPlayerCode] = useState<string>(props.info.name);
    const [playerChar, setPlayerChar] = useState<string>(props.info.character);


    useEffect(() => {
        props.updateInfo({
            name: playerName,
            character: playerChar,
            code: playerCode,
            port: props.info.port,
            color: 'default'
        }, props.index);
    }, [playerName, playerCode, playerChar]);

    useEffect(() => {
        if (props.info.name !== playerName) setPlayerName(props.info.name);
        if (props.info.code !== playerCode) setPlayerCode(props.info.code);
        if (props.info.character !== playerChar) setPlayerChar(props.info.character);
    }, [props.info]);


    // TODO:
    // support character colors

    return (
        <div>
            <label>Player</label>
            <select value={playerChar} onChange={e => setPlayerChar(e.target.value)}>
                {characterOptions.map((v) => {
                    return (
                        <option value={v} key={v}>{v}</option>
                    )
                })}
            </select>
            <img src={`../images/StockIcons/${playerChar}/Default.png`}></img>
            <input type="text" style={{width:'100px'}} placeholder="name" value={playerName} onChange={e => setPlayerName(e.target.value)}></input>
            <input type="text" style={{width:'70px'}} placeholder="CODE#123" value={playerCode} onChange={e => setPlayerCode(e.target.value)}></input>
            <button hidden={true}>Remove Player</button>
        </div>
    )
}

export default PanelPlayerInfo;
