import * as React from 'react';
import anime from "animejs";
import { Bracket } from '../../../types';

interface playerNameProps {
    bracket: Bracket;
    index: 1 | 2;
    keepHidden: boolean;
}

function PlayerName(props: playerNameProps) {
    const [displayedBracket, setDisplayedBracket] = React.useState("");
    const [, setAnimationRef] = React.useState<ReturnType<typeof anime> | undefined>();
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
                    targets: `.WL.p${props.index}`,
                    easing: 'linear',
                    translateY: [40, 0],
                    duration: 1000,
                    complete: function () {
                        setIsAnimating(false);
                    }
                })
            );

            return;
        }

        if (props.bracket != displayedBracket && !isHidden) {
            setIsAnimating(true);
            setIsHidden(true);
            setAnimationRef(
                anime({
                    // after hide animation is completed (or if already hidden) update displayed score
                    targets: `.WL.p${props.index}`,
                    easing: 'linear',
                    translateY: [40, 0],
                    duration: 700,
                    complete: function () {
                        setDisplayedBracket(props.bracket);
                        if (props.bracket != '[W]') {
                            console.log("is in losers");
                            setAnimationRef(anime({
                                // show score
                                targets: `.WL.p${props.index}`,
                                easing: 'linear',
                                translateY: [0, 40],
                                duration: 700,
                                complete: function () {
                                    setIsAnimating(false);
                                    setIsHidden(false);
                                }
                            }))
                        }
                        else {
                            setIsAnimating(false);
                        }
                    }
                })
            );
        }
        else if (props.bracket != '[W]' && ((props.bracket != displayedBracket && isHidden) || (!props.keepHidden && isHidden))) {
            setIsAnimating(true);
            setDisplayedBracket(props.bracket);
            anime({
                // show score
                targets: `.WL.p${props.index}`,
                easing: 'linear',
                translateY: [0, 40],
                duration: 1000,
                complete: function () {
                    setIsAnimating(false);
                    setIsHidden(false);
                }
            })
        }
    }, [props.bracket, isHidden, props.keepHidden]);

    return (
        <div className={`WL p${props.index} color3 slow hidden`}>
            <span id="WL_1">{displayedBracket}</span>
        </div>
    )
}

export default PlayerName
