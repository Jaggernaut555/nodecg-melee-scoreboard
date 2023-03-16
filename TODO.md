# New feature ideas

Intro graphic
- something to put on screen during hand warmer
- shows players/characters/etc

Set end graphic
- Show the winner of the game
- could include bet information
  - how much was bet
  - how much was won
  - who won
    - top better only
    - or all betters

Console-relay
- add support for console relay instead of slippi replays
  - replays are only good for spectating slippi matches
- probably track wins/character changes by port
  - if ports change should scores reset

StartGG match selector
- The StartGG requests are 503-ing a decent amount on the auto-find
  - this feature would essentially allow us to try again
- pop up dialog that shows all matches that are ongoing or ready to start
  - select the match happening of available matches
  - populates player names and round info
    - character info and wins can still be tracked via console-relay
  - populate scores already reported if any
    - with console-replay these probably won't be updated in real time
- More useful with console-relay than replay directory
- have to be able to swap players if left/right are not correct

# changes

Not counting hand warmer games
- while prediction is ongoing could ignore results of the game
- assuming that prediction match is a hand warmer
- not sure of any other way we can detect if the game is a hand warmer
  - We may be jumping in to an already started game

Make prediction graphic look better

Make scoreboard graphic look better

# fixes

Allow selecting character color on dashboard
- could make character selector a pop up window that shows all characters and character colors
