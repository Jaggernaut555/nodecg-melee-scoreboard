import type { NodeCG } from 'nodecg-types/types/server';
import { initSlippi } from './Slippi/slippi';
import { initAPI } from './API/api';
import { MatchInfo } from '../types/index.d';

module.exports = function (nodecg: NodeCG) {
	nodecg.log.info(`To edit me, open "${__filename}" in your favorite text editor or IDE.`);
	nodecg.log.info('Visit https://nodecg.com for full documentation.');
	nodecg.log.info('Good luck!');

	initReplicants(nodecg);
	initAPI(nodecg);
	initSlippi(nodecg);
};

function initReplicants(nodecg: NodeCG) {
	// Some things I want to just make sure exist for use everywhere on the scoreboard
	let matchInfo = nodecg.Replicant('matchInfo', { defaultValue: new MatchInfo() })
	let sb = nodecg.Replicant<boolean>('hideScoreboard', { defaultValue: true });
}
