import React from "react";
import { SetPreviewInfo } from "../../../types";
import { MessageType } from "../../../types/messages";
import "../../util/global.css";
import SetPreviewComponent from "./setPreviewComponent";
import "./setPreview.css";

function App() {
  const [setPreviews, setSetPreviews] = React.useState<SetPreviewInfo[]>([]);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [selectedSet, setSelectedSet] = React.useState("");

  const findMatchesDialog = () => {
    nodecg
      .sendMessage(MessageType.FindStartGGMatches)
      .then((result: SetPreviewInfo[]) => {
        setSetPreviews(result);
        setIsLoaded(true);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  React.useEffect(() => {
    const init = () => {
      setIsLoaded(false);
      setSetPreviews([]);
      setSelectedSet("");
      findMatchesDialog();
    };
    document.addEventListener("dialog-opened", init);

    const confirm = () => {
      // The user pressed the confirm button.
      nodecg.sendMessage(MessageType.SelectStartGGMatch, selectedSet);
    };
    document.addEventListener("dialog-confirmed", confirm);

    // document.addEventListener("dialog-dismissed", function () {
    //   // The user pressed the dismiss button.
    // });

    return () => {
      document.removeEventListener("dialog-opened", init);
      document.removeEventListener("dialog-confirmed", confirm);
      // document.removeEventListener("dialog-dismissed");
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
    <div className="container">
      {setPreviews.map((s) => {
        return (
          <SetPreviewComponent
            key={s.id}
            onClick={() => setSelectedSet(s.id)}
            id={s.id}
            round={s.round}
            players={s.players}
            selected={s.id == selectedSet}
          />
        );
      })}
    </div>
  );
}

export default App;
