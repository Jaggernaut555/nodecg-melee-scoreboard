import React, { useEffect, useState } from "react";
import { useReplicant } from "use-nodecg";
import ReplicantTextInput from "../util/ReplicantTextInput";

function App() {
  const [hideScoreboard, setHideScoreboard] = useReplicant<boolean>(
    "hideScoreboard",
    true
  );
  const [title, setTitle] = useReplicant<string>("TournamentTitle", "");
  const [subtitle, setSubtitle] = useReplicant<string>(
    "TournamentSubtitle",
    ""
  );

  const updateHideScoreboard = () => {
    setHideScoreboard(!hideScoreboard);
  };

  return (
    <div>
      <div>
        <button onClick={updateHideScoreboard}>
          {hideScoreboard ? "show" : "hide"} scoreboard
        </button>
      </div>
      <div>
        <label>Main Title</label>
        <ReplicantTextInput
          autosave={false}
          saveChanges={setTitle}
          data={title}
        />
      </div>
      <div>
        <label>Subtitle</label>
        <ReplicantTextInput
          autosave={false}
          saveChanges={setSubtitle}
          data={subtitle}
        />
      </div>
    </div>
  );
}

export default App;
