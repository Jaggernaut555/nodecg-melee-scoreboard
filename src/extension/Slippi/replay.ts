import {
  GameStartType,
  SlippiGame,
  characters,
  PlayerType,
} from "@slippi/slippi-js";
import _ from "lodash";
import chokidar from "chokidar";
import { ConnectionStatus, MatchInfo, PlayerInfo, TeamInfo } from "../../types";
import * as path from "path";
import context from "../context";
import * as StartGG from "../StartGG/TournamentInfo";
import { updateSubtitleFromStartGG } from "../StartGG/util";
import { Replicants } from "../../types/replicants";

let currentGame: SlippiGame;
let currentGameWatcher: chokidar.FSWatcher;
let replayWatcher: chokidar.FSWatcher | null;

// TODO: can make this an interact-able setting
const testingMode = false;

export async function initReplay() {
  const slippiFolder = context.nodecg.Replicant<string>(
    Replicants.SlippiReplayFolder
  ).value;
  const connectionStatus = context.nodecg.Replicant<ConnectionStatus>(
    Replicants.SlippiConnectionStatus
  );

  context.nodecg.log.info("Setting up replay watcher");

  if (!slippiFolder || !path.isAbsolute(slippiFolder)) {
    context.nodecg.log.error(
      "Configured Slippi folder is not an absolute path"
    );
    connectionStatus.value = "disconnected";
    return;
  }

  context.nodecg.log.debug(slippiFolder);
  connectionStatus.value = "connected";

  replayWatcher = chokidar
    .watch(`${slippiFolder}\\**\\*.slp`, {
      persistent: true,
      // Polling uses more CPU than necessary
      // usePolling: true,
      ignoreInitial: true,
      // ignored: [`${slippiFolder}\\Spectate\\**`],
    })
    .on("add", watchForNewReplays);
}

export async function deactivateReplay() {
  if (replayWatcher) {
    // replayWatcher.off('add', watchForNewReplays);
    replayWatcher.close();
  }
  replayWatcher = null;
  const connectionStatus = context.nodecg.Replicant<ConnectionStatus>(
    Replicants.SlippiConnectionStatus
  );
  connectionStatus.value = "disconnected";
}

function watchForNewReplays(path: string) {
  context.nodecg.log.debug("New game found");
  const game = new SlippiGame(path, { processOnTheFly: true });

  // Don't track games that are already over
  const end = game.getGameEnd();
  if (end && !testingMode) {
    context.nodecg.log.debug("Skipping completed game");
    return;
  }

  currentGame = game;
  const gamePath = currentGame.getFilePath();
  context.nodecg.log.debug(gamePath);

  try {
    trackNewGame();
  } catch (err) {
    context.nodecg.log.error(err);
    return;
  }

  // If there's something already being tracked drop it
  if (currentGameWatcher) {
    currentGameWatcher.off("change", GameListener);
  }

  if (gamePath === null) {
    return;
  }

  currentGameWatcher = chokidar.watch(gamePath).on("change", GameListener);
}

// Initialize the scoreboard info
// set character/player info
function trackNewGame() {
  // Get game settings – stage, characters, etc
  const settings = currentGame.getSettings();

  if (settings === null) {
    context.nodecg.log.error("No game found");
  } else {
    setNames(settings);
  }
}

function getPlayerInfo(player: PlayerType): PlayerInfo | null {
  if (player.characterId === null || player.characterColor === null) {
    return null;
  }
  const character = characters.getCharacterShortName(player.characterId);
  const color = characters.getCharacterColorName(
    player.characterId,
    player.characterColor
  );

  const p = new PlayerInfo();
  p.character = character;
  p.color = color;
  p.code = player.connectCode;
  p.name = player.displayName;
  p.port = player.port;

  // these two may be incorrect
  // p.bracket
  // p.score

  return p;
}

