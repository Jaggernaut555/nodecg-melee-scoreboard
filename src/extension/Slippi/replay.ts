import {
  GameStartType,
  SlippiGame,
  characters,
  PlayerType,
} from "@slippi/slippi-js";
import _ from "lodash";
import { NodeCG } from "nodecg-types/types/server";
import chokidar from "chokidar";
import {
  ConnectionStatus,
  MatchInfo,
  PlayerInfo,
  TeamInfo,
} from "../../types/index.d";
import * as path from "path";

let nodecg: NodeCG;

let currentGame: SlippiGame;
let currentGameWatcher: chokidar.FSWatcher;
let replayWatcher: chokidar.FSWatcher | null;

// TODO: can make this an interact-able setting
const testingMode = false;

export async function initReplay(nodecg_init: NodeCG) {
  nodecg = nodecg_init;
  const slippiFolder = nodecg.Replicant<string>("slippiReplayFolder").value;
  const connectionStatus = nodecg.Replicant<ConnectionStatus>(
    "slippiConnectionStatus"
  );

  nodecg.log.info("Setting up replay watcher");

  if (!slippiFolder || !path.isAbsolute(slippiFolder)) {
    nodecg.log.error("Configured Slippi folder is not an absolute path");
    connectionStatus.value = "disconnected";
    return;
  }

  nodecg.log.debug(slippiFolder);
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
  const connectionStatus = nodecg.Replicant<ConnectionStatus>(
    "slippiConnectionStatus"
  );
  connectionStatus.value = "disconnected";
}

function watchForNewReplays(path: string) {
  nodecg.log.debug("New game found");
  const game = new SlippiGame(path, { processOnTheFly: true });

  // Don't track games that are already over
  const end = game.getGameEnd();
  if (end && !testingMode) {
    nodecg.log.debug("Skipping completed game");
    return;
  }

  currentGame = game;
  const gamePath = currentGame.getFilePath();
  nodecg.log.debug(gamePath);

  try {
    trackNewGame();
  } catch (err) {
    nodecg.log.error(err);
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
    nodecg.log.error("No game found");
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
    const allPlayersExist = matchInfo.teams.every((ot) => {
      const onePlayerTeam = ot.players.length == 1;
      const hasPlayer = teams.some(
        (nt) => nt.players[0].code == ot.players[0].code
      );
      return onePlayerTeam && hasPlayer;
    });

    if (allPlayersExist) {
      nodecg.log.debug("re-using old teams");

      teams.forEach((team) => {
        // we just checked so these must exist
        const oldTeam = matchInfo.teams.find(
          (t) => t.players[0].code == team.players[0].code
        );
        if (!oldTeam) {
          return;
        }
        // TODO: Extract this to utils
        team.score = oldTeam.score;
        team.bracket = oldTeam.bracket;
        team.outcomeId = oldTeam.outcomeId;
      });
    } else {
      nodecg.log.debug("new players");
    }

    matchInfo.teams = teams;
    updateMatchInfo(matchInfo);
  }

  if (testingMode) {
    const winnerIndex = determineWinner(currentGame);

    const matchInfo = getMatchInfo();
    matchInfo.teams[winnerIndex].score += 1;
    updateMatchInfo(matchInfo);
  }
}

// This is what waits for changes until the game ends
function GameListener() {
  try {
    const end = currentGame.getGameEnd();
    if (end && !testingMode) {
      nodecg.log.debug("Game ended");

      const winnerIndex = determineWinner(currentGame);

      if (winnerIndex == -1) {
        nodecg.log.debug("no winner found");
        return;
      }

      const matchInfo = getMatchInfo();
      matchInfo.teams[winnerIndex].score += 1;
      updateMatchInfo(matchInfo);
      currentGameWatcher.off("change", GameListener);
    }
  } catch (error) {
    nodecg.log.error(error);
  }
}

/// Return index of winner (0/1) or unknown (-1)
export function determineWinner(game: SlippiGame): number {
  try {
    const gameSettings = game.getSettings();
    const end = game.getGameEnd();

    if (!gameSettings || !end) {
      nodecg.log.debug(game, gameSettings, end);
      throw new Error("Current game does not exist");
    }

    const latestFrame = _.get(game.getLatestFrame(), "players") || [];

    let playerStocks: number;
    let oppStocks: number;

    if (gameSettings.players.length != 2) {
      // team game
      // [playerStocks, oppStocks] = determineTeamWinner(game, end, gameSettings);
      [playerStocks, oppStocks] = [0, 1];
    } else {
      // 0 is first player
      // 1 is second player
      playerStocks = _.get(latestFrame, [0, "post", "stocksRemaining"]);
      oppStocks = _.get(latestFrame, [1, "post", "stocksRemaining"]);
    }

    switch (end.gameEndMethod) {
      case 1:
        // Time out
        // could determine stocks/percent
        return -1;
      case 2:
      case 3:
        // 2: Someone won on stocks
        // 3: Team won on stocks
        if (playerStocks === 0 && oppStocks === 0) {
          // Can this happen?
          return -1;
        }

        return playerStocks === 0 ? 1 : 0;
      case 7:
        // TODO: this might have changed

        // Someone pressed L+R+A+Start
        // if only 1 player at 1 stock they probably lost
        if (playerStocks === 1 && !(oppStocks === 1)) {
          return 1;
        } else if (!(playerStocks === 1) && oppStocks === 1) {
          return 0;
        }
        // If nobody was at 1 stock there's no winner
        return -1;
    }
  } catch (err) {
    nodecg.log.error("Error determining winner");
    nodecg.log.error(err);
  }
  return -1;
}

// interface FrameData {
//     [playerIndex: number]: {
//         pre: PreFrameUpdateType;
//         post: PostFrameUpdateType;
//     } | null;
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
  const mi = nodecg.Replicant<MatchInfo>("matchInfo");
  mi.value = matchInfo;
}

function getMatchInfo() {
  return nodecg.readReplicant<MatchInfo>("matchInfo");
}
