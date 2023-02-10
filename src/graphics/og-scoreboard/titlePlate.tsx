import anime from "animejs";
import React, { useEffect } from "react";

interface titlePlateProps {
  title: string;
  subtitle: string;
  keepHidden: boolean;
}

function TitlePlate(props: titlePlateProps) {
  const [displayedTitle, setDisplayedTitle] = React.useState("");
  const [displayedSubtitle, setDisplayedSubtitle] = React.useState("");
  const [, setAnimationRef] = React.useState<
    ReturnType<typeof anime> | undefined
  >();
  const [isHidden, setIsHidden] = React.useState(true);
  const [isAnimating, setIsAnimating] = React.useState(false);

  const [, setSubtitleAnimationRef] = React.useState<
    ReturnType<typeof anime> | undefined
  >();
  const [isHiddenSubtitle, setIsHiddenSubtitle] = React.useState(true);
  const [isAnimatingSubtitle, setIsAnimatingSubtitle] = React.useState(false);

  useEffect(() => {
    if (
      isAnimating ||
      (props.keepHidden && isHidden) ||
      (isHidden && !props.title)
    ) {
      return;
    }

    if ((props.keepHidden || !props.title) && !isHidden) {
      setIsAnimating(true);
      setIsHidden(true);
      setAnimationRef(
        anime({
          // after hide animation is completed (or if already hidden) update displayed score
          targets: `.sc_titleBox`,
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

    if (props.title != displayedTitle && !isHidden) {
      setIsAnimating(true);
      setIsHidden(true);
      setAnimationRef(
        anime({
          // after hide animation is completed (or if already hidden) update displayed score
          targets: `.sc_titleBox`,
          easing: "linear",
          translateY: [40, 0],
          duration: 700,
          complete: function () {
            setDisplayedTitle(props.title);
            setAnimationRef(
              anime({
                // show score
                targets: `.sc_titleBox`,
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
      (props.title != displayedTitle && isHidden) ||
      (!props.keepHidden && isHidden)
    ) {
      setIsAnimating(true);
      setDisplayedTitle(props.title);
      anime({
        // show score
        targets: `.sc_titleBox`,
        easing: "linear",
        translateY: [0, 40],
        duration: 1000,
        complete: function () {
          setIsAnimating(false);
          setIsHidden(false);
        },
      });
    }
  }, [props.title, isHidden, props.keepHidden]);

  useEffect(() => {
    if (
      isAnimatingSubtitle ||
      (props.keepHidden && isHiddenSubtitle) ||
      (isHiddenSubtitle && !props.subtitle)
    ) {
      return;
    }

    if ((props.keepHidden || !props.subtitle) && !isHiddenSubtitle) {
      setIsAnimatingSubtitle(true);
      setIsHiddenSubtitle(true);
      setSubtitleAnimationRef(
        anime({
          // after hide animation is completed (or if already hidden) update displayed score
          targets: `.sc_subtitleBox`,
          easing: "linear",
          translateY: [40, 0],
          duration: 1000,
          complete: function () {
            setIsAnimatingSubtitle(false);
          },
        })
      );

      return;
    }

    if (props.subtitle != displayedSubtitle && !isHiddenSubtitle) {
      setIsAnimatingSubtitle(true);
      setIsHiddenSubtitle(true);
      setSubtitleAnimationRef(
        anime({
          // after hide animation is completed (or if already hidden) update displayed score
          targets: `.sc_subtitleBox`,
          easing: "linear",
          translateY: [40, 0],
          duration: 700,
          complete: function () {
            setDisplayedSubtitle(props.subtitle);
            setSubtitleAnimationRef(
              anime({
                // show score
                targets: `.sc_subtitleBox`,
                easing: "linear",
                translateY: [0, 40],
                duration: 700,
                complete: function () {
                  setIsAnimatingSubtitle(false);
                  setIsHiddenSubtitle(false);
                },
              })
            );
          },
        })
      );
    } else if (
      (props.subtitle != displayedSubtitle && isHiddenSubtitle) ||
      (!props.keepHidden && isHiddenSubtitle)
    ) {
      setIsAnimatingSubtitle(true);
      setDisplayedSubtitle(props.subtitle);
      setSubtitleAnimationRef(
        anime({
          // show score
          targets: `.sc_subtitleBox`,
          easing: "linear",
          translateY: [0, 40],
          duration: 1000,
          complete: function () {
            setIsAnimatingSubtitle(false);
            setIsHiddenSubtitle(false);
          },
        })
      );
    }
  }, [props.subtitle, isHiddenSubtitle, props.keepHidden]);

  return (
    <div className="sc_titleBox hidden">
      <div className="title color3" id="game_1">
        {displayedTitle}
      </div>
      <div className="sc_subtitleBox hidden">
        <div className="subtitle color1" id="round_1">
          {displayedSubtitle}
        </div>
      </div>
    </div>
  );
}

export default TitlePlate;