// This is the main thing called when initializing game info
async function setNames(gameSettings: GameStartType) {
  // Check if sets names are player connect codes
  // If new names reset set and score counts
  // Prefer provided code on players_1 side

  // Teams
  // TODO: make this work
  if (gameSettings.players.length === 4) {
    // // teams
    // // Can be any order
    // let playerPort = getPlayerPort(gameSettings)
    // let [playerTeam, oppTeam] = getTeams(playerPort, gameSettings);
    // // Create codes for each team
    // let playerTeamCode = playerTeam.map((player) => {
    //     return player.connectCode;
    // }).join("&&");
    // let oppTeamCode = oppTeam.map((player) => {
    //     return player.connectCode;
    // }).join("&&");
    // // Reset scores if teams change
    // if (data.sets_1 != playerTeamCode || data.sets_2 != oppTeamCode) {
    //     resetScore(data);
    // }
    // let playerTeamInfo = playerTeam.map((player) => getCharacterInfo(player)).join("&&");
    // let oppTeamInfo = oppTeam.map((player) => getCharacterInfo(player)).join("&&");
    // // Update character or team changes
    // if (playerTeamInfo !== data.players_1 || oppTeamInfo !== data.players_2) {
    //     data.players_1 = playerTeam.map((player) => getCharacterInfo(player)).join("&&");
    //     data.sets_1 = playerTeamCode;
    //     data.players_2 = oppTeam.map((player) => getCharacterInfo(player)).join("&&");
    //     data.sets_2 = oppTeamCode;
    // }
  } else {
    // Only 2 players

    const teams: TeamInfo[] = [];

    for (const player of gameSettings.players) {
      const p = getPlayerInfo(player);

      if (p) {
        const t = new TeamInfo();
        t.players.push(p);
        teams.push(t);
      }
    }

    const matchInfo = getMatchInfo();

    // here will always be one team per new player
    const allPlayersExist =
      matchInfo.teams &&
      matchInfo.teams.length == 2 &&
      matchInfo.teams.every((t) => t.players.length == 1) &&
      matchInfo.teams.every((ot) => {
        const onePlayerTeam = ot.players.length == 1;
        const hasPlayer = teams.some((nt) => {
          if (!nt.players[0].code && !ot.players[0].code) {
            return nt.players[0].port == ot.players[0].port;
          }

          return nt.players[0].code == ot.players[0].code;
        });
        return onePlayerTeam && hasPlayer;
      });

    if (allPlayersExist) {
      context.nodecg.log.debug("re-using old teams");

      // We want to keep the order of the existing teams
      // But update all the player info from the new match
      matchInfo.teams.forEach((team) => {
        const newTeam = teams.find((t) => {
          if (!t.players[0].code && !team.players[0].code) {
            return t.players[0].port == team.players[0].port;
          }
          return t.players[0].code == team.players[0].code;
        });
        if (!newTeam) {
          return;
        }
        team.players = newTeam.players;
      });
    } else {
      context.nodecg.log.debug("new players");
      matchInfo.teams = teams;

      // If new players then try checking StartGG for any previous matches
      const playerIDs = await StartGG.findEntrantIDs(
        teams.map((t) => t.players[0].code)
      );

      // Update info based on StartGG set data if both players are found
      if (playerIDs.length == 2) {
        const setInfo = await StartGG.findCommonSetInfo(playerIDs);

        if (setInfo) {
          updateSubtitleFromStartGG(setInfo);
        }

        const games = await StartGG.findWonGamesOfSet(playerIDs);

        // Set the player's StartGG name and the score of their set
        teams.forEach((t) => {
          const code = t.players[0].code;
          const pid = playerIDs.find((p) => p.code == code);

          if (pid) {
            t.name = pid.displayName;
          }

          const gamesWon = games.filter((g) => g == code).length;
          t.score += gamesWon;
        });
      }
    }

    updateMatchInfo(matchInfo);
  }

  if (testingMode) {
    updateWinner();
  }
}

// This is what waits for changes until the game ends
function GameListener() {
  try {
    const end = currentGame.getGameEnd();
    if (end && !testingMode) {
      context.nodecg.log.debug("Game ended");

      updateWinner();

      currentGameWatcher.off("change", GameListener);
    }
  } catch (error) {
    context.nodecg.log.error(error);
  }
}

function updateWinner() {
  const winnerPort = findWinningPort(currentGame);

  if (winnerPort == -1) {
    context.nodecg.log.debug("no winner found");
    return;
  }

  const matchInfo = getMatchInfo();
  const winner = matchInfo.teams.find((t) =>
    t.players.some((p) => p.port == winnerPort)
  );
  if (winner) {
    winner.score += 1;
  }
  updateMatchInfo(matchInfo);
}

