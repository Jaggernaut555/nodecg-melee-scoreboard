import * as React from "react";
import anime from "animejs";
import TeamName from "./teamName";

interface playerNameProps {
  // TODO: rework this so it accepts team of multiple players instead of just one
  name: string;
  character: string;
  color: string;
  index: 1 | 2;
  keepHidden: boolean;
  teamName: string;
}

function PlayerName(props: playerNameProps) {
  const [displayedName, setDisplayedName] = React.useState("");
  const [displayedCharacter, setDisplayedCharacter] = React.useState("");
  const [displayedColor, setDisplayedColor] = React.useState("");
  const [, setAnimationRef] = React.useState<
    ReturnType<typeof anime> | undefined
  >();
  const [isHidden, setIsHidden] = React.useState(true);
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useLayoutEffect(() => {
    const isChanged = () => {
      return (
        props.character != displayedCharacter ||
        (!!props.name && props.name != displayedName) ||
        (!props.name && !!props.teamName && props.teamName != displayedName)
      );
    };

    const updateInfo = () => {
      if (!!props.teamName && !props.name) {
        setDisplayedName(props.teamName);
      } else {
        setDisplayedName(props.name);
      }
      setDisplayedCharacter(props.character);
      setDisplayedColor(props.color);
    };

    if (isAnimating || (props.keepHidden && isHidden)) {
      return;
    }

    if (props.keepHidden && !isHidden) {
      setIsAnimating(true);
      setIsHidden(true);
      setAnimationRef(
        anime({
          // after hide animation is completed (or if already hidden) update displayed score
          targets: `.player_name_animation.p${props.index}`,
          easing: "linear",
          translateY: [40, 0],
          duration: 1000,
          complete: function () {
            setIsAnimating(false);
          },
        })
      );

      return;
    }

    if (isChanged() && !isHidden) {
      setIsAnimating(true);
      setIsHidden(true);
      setAnimationRef(
        anime({
          // after hide animation is completed (or if already hidden) update displayed score
          targets: `.player_name_animation.p${props.index}`,
          easing: "linear",
          translateY: [40, 0],
          duration: 700,
          complete: function () {
            updateInfo();
            setAnimationRef(
              anime({
                // show score
                targets: `.player_name_animation.p${props.index}`,
                easing: "linear",
                translateY: [0, 40],
                duration: 700,
                complete: function () {
                  setIsAnimating(false);
                  setIsHidden(false);
                },
              })
            );
          },
        })
      );
    } else if ((isChanged() && isHidden) || (!props.keepHidden && isHidden)) {
      setIsAnimating(true);
      updateInfo();
      anime({
        // show score
        targets: `.player_name_animation.p${props.index}`,
        easing: "linear",
        translateY: [0, 40],
        duration: 1000,
        complete: function () {
          setIsAnimating(false);
          setIsHidden(false);
        },
      });
    }
  }, [
    props.name,
    props.teamName,
    props.character,
    isHidden,
    props.keepHidden,
    isAnimating,
    props.color,
    props.index,
    displayedCharacter,
    displayedName,
  ]);

  // TODO:
  // Support teams

  return (
    <div className={`player_name_position p${props.index}`}>
      <div className={`player_name_animation p${props.index} hidden animated`}>
        <div className={`players p${props.index} color1 `}>
          {props.index == 1 && (
            <img
              src={`../images/StockIcons/${displayedCharacter}/${displayedColor}.png`}
            ></img>
          )}
          <span> {displayedName} </span>
          {props.index != 1 && (
            <img
              src={`../images/StockIcons/${displayedCharacter}/${displayedColor}.png`}
            ></img>
          )}
        </div>
        <TeamName
          name={props.teamName}
          index={props.index}
          keepHidden={
            props.keepHidden ||
            props.teamName.toLowerCase() == props.name.toLowerCase() ||
            (!!props.teamName && !props.name)
          }
        />
      </div>
    </div>
  );
}

export default PlayerName;
