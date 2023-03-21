import React from "react";
import "./setPreview.css";

interface SetPreviewComponentProps {
  id: string;
  round: string;
  players: {
    name: string;
    score: number;
  }[];
  selected: boolean;
  onClick: () => void;
}

function SetPreviewComponent(props: SetPreviewComponentProps) {
  return (
    <div
      className={`box ${props.selected ? "selected" : ""}`}
      onClick={props.onClick}
    >
      <div>{props.round}</div>
      {props.players.map((p) => {
        return (
          <div key={p.name}>
            {p.name}: {p.score}
          </div>
        );
      })}
    </div>
  );
}

export default SetPreviewComponent;
