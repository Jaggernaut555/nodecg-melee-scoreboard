import * as React from 'react';
import { useReplicant } from 'use-nodecg';
import anime from 'animejs';
import './og-scoreboard.css';
import PlayerName from './PlayerPlates/playerName';
import PlayerScore from './PlayerPlates/playerScore';
import { MatchInfo, PlayerInfo, TeamInfo } from "../../types/index.d";
import PlayerBracket from './PlayerPlates/playerBracket';
import TitlePlate from './titlePlate';

function App() {
    const [matchInfo, setMatchInfo] = useReplicant<MatchInfo>('matchInfo', new MatchInfo());
    
    const [team1Info, setTeam1Info] = React.useState<TeamInfo>(new TeamInfo());
    const [team2Info, setTeam2Info] = React.useState<TeamInfo>(new TeamInfo());

    const [player1Info, setPlayer1Info] = React.useState<PlayerInfo>(new PlayerInfo());
    const [player2Info, setPlayer2Info] = React.useState<PlayerInfo>(new PlayerInfo());

    const [hideScoreboard, setHideScoreboard] = useReplicant<boolean>('hideScoreboard', true);
    const [title, setTitle] = useReplicant<string>("TournamentTitle", "");
    const [subtitle, setSubtitle] = useReplicant<string>("TournamentSubtitle", "");

    React.useEffect(() => {
        if (matchInfo.teams.length == 2) {
            setTeam1Info(matchInfo.teams[0]);
            setTeam2Info(matchInfo.teams[1]);

            if (matchInfo.teams[0].players.length > 0) {
                setPlayer1Info(matchInfo.teams[0].players[0]);
            }

            if (matchInfo.teams[1].players.length > 0) {
                setPlayer2Info(matchInfo.teams[1].players[0]);
            }
        }
    }, [matchInfo])


    return (
        <div className='scoreboard'>
            <TitlePlate title={title} subtitle={subtitle} keepHidden={hideScoreboard} />
            <div className="sc_small">
                <div className="sc_scores">
                    <PlayerScore score={team1Info.score} index={1} keepHidden={hideScoreboard} />
                    <PlayerScore score={team2Info.score} index={2} keepHidden={hideScoreboard} />
                </div>

                <div className="sc_players">
                    <PlayerName name={player1Info.name} index={1} keepHidden={hideScoreboard} character={player1Info.character} color={player1Info.color} />
                    <PlayerName name={player2Info.name} index={2} keepHidden={hideScoreboard} character={player2Info.character} color={player2Info.color} />
                </div>
            </div>
            <div className="sc_expanded">
                <div className="sc_WL">
                    <PlayerBracket bracket={team1Info.bracket} index={1} keepHidden={hideScoreboard} />
                    <PlayerBracket bracket={team2Info.bracket} index={2} keepHidden={hideScoreboard} />
                </div>
            </div>
        </div>
    );
}

export default App
