import type { NodeCG } from "nodecg-types/types/server";
import { initSlippi } from "./Slippi/slippi";
import { initAPI } from "./API/api";
import { MatchInfo } from "../types/index.d";
import { version, name } from "../../package.json";
import { initTwitch } from "./Twitch";

import context from "./context";

module.exports = function (nodecg: NodeCG) {
  context.nodecg = nodecg;

  context.nodecg.log.info(`${name} version ${version}`);
  context.nodecg.log.info(
    "The Dashboard can be found at the URL given at the end of start up"
  );
  context.nodecg.log.info(
    "Get the scoreboard URL from the graphics tab and add it to your OBS Scene"
  );
  context.nodecg.log.info(
    "The dashboard can be added as an OBS custom browser dock"
  );
  context.nodecg.log.info(
    "This must be running before OBS is launched. Otherwise the scoreboard source will need to be refreshed in OBS."
  );
  context.nodecg.log.info("Good luck!");

  initReplicants();
  initAPI();
  initSlippi();
  initTwitch();
};

function initReplicants() {
  // Some things I want to just make sure exist for use everywhere on the scoreboard
  context.nodecg.Replicant("matchInfo", { defaultValue: new MatchInfo() });
  context.nodecg.Replicant<boolean>("hideScoreboard", { defaultValue: true });
}
