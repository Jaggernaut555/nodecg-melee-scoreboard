import anime from "animejs";
import * as React from "react";

interface playerScoreProps {
  score: number;
  index: 1 | 2;
  keepHidden: boolean;
}

function PlayerScore(props: playerScoreProps) {
  const [displayedScore, setDisplayedScore] = React.useState(-1);
  const [, setAnimationRef] = React.useState<
    ReturnType<typeof anime> | undefined
  >();
  const [isHidden, setIsHidden] = React.useState(true);
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useLayoutEffect(() => {
    if (isAnimating || (props.keepHidden && isHidden)) {
      return;
    }

    if (props.keepHidden && !isHidden) {
      setIsAnimating(true);
      setIsHidden(true);
      setAnimationRef(
        anime({
          // after hide animation is completed (or if already hidden) update displayed score
          targets: `.scores.s${props.index}`,
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

    if (props.score != displayedScore && !isHidden) {
      setIsAnimating(true);
      setIsHidden(true);
      setAnimationRef(
        anime({
          // after hide animation is completed (or if already hidden) update displayed score
          targets: `.scores.s${props.index}`,
          easing: "linear",
          translateY: [40, 0],
          duration: 700,
          complete: function () {
            setDisplayedScore(props.score);
            setAnimationRef(
              anime({
                // show score
                targets: `.scores.s${props.index}`,
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
    } else if (
      (props.score != displayedScore && isHidden) ||
      (!props.keepHidden && isHidden)
    ) {
      setIsAnimating(true);
      setDisplayedScore(props.score);
      anime({
        // show score
        targets: `.scores.s${props.index}`,
        easing: "linear",
        translateY: [0, 40],
        duration: 1000,
        complete: function () {
          setIsAnimating(false);
          setIsHidden(false);
        },
      });
    }
  }, [props.score, isHidden, props.keepHidden]);

  return (
    <div className={`scores s${props.index} color2 slow hidden`}>
      {displayedScore}
    </div>
  );
}

export default PlayerScore;
