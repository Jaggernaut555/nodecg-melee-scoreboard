import React, { useEffect, useState } from "react";
import { useReplicant } from 'use-nodecg';

function App() {
    const [hideScoreboard, setHideScoreboard] = useReplicant<boolean>('hideScoreboard', true);
    const [title, setTitle] = useReplicant<string>("TournamentTitle", "");
    const [subtitle, setSubtitle] = useReplicant<string>("TournamentSubtitle", "");

    const [displayedHideScoreboard, setDisplayedHideScoreboard] = useState<boolean>(hideScoreboard);
    const [displayedTitle, setDisplayedTitle] = useState<string>(title);
    const [displayedSubtitle, setDisplayedSubtitle] = useState<string>(subtitle);

    useEffect(() => {
        setDisplayedTitle(title);
        setDisplayedSubtitle(subtitle);
        setDisplayedHideScoreboard(hideScoreboard);
    }, [title, subtitle, hideScoreboard])

    const updateTitleInfo = () => {
        setTitle(displayedTitle);
        setSubtitle(displayedSubtitle);
        setHideScoreboard(displayedHideScoreboard)
    }

    const updateHideScoreboard = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDisplayedHideScoreboard(e.target.checked)
    }

    const handlePressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            updateTitleInfo();
        }
    }

    return (
        <div>
            <div>
                <label>hide scoreboard</label>
                <input type='checkbox' id='hideScoreboardCheckbox' checked={displayedHideScoreboard} onChange={e => updateHideScoreboard(e)}></input>
            </div>
            <div>
                <label>Main Title</label>
                <input type="text" value={displayedTitle} onKeyDown={handlePressEnter} onChange={e => setDisplayedTitle(e.target.value)}></input>
            </div>
            <div>
                <label>Subtitle</label>
                <input type="text" value={displayedSubtitle} onKeyDown={handlePressEnter} onChange={e => setDisplayedSubtitle(e.target.value)}></input>
            </div>
            <button onClick={updateTitleInfo}>update</button>
        </div>
    );
}

export default App;
