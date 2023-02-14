import context from "../context";
import startGGContext from "./startGGContext";

export function initStartGG() {
  context.nodecg.log.info("Setting up StartGG connection");
  initReplicants();
}

function initReplicants() {
  const accessToken = context.nodecg.Replicant<string>("startGGAccessToken");
  accessToken.on("change", (newValue) => {
    startGGContext.token = newValue;
  });

  const url = context.nodecg.Replicant<string>("startGGUrl");
  url.on("change", (newValue) => {
    // get tournament info from the URL
    // should probably be a link directly to the event/bracket page
    context.nodecg.log.debug(newValue);
  });
}
