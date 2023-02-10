# Running
Download the portable .zip from the [latest release](https://github.com/Jaggernaut555/nodecg-melee-scoreboard/releases), extract it to it's own directory, then run the `run-scoreboard.bat` file.

To access the dashboard open the URL shown at the end of startup after opening the bat file. The dashboard can be used as a custom browser dock or in a separate browser. On the dashboard click the `graphics` tab on the top right and copy the url of the scoreboard to put in a browser source on OBS.

This is mostly designed for using automatic name/character/score tracking from slippi. Set the folder to your base `Slippi/` folder usually found in your `My Documents`. 

# Updating
Replacing the `portable-nodecg-melee-scoreboard-[version]` folder WILL get rid of any settings you had configured.

If you already have a running version of the scoreboard then just download the `nodecg-melee-scoreboard.zip` file from the releases and replace the folder inside `portable-nodecg-melee-scoreboard-[version]/bundles` and it will keep all your previous settings.

# Streamdeck

I added some simple API routes to quickly modify scores, winners/losers bracket, and show/hide the scoreboard from devices like the elgato streamdeck. These can be used via the `API Ninja` streamdeck plugin from BarRaider. More information on [The streamdeck doc file](Docs/Streamdeck.md).

# Installing from source
nodecg-melee-scoreboard is a [NodeCG](http://github.com/nodecg/nodecg) bundle.
It works with NodeCG versions which satisfy this [semver](https://docs.npmjs.com/getting-started/semantic-versioning) range: `^1.1.1`
You will need to have an appropriate version of NodeCG installed to use it.

- Clone this repo into the `bundles` directory of nodecg
- `npm install` in that directory
- `npm run build` to compile it or `npm run watch` for development
