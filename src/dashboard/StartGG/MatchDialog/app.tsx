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
  const [useNavigation, setUseNavigation] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);

  const findMatchesDialog = (page: number) => {
    nodecg
      .sendMessage(MessageType.FindStartGGMatches, page)
      .then((result: SetPreviewInfo[]) => {
        setSetPreviews(result);
        setIsLoaded(true);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const changePage = (change: number) => {
    setCurrentPage(currentPage + change);
  };

  React.useEffect(() => {
    const init = () => {
      setIsLoaded(false);
      setSetPreviews([]);
      setSelectedSet("");
      if (currentPage != 1) {
        setCurrentPage(1);
      } else {
        findMatchesDialog(currentPage);
      }
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

    const UsePageNavigation = () => {
      setUseNavigation(true);
      console.log("using navigation");
    };

    nodecg.listenFor(MessageType.UseSetPageNavigation, UsePageNavigation);

    return () => {
      document.removeEventListener("dialog-opened", init);
      document.removeEventListener("dialog-confirmed", confirm);
      // document.removeEventListener("dialog-dismissed");
      nodecg.unlisten(MessageType.UseSetPageNavigation, UsePageNavigation);
    };
  });

  React.useEffect(() => {
    setIsLoaded(false);
    findMatchesDialog(currentPage);
  }, [currentPage]);

  if (!isLoaded) {
    return (
      <div>
        Fetching <span className="fa fa-spinner spinning"></span>
      </div>
    );
  }

  return (
    <div>
      <div hidden={!useNavigation}>
        <button onClick={() => changePage(-1)} disabled={currentPage == 1}>
          Prev Page
        </button>
        <span> Page: {currentPage} </span>
        <button onClick={() => changePage(1)}>Next Page</button>
      </div>
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
    </div>
  );
}

export default App;
