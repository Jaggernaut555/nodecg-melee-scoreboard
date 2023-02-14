import * as React from "react";
import anime from "animejs";

interface teamNameProps {
  name: string;
  index: 1 | 2;
  keepHidden: boolean;
}

export function TeamName(props: teamNameProps) {
  const [displayedName, setDisplayedName] = React.useState("");
  const [, setAnimationRef] = React.useState<
    ReturnType<typeof anime> | undefined
  >();
  const [isHidden, setIsHidden] = React.useState(true);
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useLayoutEffect(() => {
    const isChanged = () => {
      return props.name != displayedName;
    };

    const updateInfo = () => {
      setDisplayedName(props.name);
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
          targets: `.team_name.tn${props.index}`,
          easing: "linear",
          translateY: [40, 0],
          translateX: ["-50%", "-50%"],
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
          targets: `.team_name.tn${props.index}`,
          easing: "linear",
          translateY: [40, 0],
          translateX: ["-50%", "-50%"],
          duration: 700,
          complete: function () {
            updateInfo();
            setAnimationRef(
              anime({
                // show score
                targets: `.team_name.tn${props.index}`,
                easing: "linear",
                translateY: [0, 40],
                translateX: ["-50%", "-50%"],
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
        targets: `.team_name.tn${props.index}`,
        easing: "linear",
        translateY: [0, 40],
        translateX: ["-50%", "-50%"],
        duration: 1000,
        complete: function () {
          setIsAnimating(false);
          setIsHidden(false);
        },
      });
    }
  }, [
    props.name,
    isHidden,
    props.keepHidden,
    isAnimating,
    props.index,
    displayedName,
  ]);

  return (
    <div className={`team_name tn${props.index} color3 hidden animated`}>
      {displayedName}
    </div>
  );
}

export default TeamName;
