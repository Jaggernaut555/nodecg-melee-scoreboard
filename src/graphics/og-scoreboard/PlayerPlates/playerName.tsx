import * as React from 'react';
import anime from "animejs";

interface playerNameProps {
    name: string;
    character: string;
    color: string;
    index: 1 | 2;
    keepHidden: boolean;
}

function PlayerName(props: playerNameProps) {
    const [displayedName, setDisplayedName] = React.useState("");
    const [displayedCharacter, setDisplayedCharacter] = React.useState("");
    const [displayedColor, setDisplayedColor] = React.useState("");
    const [, setAnimationRef] = React.useState<ReturnType<typeof anime> | undefined>();
    const [isHidden, setIsHidden] = React.useState(true);
    const [isAnimating, setIsAnimating] = React.useState(false);


    const isChanged = () => {
        return (props.character != displayedCharacter) || (props.name != displayedName)
    };

    const updateInfo = () => {
        setDisplayedName(props.name);
        setDisplayedCharacter(props.character);
        setDisplayedColor(props.color);
    };

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
                    targets: `.players.p${props.index}`,
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

        if (isChanged() && !isHidden) {
            setIsAnimating(true);
            setIsHidden(true);
            setAnimationRef(
                anime({
                    // after hide animation is completed (or if already hidden) update displayed score
                    targets: `.players.p${props.index}`,
                    easing: 'linear',
                    translateY: [40, 0],
                    duration: 700,
                    complete: function () {
                        updateInfo();
                        setAnimationRef(anime({
                            // show score
                            targets: `.players.p${props.index}`,
                            easing: 'linear',
                            translateY: [0, 40],
                            duration: 700,
                            complete: function () {
                                setIsAnimating(false);
                                setIsHidden(false);
                            }
                        }))
                    }
                })
            );
        }
        else if ((isChanged() && isHidden) || (!props.keepHidden && isHidden)) {
            setIsAnimating(true);
            updateInfo();
            anime({
                // show score
                targets: `.players.p${props.index}`,
                easing: 'linear',
                translateY: [0, 40],
                duration: 1000,
                complete: function () {
                    setIsAnimating(false);
                    setIsHidden(false);
                }
            })
        }
    }, [props.name, props.character, isHidden, props.keepHidden]);


    // TODO:
    // Will have to adjust placement for teams

    // TODO:
    // support character colors

    return (
        <div className={`players p${props.index} color1 hidden animated`}>
            {props.index == 1 && 
                <img src={`../images/StockIcons/${displayedCharacter}/${displayedColor}.png`}></img>
            }
            <span> {displayedName} </span>
            {props.index != 1 && 
                <img src={`../images/StockIcons/${displayedCharacter}/${displayedColor}.png`}></img>
            }
        </div>
    )
}

export default PlayerName
