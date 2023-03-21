import { StreamQueueOption } from "../../types";
import { MessageType } from "../../types/messages";
import { Replicants } from "../../types/replicants";
import context from "../context";
import startGGContext from "./startGGContext";
import { initStreamQueue } from "./streamqueue";

export function initStartGG() {
  context.nodecg.log.info("Setting up StartGG connection");
  initReplicants();
  initStreamQueue();
}

function initReplicants() {
  const accessToken = context.nodecg.Replicant<string>(
    Replicants.StartGGAccessToken
  );
  accessToken.on("change", (newValue) => {
    startGGContext.token = newValue;
  });

  const url = context.nodecg.Replicant<string>(Replicants.StartGGUrl);
  url.on("change", (newValue) => {
    // get tournament info from the URL
    // should probably be a link directly to the event/bracket page
    context.nodecg.log.debug(newValue);
    const SelectedQueue = context.nodecg.Replicant<StreamQueueOption>(
      Replicants.StreamQueueSelectedOption
    );
    SelectedQueue.value = { id: "none", name: "none" };
    if (newValue) {
      context.nodecg.sendMessage(MessageType.RefreshStreamQueues);
    }
  });
}
