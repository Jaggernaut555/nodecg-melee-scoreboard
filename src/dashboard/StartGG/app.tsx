import React from "react";
import { useReplicant } from "use-nodecg";

function App() {
  const [startGGToken, setStartGGToken] = useReplicant<string>(
    "startGGAccessToken",
    ""
  );
  const [displayedStartGGToken, setDisplayedStartGGToken] = React.useState("");

  const [startGGUrl, setStartGGUrl] = useReplicant<string>("startGGUrl", "");
  const [displayedStartGGUrl, setDisplayedStartGGUrl] = React.useState("");

  const saveChanges = () => {
    setStartGGToken(displayedStartGGToken);
    setStartGGUrl(displayedStartGGUrl);
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
    </div>
  );
}

export default App;
