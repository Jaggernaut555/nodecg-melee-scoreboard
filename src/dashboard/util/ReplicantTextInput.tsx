import React from "react";
import "../util/input.css";

interface ReplicantInputProps {
  autosave: boolean;
  saveChanges: (newData: string) => void;
  data: string;
}

function ReplicantTextInput(props: ReplicantInputProps) {
  // Create a temp input type to display
  const [displayData, setDisplayData] = React.useState<string>(props.data);
  const [displayIcon, setDisplayIcon] = React.useState<string>("fa-check");

  const handlePressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      props.saveChanges(displayData);
      setDisplayIcon("fa-check");
    }
  };

  // if autosave
  // call saveChanges
  React.useEffect(() => {
    if (props.autosave && props.data != displayData) {
      props.saveChanges(displayData);
    } else if (displayData != props.data) {
      setDisplayIcon("fa-floppy-disk");
    }
  }, [displayData]);

  React.useEffect(() => {
    if (props.data != displayData) {
      setDisplayData(props.data);
    }
  }, [props.data]);

  // Render the input
  return (
    <div className="text-input">
      <span className="form-element">
        <span className={`fa ${displayIcon}`}></span>
        <input
          type="string"
          value={displayData}
          onKeyDown={handlePressEnter}
          onChange={(e) => setDisplayData(e.target.value)}
        ></input>
      </span>
    </div>
  );
}

export default ReplicantTextInput;