/// Return port of winner or unknown (-1)
// `index` variables are 0 indexed but ports are not
function findWinningPort(game: SlippiGame): number {
  try {
    const gameSettings = game.getSettings();
    const end = game.getGameEnd();

    if (!gameSettings || !end) {
      context.nodecg.log.debug(game, gameSettings, end);
      throw new Error("Current game does not exist");
    }

    const lf = game.getLatestFrame();

    if (!lf) {
      context.nodecg.log.error("Could not get latest frame of slippi replay");
      return -1;
    }

    const stats = game.getStats();

    const players = _.compact(_.values(lf.players)).map((p) => {
      // Because we used `compact` these SHOULD all exist
      // but we only care about ones that exist and are greater than 1 anyway
      const ledgeGrabs = stats?.actionCounts.find(
        (ps) => ps.playerIndex == (p.post.playerIndex ?? -1)
      )?.ledgegrabCount;

      return {
        stocks: p.post.stocksRemaining ?? -1,
        percent: p.post.percent ?? -1,
        index: p.post.playerIndex ?? -1,
        ledgeGrabs: ledgeGrabs ?? -1,
      };
    });

    const LRASWinner = players.filter((p) => p.stocks > 1);
    // this doesn't seem to work for %'s in a timeout so we're not going to use it there
    const stockWinner = game.getWinners().pop()?.playerIndex ?? -1;

    switch (end.gameEndMethod) {
      case 1:
        // Time out
        // if anyone > 60 ledge grabs use LGL
        // if stocks even use %

        // So we are printing the data in the log so it can be reviewed if necessary
        context.nodecg.log.info(`Time out. Printing additional information`);
        context.nodecg.log.info(players);
        return (
          players.reduce((prev, cur) => {
            // TODO:
            // Technically this is just whoever has more ledge grabs
            // but it's unlikely that all players break the LGL
            if (prev.ledgeGrabs > 60 || cur.ledgeGrabs > 60) {
              return prev.ledgeGrabs < cur.ledgeGrabs ? prev : cur;
            }

            if (prev.stocks == cur.stocks) {
              return prev.percent < cur.percent ? prev : cur;
            }

            return prev.stocks > cur.stocks ? prev : cur;
          }).index + 1
        );
      case 2:
        // 2: Someone won on stocks
        return stockWinner + 1;
      case 3:
        // 3: Team won on stocks
        // TODO: support this
        // For a team we can probably just find the port of one winner and then return it
        context.nodecg.log.error("CAN NOT HANDLE TEAM WINNER");
        return -1;
      case 7:
        // Someone pressed L+R+A+Start
        // if only 1 player has more than 1 stock that player is probably the winner
        if (LRASWinner.length == 1) {
          return LRASWinner[0].index + 1;
        }

        // If nobody was at 1 stock there's no winner
        return -1;
    }
  } catch (err) {
    context.nodecg.log.error("Error determining winner in replay");
    context.nodecg.log.error(err);
  }
  return -1;
}

// interface FrameData {
//   [playerIndex: number]: {
//     pre: PreFrameUpdateType;
//     post: PostFrameUpdateType;
//   } | null;
// }

// TODO:
// support teams
// export function getTeams(playerPort: number, slippiData: GameStartType) {
//     let players = slippiData.players;
//     let playerTeam = players.find((p) => {
//         return p.port == playerPort
//     })?.teamId ?? 0;
//     let teamA = players.filter((p) => {
//         return p.teamId == playerTeam;
//     });
//     let teamB = players.filter((p) => {
//         return p.teamId != playerTeam;
//     });
//     return [teamA, teamB];
// }
// function getTeamStockCount(latestFrame: FrameData, team: PlayerType[]) {
//     let stockCount = 0;

//     for (let player of team) {
//         stockCount += _.get(latestFrame, [(player.port - 1), 'post', 'stocksRemaining'], 0);
//     }

//     return stockCount;
// }
// function determineTeamWinner(game: SlippiGame, end: GameEndType, gameSettings: GameStartType) {
//     if (!gameSettings || !end) {
//         console.log(game);
//         log.error(game);
//         throw new Error("Current team game does not exist");
//     }

//     let playerPort = getPlayerPort(gameSettings)
//     let [playerTeam, oppTeam] = getTeams(playerPort, gameSettings);

//     const latestFrame = _.get(game.getLatestFrame(), 'players') || [];
//     const playerStocks = getTeamStockCount(latestFrame, playerTeam);
//     const oppStocks = getTeamStockCount(latestFrame, oppTeam);

//     return [playerStocks, oppStocks];
// }

// TODO:
// Should split players into teams
// team will have players and score

function updateMatchInfo(matchInfo: MatchInfo): void {
  const mi = context.nodecg.Replicant<MatchInfo>(Replicants.MatchInfo);
  mi.value = matchInfo;
}

function getMatchInfo() {
  return context.nodecg.readReplicant<MatchInfo>(Replicants.MatchInfo);
}
