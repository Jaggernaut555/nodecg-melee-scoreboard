import type { NodeCG } from 'nodecg-types/types/server';
import { initSlippi } from './Slippi/slippi';
import * as fs from 'fs';
import { initAPI } from './API/api';

module.exports = function (nodecg: NodeCG) {
	nodecg.log.info(`To edit me, open "${__filename}" in your favorite text editor or IDE.`);
	nodecg.log.info('Visit https://nodecg.com for full documentation.');
	nodecg.log.info('Good luck!');

	// let matchInfo = nodecg.Replicant('matchInfo');
	// matchInfo.on('change', (newValue: any, oldValue) => {
	// 	// console.log(`Changed matchInfo info from ${JSON.stringify(oldValue)} to ${JSON.stringify(newValue)}`);
	// 	console.log(`${newValue.teams.length} teams`);
	// 	for(let team of newValue.teams) {
	// 		console.log(team);
	// 	}
	// });

	// let player2Info = nodecg.Replicant('player2Info');
	// player2Info.on('change', (newValue, oldValue) => {
	// 	console.log(`Changed p2 info from ${JSON.stringify(oldValue)} to ${JSON.stringify(newValue)}`);
	// });

	initAPI(nodecg);
	initSlippi(nodecg);
};
