# Running
Download the [latest release](https://github.com/Jaggernaut555/nodecg-melee-scoreboard/releases) and run the `run-scoreboard.bat` file.

This is mostly designed for using automatic name/character/score tracking from slippi. Set the folder to your base `Slippi/` folder usually found in your `My Documents`.

# Updating
Replacing the `portable-nodecg-melee-scoreboard-[version]` folder WILL get rid of any settings you had configured.

If you already have a running version of the scoreboard then just download the `nodecg-melee-scoreboard.zip` file from the releases and replace the folder inside `portable-nodecg-melee-scoreboard-[version]/bundles` and it will keep all your previous settings.


# Installing from source
nodecg-melee-scoreboard is a [NodeCG](http://github.com/nodecg/nodecg) bundle.
It works with NodeCG versions which satisfy this [semver](https://docs.npmjs.com/getting-started/semantic-versioning) range: `^1.1.1`
You will need to have an appropriate version of NodeCG installed to use it.

- Clone this repo into the `bundles` directory of nodecg
- `npm install` in that directory
- `npm run build` to compile it or `npm run watch` for development