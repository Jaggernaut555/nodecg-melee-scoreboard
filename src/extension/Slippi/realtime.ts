// import type { NodeCG } from 'nodecg-types/types/server';
// import { SlpLiveStream, SlpRealTime, ConnectionEvent, ConnectionStatus, GameEndPayload } from '@vinceau/slp-realtime';
// import { GameStartType, PlayerType, Ports } from '@slippi/slippi-js';

// let slippiConfig = {
//     address: "127.0.0.1",
//     port: Ports.DEFAULT
// }

// const connectionType = "dolphin";
// const stream = new SlpLiveStream(connectionType);
// const realtime = new SlpRealTime();

// // TODO:
// // implement this
// // useful for scoring own games or console mirroring
// async function connectToSlippi(stream: SlpLiveStream, realtime: SlpRealTime) {
//     console.log("Connecting to Slippi...");
//     stream.connection.on(ConnectionEvent.ERROR, (err) => {
//         console.log(err);
//     });
//     stream.connection.once(ConnectionEvent.CONNECT, () => {
//         stream.connection.on(ConnectionEvent.STATUS_CHANGE, (status) => {
//             if (status === ConnectionStatus.CONNECTED) {
//                 console.log("Connected");
//             } else if (status === ConnectionStatus.DISCONNECTED) {
//                 console.log("Disconnected");
//                 process.exit(1);
//             }
//         });
//     });
//     // console.log(stream.connection);
//     await stream.start(slippiConfig.address, slippiConfig.port);
//     realtime.setStream(stream);
// }

// realtime.game.start$.subscribe((gameInfo) => {
//     // game started
// });

// realtime.game.end$.pipe(
//     // decides if this one counts or not
//     // filter((payload) => {
//     //     console.log("filter");
//     //     console.log(payload);
//     //     // return payload.gameEndMethod > 0
//     //     return true;
//     // }),
//     // tap(() => {
//     //     // Tap lets us run side-effects without affecting the event chain
//     //     // Probably best not to use them too much though.
//     //     console.log("Detected end game!");
//     // }),
//     // We only want the combo and the filename
//     //   map(payload => ({
//     //     path: livestream.getCurrentFilename(),
//     //     combo: payload.combo,
//     //   })),
//     // The path can be null so make sure it's not null
//     //   filter(comboEntry => Boolean(comboEntry.path)),
// ).subscribe((gameEndPayload) => {
//     // If all the above is valid, we can simply push the data onto the queue
//     // whenever an event matches such criteria.
//     // console.log(gameEndPayload);
// });
