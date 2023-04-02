import React, { useEffect, useState } from "react";
import { PlayerInfo } from "../../types";
import { useReplicant } from "use-nodecg";
import { ReplicantType } from "../../types/replicants";

interface PanelPlayerInfoProps {
  updateInfo: (pi: PlayerInfo, index: number) => void;
  info: PlayerInfo;
  index: number;
  teamIndex: number;
}

function PanelPlayerInfo(props: PanelPlayerInfoProps) {
  const [, setSelectedTeam] = useReplicant(ReplicantType.SelectedTeam, 0);
  const [, setSelectedPlayer] = useReplicant(ReplicantType.SelectedPlayer, 0);
  const [playerName, setPlayerName] = useState<string>(props.info.name);
  const [playerCode, setPlayerCode] = useState<string>(props.info.name);
  const [playerChar, setPlayerChar] = useState<string>(props.info.character);
  const [playerColor, setPlayerColor] = useState<string>(props.info.color);

  useEffect(() => {
    props.updateInfo(
      {
        name: playerName,
        character: playerChar,
        code: playerCode,
        port: props.info.port,
        color: playerColor,
      },
      props.index
    );
    // We don't want to call this on updates to the props
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerName, playerCode, playerChar]);

  useEffect(() => {
    if (props.info.name !== playerName) setPlayerName(props.info.name);
    if (props.info.code !== playerCode) setPlayerCode(props.info.code);
    if (props.info.character !== playerChar)
      setPlayerChar(props.info.character);
    if (props.info.color !== playerColor) setPlayerColor(props.info.color);
    // We don't want to call this on updates to the displayed info
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.info]);

  // TODO:
  // support character colors
  // Maybe in a dialog?

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <label>Player: </label>
      <span style={{ height: "24px", width: "24px" }}>
        <img
          onClick={() => {
            setSelectedPlayer(props.index);
            setSelectedTeam(props.teamIndex);
          }}
          nodecg-dialog="CharacterInfoDialog"
          src={`../images/StockIcons/${playerChar}/${playerColor}.png`}
        ></img>
      </span>
      <input
        type="text"
        style={{ width: "100px" }}
        placeholder="name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
      ></input>
      <input
        type="text"
        style={{ width: "70px" }}
        placeholder="CODE#123"
        value={playerCode}
        onChange={(e) => setPlayerCode(e.target.value)}
      ></input>
      <button hidden={true}>Remove Player</button>
    </div>
  );
}

export default PanelPlayerInfo;
