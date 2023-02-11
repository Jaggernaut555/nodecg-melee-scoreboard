import { SlippiMethod } from "../../types";
import context from "../context";
import { deactivateReplay, initReplay } from "./replay";

export function initSlippi() {
  context.nodecg.sendMessage("slippiConnectionStatus", "disconnected");
  const method = context.nodecg.Replicant<SlippiMethod>("slippiMethod", {
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

  context.nodecg.listenFor("slippiTryConnect", () => {
    context.nodecg.log.info("trying to connect");
    initFunc();
  });

  context.nodecg.listenFor("slippiTryDisconnect", () => {
    context.nodecg.log.info("trying to disconnect");
    stopFunc();
  });

  // TODO:
  // Have it automatically try to run the previous one on launch
  initFunc();
}
