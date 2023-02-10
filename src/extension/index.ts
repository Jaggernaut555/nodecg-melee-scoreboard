import type { NodeCG } from 'nodecg-types/types/server';
import { initSlippi } from './Slippi/slippi';
import { initAPI } from './API/api';
import { MatchInfo } from '../types/index.d';
import { version, name } from '../../package.json';

module.exports = function (nodecg: NodeCG) {
	nodecg.log.info(`${name} version ${version}`);
	nodecg.log.info("The Dashboard can be found at the URL given at the end of start up");
	nodecg.log.info("Get the scoreboard URL from the graphics tab and add it to your OBS Scene");
	nodecg.log.info("The dashboard can be added as an OBS custom browser dock");
	nodecg.log.info("This must be running before OBS is launched. Otherwise the scoreboard source will need to be refreshed in OBS.");
	nodecg.log.info('Good luck!');

	initReplicants(nodecg);
	initAPI(nodecg);
	initSlippi(nodecg);
};

function initReplicants(nodecg: NodeCG) {
	// Some things I want to just make sure exist for use everywhere on the scoreboard
	nodecg.Replicant('matchInfo', { defaultValue: new MatchInfo() })
	nodecg.Replicant<boolean>('hideScoreboard', { defaultValue: true });
}
