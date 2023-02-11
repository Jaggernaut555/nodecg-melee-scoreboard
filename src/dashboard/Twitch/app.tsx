import React, { useEffect } from "react";
import { useReplicant } from "use-nodecg";
import { TwitchPredictionStatus } from "../../types/index.d";

function App() {
  const [predictionStatus] = useReplicant<TwitchPredictionStatus>(
    "twitchCurrentPredictionStatus",
    "Stopped"
  );

  const [validLogin] = useReplicant<boolean>("twitchedValidLogin", false);

  const [callbackUrl] = useReplicant<string>("twitchCallbackUrl", "");
  const [twitchUserId] = useReplicant<string>("twitchUserId", "");
  const [clientId, setClientId] = useReplicant<string>("twitchClientId", "");
  const [clientSecret, setClientSecret] = useReplicant<string>(
    "twitchClientSecret",
    ""
  );

  const [displayedClientId, setDisplayedClientId] =
    React.useState<string>(clientId);
  const [displayedClientSecret, setDisplayedClientSecret] =
    React.useState<string>(clientSecret);

  const copyCallbackUrl = () => {
    navigator.clipboard.writeText(callbackUrl);
  };

  const saveClientSettings = () => {
    if (clientId != displayedClientId) setClientId(displayedClientId);
    if (clientSecret != displayedClientSecret)
      setClientSecret(displayedClientSecret);
  };

  useEffect(() => {
    if (clientId != displayedClientId) setDisplayedClientId(clientId);
    if (clientSecret != displayedClientSecret)
      setDisplayedClientSecret(clientSecret);
  }, [clientId, clientSecret]);

  const tryConnect = () => {
    // Send a message to try to set up
    nodecg
      .sendMessage("twitchCheckToken")
      .then((val) => {
        // send to login page
        window.open("/auth/twitch", "_top");
      })
      .catch((err) => {
        // display error somewhere
        console.log(err);
      });
  };

  const startPrediction = () => {
    nodecg.sendMessage("twitchStartPrediction");
  };

  const lockPrediction = () => {
    nodecg.sendMessage("twitchLockPrediction");
  };

  const CancelPrediction = () => {
    nodecg.sendMessage("twitchCancelPrediction");
  };

  const endPrediction = () => {
    nodecg.sendMessage("twitchEndPrediction");
  };

  // TODO:
  // display callback url

  useEffect(() => {
    console.log(validLogin);
  }, [validLogin]);

  return (
    <div>
      <h1>Twitch</h1>
      <label>Twitch User ID: </label>
      <label>{twitchUserId}</label>
      <div>
        <label>Set up an app as described </label>
        <a
          href="https://dev.twitch.tv/docs/authentication/register-app/"
          target={"_blank"}
        >
          here
        </a>
      </div>
      <div>
        <label>Copy Callback URL: </label>
        <button onClick={copyCallbackUrl}>Copy</button>
      </div>
      <div>
        <label>Client ID</label>
        <input
          type="password"
          value={displayedClientId}
          onChange={(e) => setDisplayedClientId(e.target.value)}
        />
      </div>
      <div>
        <label>Client Secret</label>
        <input
          type="password"
          value={displayedClientSecret}
          onChange={(e) => setDisplayedClientSecret(e.target.value)}
        />
      </div>
      <div>
        <button onClick={saveClientSettings}>Save Client Settings</button>
        <button onClick={tryConnect}>Log In With Twitch</button>
      </div>
      <div>
        <label>Valid Token: </label>
        <label>{clientId && clientSecret && validLogin ? "Yes" : "No"}</label>
      </div>
      {validLogin && (
        <div>
          <button
            disabled={!validLogin || predictionStatus != "Stopped"}
            onClick={startPrediction}
          >
            Start Prediction
          </button>
          <button
            disabled={!validLogin || predictionStatus != "Started"}
            onClick={lockPrediction}
          >
            Lock Prediction
          </button>
          <button
            disabled={!validLogin || predictionStatus == "Stopped"}
            onClick={CancelPrediction}
          >
            Cancel Prediction
          </button>
          <button
            disabled={!validLogin || predictionStatus == "Stopped"}
            onClick={endPrediction}
          >
            End Prediction
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
