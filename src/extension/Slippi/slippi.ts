import { SlippiMethod } from "../../types";
import context from "../context";
import { deactivateReplay, initReplay } from "./replay";

export function initSlippi() {
  context.nodecg.sendMessage("slippiConnectionStatus", "disconnected");
  const method = nodecg.Replicant<SlippiMethod>("slippiMethod", {
    defaultValue: "fileWatcher",
  });

  let initFunc: () => void = initReplay;
  let stopFunc: () => void = deactivateReplay;

  method.on("change", (newValue) => {
    switch (newValue) {
      case "fileWatcher": {
        initFunc = initReplay;
        stopFunc = deactivateReplay;
        break;
      }
      case "realtime": {
        // set realtime functions
        break;
      }
      default: {
        context.nodecg.log.info("No valid slippi connection method set");
        break;
      }
    }
  });

  nodecg.listenFor("slippiTryConnect", () => {
    nodecg.log.info("trying to connect");
    initFunc();
  });

  nodecg.listenFor("slippiTryDisconnect", () => {
    nodecg.log.info("trying to disconnect");
    stopFunc();
  });

  // TODO:
  // Have it automatically try to run the previous one on launch
  initFunc();
}
