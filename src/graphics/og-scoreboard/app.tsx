import * as React from "react";
import { useReplicant } from "use-nodecg";
import "./og-scoreboard.css";
import PlayerName from "./PlayerPlates/playerName";
import PlayerScore from "./PlayerPlates/playerScore";
import { MatchInfo, PlayerInfo, TeamInfo } from "../../types";
import PlayerBracket from "./PlayerPlates/playerBracket";
import TitlePlate from "./titlePlate";
import { ReplicantType } from "../../types/replicants";

function App() {
  const [matchInfo] = useReplicant<MatchInfo>(
    ReplicantType.MatchInfo,
    new MatchInfo()
  );

  const [team1Info, setTeam1Info] = React.useState<TeamInfo>(new TeamInfo());
  const [team2Info, setTeam2Info] = React.useState<TeamInfo>(new TeamInfo());

  const [player1Info, setPlayer1Info] = React.useState<PlayerInfo>(
    new PlayerInfo()
  );
  const [player2Info, setPlayer2Info] = React.useState<PlayerInfo>(
    new PlayerInfo()
  );

  const [hideScoreboard] = useReplicant<boolean>(
    ReplicantType.HideScoreboard,
    true
  );
  const [title] = useReplicant<string>(ReplicantType.TournamentTitle, "");
  const [subtitle] = useReplicant<string>(ReplicantType.TournamentSubtitle, "");

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
  }, [matchInfo]);

  // TODO:
  // Replace the keepHidden check here with one in the component probably

  return (
    <div className="scoreboard">
      <TitlePlate
        title={title}
        subtitle={subtitle}
        keepHidden={hideScoreboard}
      />
      <div className="sc_small">
        <div className="sc_scores">
          <PlayerScore
            score={team1Info.score}
            index={1}
            keepHidden={
              hideScoreboard ||
              !matchInfo.teams ||
              !matchInfo.teams[0] ||
              !matchInfo.teams[0].players ||
              !matchInfo.teams[0].players[0]
            }
          />
          <PlayerScore
            score={team2Info.score}
            index={2}
            keepHidden={
              hideScoreboard ||
              !matchInfo.teams ||
              !matchInfo.teams[1] ||
              !matchInfo.teams[1].players ||
              !matchInfo.teams[1].players[0]
            }
          />
        </div>

        <div className="sc_players">
          <PlayerName
            name={player1Info.name}
            index={1}
            keepHidden={
              hideScoreboard ||
              !matchInfo.teams ||
              !matchInfo.teams[0] ||
              !matchInfo.teams[0].players ||
              !matchInfo.teams[0].players[0]
            }
            character={player1Info.character}
            color={player1Info.color}
            teamName={team1Info.name}
          />
          <PlayerName
            name={player2Info.name}
            index={2}
            keepHidden={
              hideScoreboard ||
              !matchInfo.teams ||
              !matchInfo.teams[1] ||
              !matchInfo.teams[1].players ||
              !matchInfo.teams[1].players[0]
            }
            character={player2Info.character}
            color={player2Info.color}
            teamName={team2Info.name}
          />
        </div>
      </div>
      <div className="sc_expanded">
        <div className="sc_WL">
          <PlayerBracket
            bracket={team1Info.bracket}
            index={1}
            keepHidden={
              hideScoreboard ||
              !matchInfo.teams ||
              !matchInfo.teams[0] ||
              !matchInfo.teams[0].players ||
              !matchInfo.teams[0].players[0]
            }
          />
          <PlayerBracket
            bracket={team2Info.bracket}
            index={2}
            keepHidden={
              hideScoreboard ||
              !matchInfo.teams ||
              !matchInfo.teams[1] ||
              !matchInfo.teams[1].players ||
              !matchInfo.teams[1].players[0]
            }
          />
        </div>
      </div>
    </div>
  );
}

export default App;
