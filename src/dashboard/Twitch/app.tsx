import React, { useEffect } from "react";
import { useReplicant } from "use-nodecg";
import { TwitchPredictionStatus } from "../../types";
import { ReplicantType } from "../../types/replicants";
import { MessageType } from "../../types/messages";

function App() {
  const [predictionStatus] = useReplicant<TwitchPredictionStatus>(
    ReplicantType.TwitchCurrentPredictionStatus,
    "Stopped"
  );

  const [validLogin] = useReplicant<boolean>(
    ReplicantType.TwitchValidLogin,
    false
  );

  const [callbackUrl] = useReplicant<string>(
    ReplicantType.TwitchCallbackUrl,
    ""
  );
  const [twitchUserId] = useReplicant<string>(ReplicantType.TwitchUserId, "");
  const [clientId, setClientId] = useReplicant<string>(
    ReplicantType.TwitchClientId,
    ""
  );
  const [clientSecret, setClientSecret] = useReplicant<string>(
    ReplicantType.TwitchClientSecret,
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
    // We don't want to call this on updates to the displayed info
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, clientSecret]);

  const tryConnect = () => {
    // Send a message to try to set up
    nodecg
      .sendMessage(MessageType.TwitchCheckToken)
      .then(() => {
        // send to login page
        window.open("/auth/twitch", "_top");
      })
      .catch((err) => {
        // display error somewhere
        console.log(err);
      });
  };

  const startPrediction = () => {
    nodecg.sendMessage(MessageType.TwitchCreatePrediction);
  };

  const lockPrediction = () => {
    nodecg.sendMessage(MessageType.TwitchLockPrediction);
  };

  const CancelPrediction = () => {
    nodecg.sendMessage(MessageType.TwitchCancelPrediction);
  };

  const resolvePrediction = () => {
    nodecg.sendMessage(MessageType.TwitchResolvePrediction);
  };

  return (
    <div>
      <div>
        <label>You MUST be affiliate/partner to use this section</label>
      </div>
      <div>
        <label>Twitch User ID: </label>
        <label>{twitchUserId}</label>
      </div>
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
            onClick={resolvePrediction}
          >
            End Prediction
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
