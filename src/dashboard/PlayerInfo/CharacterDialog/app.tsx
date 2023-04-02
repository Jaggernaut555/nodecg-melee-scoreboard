import React from "react";
import {
  CharacterInfo,
  Characters,
  DefaultCharacter,
} from "../../../types/characters";
import "./characterSelect.css";
import "../../util/global.css";
import { useReplicant } from "use-nodecg";
import { ReplicantType } from "../../../types/replicants";
import { MatchInfo } from "../../../types";

function App() {
  const [selectedTeam] = useReplicant(ReplicantType.SelectedTeam, -1);
  const [selectedPlayer] = useReplicant(ReplicantType.SelectedPlayer, -1);
  const [matchInfo] = useReplicant<MatchInfo>(
    ReplicantType.MatchInfo,
    new MatchInfo()
  );

  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [selectedCharacter, setSelectedCharacter] =
    React.useState<CharacterInfo>(DefaultCharacter());
  const [selectedColor, setSelectedColor] = React.useState("Default");

  const changeCharacter = (char: CharacterInfo, color = "Default") => {
    setSelectedCharacter(char);
    setSelectedColor(color);
  };

  React.useEffect(() => {
    if (
      !isOpen ||
      !matchInfo ||
      !matchInfo.teams ||
      !matchInfo.teams[selectedTeam] ||
      !matchInfo.teams[selectedTeam].players ||
      !matchInfo.teams[selectedTeam].players[selectedPlayer]
    ) {
      return;
    }

    const p = matchInfo.teams[selectedTeam].players[selectedPlayer];
    const char = Characters.find((c) => c.Character == p.character);
    if (char) {
      changeCharacter(char, p.color);
      console.log(`Selected team,player: ${selectedTeam}, ${selectedPlayer}`);
    } else {
      changeCharacter(DefaultCharacter());
    }
    setIsLoaded(true);
  }, [isOpen, matchInfo, selectedPlayer, selectedTeam]);

  React.useEffect(() => {
    const init = () => {
      // if (currentPlayer != selectedPlayer || currentTeam != selectedTeam) {
      //   setIsLoaded(false);
      //   setCurrentPlayer(selectedPlayer);
      //   setCurrentTeam(selectedTeam);
      // }
      setIsOpen(true);
    };
    document.addEventListener("dialog-opened", init);

    const confirm = () => {
      // The user pressed the confirm button.

      // TODO:
      // Should this be done here?
      const p = matchInfo.teams[selectedTeam].players[selectedPlayer];
      p.character = selectedCharacter.Character;
      p.color = selectedColor;
      setIsOpen(false);
    };
    document.addEventListener("dialog-confirmed", confirm);

    const dismiss = () => {
      setIsOpen(false);
    };
    document.addEventListener("dialog-dismissed", dismiss);

    return () => {
      document.removeEventListener("dialog-opened", init);
      document.removeEventListener("dialog-confirmed", confirm);
      document.removeEventListener("dialog-dismissed", dismiss);
    };
  });

  if (!isLoaded) {
    return (
      <div>
        Fetching <span className="fa fa-spinner spinning"></span>
      </div>
    );
  }

  return (
    <div>
      <div className="css-container">
        {Characters.map((c) => {
          return (
            <div
              className={`css-item ${
                c.Character == selectedCharacter.Character ? "selected" : ""
              }`}
              key={c.Character}
              onClick={() => changeCharacter(c)}
            >
              <img
                src={`../images/StockIcons/${c.Character}/Default.png`}
              ></img>
            </div>
          );
        })}
      </div>
      <div className="color-container">
        {selectedCharacter.Colors.map((c) => {
          return (
            <div
              key={c}
              className={`color-item ${c == selectedColor ? "selected" : ""}`}
              onClick={() => setSelectedColor(c)}
            >
              <img
                src={`../images/Portraits/${selectedCharacter.Character}/${c}.png`}
              ></img>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
