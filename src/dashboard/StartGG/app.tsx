import React from "react";
import { useReplicant } from "use-nodecg";
import { StreamQueueOption } from "../../types";
import { MessageType } from "../../types/messages";
import "../util/global.css";

function App() {
  const [startGGToken, setStartGGToken] = useReplicant<string>(
    "startGGAccessToken",
    ""
  );
  const [displayedStartGGToken, setDisplayedStartGGToken] = React.useState("");

  const [startGGUrl, setStartGGUrl] = useReplicant<string>("startGGUrl", "");
  const [displayedStartGGUrl, setDisplayedStartGGUrl] = React.useState("");

  const [StreamQueueOptions] = useReplicant<StreamQueueOption[]>(
    "StreamQueueOptions",
    []
  );
  const [StreamQueueSelectedOption, setStreamQueueSelectedOption] =
    useReplicant<StreamQueueOption>("StreamQueueSelectedOption", {
      name: "none",
      id: "none",
    });

  const saveChanges = () => {
    setStartGGToken(displayedStartGGToken);
    setStartGGUrl(displayedStartGGUrl);
  };

  const getStreamQueue = () => {
    nodecg.sendMessage(MessageType.UseNextStreamQueue);
  };

  const updateStreamQueue = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStreamQueueSelectedOption({
      id: e.target.value,
      name: e.target.options[e.target.selectedIndex].text,
    });
  };

  const refreshStreamQueues = () => {
    nodecg.sendMessage(MessageType.RefreshStreamQueues);
  };

  React.useEffect(() => {
    if (displayedStartGGToken != startGGToken)
      setDisplayedStartGGToken(startGGToken);
    if (displayedStartGGUrl != startGGUrl) setDisplayedStartGGUrl(startGGUrl);
    // We don't want to call this on updates to the displayed info
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startGGToken, startGGUrl]);

  return (
    <div>
      <div>
        <label>Access Token</label>
        <input
          type="password"
          value={displayedStartGGToken}
          onChange={(e) => setDisplayedStartGGToken(e.target.value)}
        />
      </div>
      <div>
        <label>Bracket URL</label>
        <input
          type="text"
          value={displayedStartGGUrl}
          onChange={(e) => setDisplayedStartGGUrl(e.target.value)}
        />
      </div>
      {/* <div>
        <label>Automatically search StartGG</label>
        <input type="checkbox"></input>
      </div> */}
      <button onClick={saveChanges}>Save</button>

      <div hidden={!startGGUrl || startGGUrl == ""}>
        <div>
          <label>Stream Queue:</label>
          <select
            onChange={updateStreamQueue}
            value={StreamQueueSelectedOption.id}
          >
            <option key="none" value="none">
              None
            </option>
            {StreamQueueOptions.map((sq) => {
              return (
                <option key={sq.id} value={sq.id}>
                  {sq.name}
                </option>
              );
            })}
          </select>
          <button onClick={refreshStreamQueues}>
            <span className="fa fa-refresh"></span>
          </button>
        </div>
        <div hidden={StreamQueueSelectedOption.id == "none"}>
          <button onClick={getStreamQueue}>Get Next Stream Queue Game</button>
        </div>
      </div>
    </div>
  );
}

export default App;
