import React from "react";
import { useReplicant } from "use-nodecg";
import { ConnectionStatus, SlippiMethod } from "../../types";
// This is needed for some reason to get nodecg
import NodeCG from "nodecg-types/types/browser"; // eslint-disable-line

function App() {
  // this too
  const { nodecg } = window || globalThis || {};

  const [slippiMethod, setSlippiMethod] = useReplicant<SlippiMethod>(
    "slippiMethod",
    "fileWatcher"
  );
  const [displayedSlippiMethod, setDisplayedSlippiMethod] =
    React.useState<SlippiMethod>(slippiMethod);

  const [replayFolder, setReplayFolder] = useReplicant<string>(
    "slippiReplayFolder",
    ""
  );
  const [displayedReplayFolder, setDisplayedReplayFolder] =
    React.useState<string>(replayFolder);

  const [connectionStatus] = useReplicant<ConnectionStatus>(
    "slippiConnectionStatus",
    "disconnected"
  );

  // radio buttons
  // Realtime or Directory

  // if realtime
  // ip:port config

  // if directory
  // set location

  // save button
  // connect/disconnect button
  // status indicator

  const onSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayedSlippiMethod(e.target.value as SlippiMethod);
  };

  const saveChanges = () => {
    setSlippiMethod(displayedSlippiMethod);
    setReplayFolder(displayedReplayFolder);
  };

  const connectToSlippi = () => {
    console.log("connecting");
    nodecg.sendMessage("slippiTryConnect");
  };

  const disconnectFromSlippi = () => {
    console.log("disconnecting");
    nodecg.sendMessage("slippiTryDisconnect");
  };

  React.useEffect(() => {
    setDisplayedSlippiMethod(slippiMethod);
  }, [slippiMethod]);

  React.useEffect(() => {
    setDisplayedReplayFolder(replayFolder);
  }, [replayFolder]);

  const handlePressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      saveChanges();
    }
  };

  return (
    <div>
      <div>
        <input
          type="radio"
          name="slippiMethod"
          value={"realtime"}
          key={"realtime"}
          checked={displayedSlippiMethod == "realtime"}
          onChange={(e) => onSelectChange(e)}
        />
        Realtime
        <input
          type="radio"
          name="slippiMethod"
          key={"fileWatcher"}
          value={"fileWatcher"}
          checked={displayedSlippiMethod == "fileWatcher"}
          onChange={(e) => onSelectChange(e)}
        />
        File Watcher
      </div>

      {displayedSlippiMethod == "realtime" && (
        <div>
          <label>IP:Port</label>
          <input
            disabled={true}
            onKeyDown={(e) => handlePressEnter(e)}
            type="text"
            placeholder="127.0.0.1:51441"
          ></input>
          <label>NOT IMPLEMENTED</label>
        </div>
      )}

      {displayedSlippiMethod == "fileWatcher" && (
        <div>
          <div>
            <label>Replay Directory</label>
            <input
              type="text"
              disabled={connectionStatus == "connected"}
              onKeyDown={handlePressEnter}
              value={displayedReplayFolder}
              onChange={(e) => setDisplayedReplayFolder(e.target.value)}
            ></input>
          </div>
          <div>
            Point this at your "USER/documents/Slippi" or similar folder
          </div>
        </div>
      )}

      <div>
        <button
          disabled={connectionStatus == "connected"}
          onClick={() => saveChanges()}
        >
          Save
        </button>
        <button
          hidden={connectionStatus != "disconnected"}
          onClick={() => connectToSlippi()}
        >
          Connect
        </button>
        <button
          hidden={connectionStatus != "connected"}
          onClick={() => disconnectFromSlippi()}
        >
          Disconnect
        </button>
      </div>
      <div>
        <label>Status: {connectionStatus}</label>
      </div>
    </div>
  );
}

export default App;
