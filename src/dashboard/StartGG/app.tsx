import React from "react";
import { useReplicant } from "use-nodecg";
import { StreamQueueOption } from "../../types";
import { MessageType } from "../../types/messages";
import { Replicants } from "../../types/replicants";
import "../util/global.css";

function App() {
  const [startGGToken, setStartGGToken] = useReplicant<string>(
    Replicants.StartGGAccessToken,
    ""
  );
  const [displayedStartGGToken, setDisplayedStartGGToken] = React.useState("");

  const [startGGUrl, setStartGGUrl] = useReplicant<string>(
    Replicants.StartGGUrl,
    ""
  );
  const [displayedStartGGUrl, setDisplayedStartGGUrl] = React.useState("");

  const [autoTrack, setAutoTrack] = useReplicant<boolean>(
    Replicants.StartGGAutoTrack,
    false
  );
  const [displayedAutoTrack, setDisplayedAutotrack] = React.useState(false);

  const [StreamQueueOptions] = useReplicant<StreamQueueOption[]>(
    Replicants.StreamQueueOptions,
    []
  );
  const [StreamQueueSelectedOption, setStreamQueueSelectedOption] =
    useReplicant<StreamQueueOption>(Replicants.StreamQueueSelectedOption, {
      name: "none",
      id: "none",
    });

  const saveChanges = () => {
    setStartGGToken(displayedStartGGToken);
    setStartGGUrl(displayedStartGGUrl);
    setAutoTrack(displayedAutoTrack);
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
    if (displayedAutoTrack != autoTrack) setDisplayedAutotrack(autoTrack);
    // We don't want to call this on updates to the displayed info
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startGGToken, startGGUrl, autoTrack]);

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
      <div>
        <label>Automatically search StartGG</label>
        <input
          type="checkbox"
          checked={displayedAutoTrack}
          onChange={(e) => setDisplayedAutotrack(e.target.checked)}
        ></input>
      </div>
      <button onClick={saveChanges}>Save</button>

      <div hidden={!startGGUrl || startGGUrl == ""}>
        <div>Controls:</div>
        <div>
          <button nodecg-dialog="StartGGMatchDialog">Find Match Dialog</button>
        </div>

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
          <button onClick={getStreamQueue}>Get Next Stream Queue Set</button>
        </div>
      </div>
    </div>
  );
}

export default App;
