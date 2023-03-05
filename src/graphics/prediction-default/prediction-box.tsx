import * as React from "react";
import anime from "animejs";
import "./prediction-default.css";

interface PredictionBoxProps {
  pointsBet: number;
  index: 1 | 2;
  hidden: boolean;
  won: boolean;
}

function PredictionBox(props: PredictionBoxProps) {
  const [, setAnimationRef] = React.useState<
    ReturnType<typeof anime> | undefined
  >();
  const [isHidden, setIsHidden] = React.useState(true);
  const [isAnimating, setIsAnimating] = React.useState(false);

  const hiddenPos = props.index == 1 ? 0 : 0;
  const shownPos = props.index == 1 ? 200 : -200;

  React.useEffect(() => {
    if (isAnimating) {
      return;
    }

    if (props.hidden && !isHidden) {
      setIsAnimating(true);
      setIsHidden(true);
      setAnimationRef(
        anime({
          // after hide animation is completed (or if already hidden) update displayed name
          targets: `.prediction-box.pb${props.index}`,
          easing: "linear",
          translateX: [shownPos, hiddenPos],
          duration: 1000,
          complete: function () {
            setIsAnimating(false);
          },
        })
      );

      return;
    }

    if (!props.hidden && isHidden) {
      setIsAnimating(true);
      setIsHidden(false);
      setAnimationRef(
        anime({
          // after hide animation is completed (or if already hidden) update displayed name
          targets: `.prediction-box.pb${props.index}`,
          easing: "linear",
          translateX: [hiddenPos, shownPos],
          duration: 1000,
          complete: function () {
            setIsAnimating(false);
          },
        })
      );
    }
  }, [props.hidden, isAnimating, props.index, isHidden, shownPos, hiddenPos]);

  return (
    <div className={`prediction-box color3 pb${props.index}`}>
      <p>POINTS BET:</p>
      <p>{props.pointsBet}</p>
      {props.won && <p>WINNER!</p>}
    </div>
  );
}

export default PredictionBox;
