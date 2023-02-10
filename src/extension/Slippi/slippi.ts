import type { NodeCG } from "nodecg-types/types/server";
import { SlippiMethod } from "../../types";
import { deactivateReplay, initReplay } from "./replay";

export function initSlippi(nodecg: NodeCG) {
  nodecg.sendMessage("slippiConnectionStatus", "disconnected");
  const method = nodecg.Replicant<SlippiMethod>("slippiMethod", {
    defaultValue: "fileWatcher",
  });

  let initFunc: (nodecg: NodeCG) => void = initReplay;
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
        nodecg.log.info("No valid slippi connection method set");
        break;
      }
    }
  });

  nodecg.listenFor("slippiTryConnect", () => {
    nodecg.log.info("trying to connect");
    initFunc(nodecg);
  });

  nodecg.listenFor("slippiTryDisconnect", () => {
    nodecg.log.info("trying to disconnect");
    stopFunc();
  });

  // TODO:
  // Have it automatically try to run the previous one on launch
  initFunc(nodecg);
}
