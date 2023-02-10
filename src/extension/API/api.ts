import { NodeCG } from "nodecg-types/types/server";
import { MatchInfo, PlayerInfo, TeamInfo } from "../../types/index.d";

let nodecg: NodeCG;

interface scoreDTO {
    team: number;
    operation: "add" | "subtract" | 'get';
}

interface bracketDTO {
    team: number;
    bracket: 'toggle' | 'get';
}

// This is mostly for controlling quick actions with the stream deck
// But other things could use this api too
export function initAPI(init_nodecg: NodeCG) {
    nodecg = init_nodecg;
    nodecg.log.info("Setting up API");

    const app = nodecg.Router();

    app.post('/api/v1/swap', (req, res) => {
        swapPlayers();
        res.sendStatus(200);
    });

    app.post('/api/v1/score', (req, res) => {
        res.send(updateScore(req.body));
    });

    app.post('/api/v1/bracket', (req, res) => {
        // set player in winners or losers bracket
        res.send(updateBracket(req.body));
    });

    app.post('/api/v1/reset', (req, res) => {
        resetScore();
        res.sendStatus(200);
    });

    app.post('/api/v1/scoreboard', (req, res) => {
        toggleScoreboard();
        res.sendStatus(200);
    })

    app.get('/api/v1/scoreboard', (req, res) => {
        let val = nodecg.readReplicant<boolean>('hideScoreboard');
        res.send(val != true ? "on" : "off");
    })

    nodecg.mount(app);
}

// TODO:
// this could probably be in a helper method somewhere and re-used by the dashboard
// instead of duplicate code functionality
function swapPlayers() {
    let matchInfo = nodecg.Replicant<MatchInfo>('matchInfo');

    if (matchInfo.value.teams.length == 2) {
        let temp1 = copyTeamInfo(matchInfo.value.teams[0]);
        let temp2 = copyTeamInfo(matchInfo.value.teams[1]);

        matchInfo.value.teams[0] = temp2;
        matchInfo.value.teams[1] = temp1;
    }
    else {
        console.log("can't swap these teams");
    }
}

function copyTeamInfo(info: TeamInfo): TeamInfo {
    let temp = new TeamInfo();
    
    info.players.forEach(p => {
        temp.players.push(copyPlayerInfo(p));
    })

    temp.bracket = info.bracket;
    temp.score = info.score;

    return temp;
}

function copyPlayerInfo(info: PlayerInfo): PlayerInfo {
    let temp = new PlayerInfo();
    temp.character = info.character;
    temp.code = info.code;
    temp.color = info.color;
    temp.name = info.name;
    temp.port = info.port;
    return temp;
}

function updateScore(dto: scoreDTO) {
    let matchInfo = nodecg.Replicant<MatchInfo>('matchInfo');

    if (!matchInfo.value.teams[dto.team]) {
        return { error: "team does not exist" };
    }

    switch (dto.operation) {
        case 'add':
            matchInfo.value.teams[dto.team].score = matchInfo.value.teams[dto.team].score + 1;
            break;
        case 'subtract':
            matchInfo.value.teams[dto.team].score = matchInfo.value.teams[dto.team].score - 1;
            break;
        case 'get':
            return { score: matchInfo.value.teams[dto.team].score }
        default:
            console.log("failed to update score");
            break;
    }

    return;
}

function updateBracket(dto: bracketDTO) {
    let matchInfo = nodecg.Replicant<MatchInfo>('matchInfo');

    if (!matchInfo.value.teams[dto.team]) {
        return { error: "team does not exist" };
    }

    switch (dto.bracket) {
        case 'toggle':
            if (matchInfo.value.teams[dto.team].bracket == '[L]') {
                matchInfo.value.teams[dto.team].bracket = '[W]';
            }
            else {
                matchInfo.value.teams[dto.team].bracket = '[L]';
            }
            break;
        case 'get':
            return { bracket: matchInfo.value.teams[dto.team].bracket }
        default:
            console.log("failed to update bracket");
            break;
    }

    return;
}

function resetScore() {
    let matchInfo = nodecg.Replicant<MatchInfo>('matchInfo');

    matchInfo.value.teams.forEach((t, i) => {
        matchInfo.value.teams[i].score = 0;
    })
}

function toggleScoreboard() {
    let sb = nodecg.Replicant<boolean>('hideScoreboard');

    sb.value = !sb.value;
}
