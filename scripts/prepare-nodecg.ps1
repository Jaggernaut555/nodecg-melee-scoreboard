# Script to run for release

# Expecting to be run from the `scripts/` folder
Set-location ..

# TODO:
# I have no idea if the variable from the github workflow will show up here
# If it is fine then this can be removed
if (Get-Variable "REPO_NAME" -ErrorAction 'Ignore') {
    Write-Output "Preparing $REPO_NAME"
} else {
    Write-Output "REPO_NAME variable Does not exist"
    $REPO_NAME='nodecg-melee-scoreboard'
}

# setup nodecg
git clone --depth 1 --branch legacy-1.x https://github.com/nodecg/nodecg.git dist
Set-Location dist
npm ci --omit=dev

# Copy the node exe and the launch script
xcopy ..\scripts\run-scoreboard.bat .
xcopy (Get-command node.exe).Path .

# Set up the bundle
Set-Location bundles
mkdir $REPO_NAME
Set-Location $REPO_NAME

# Copy the compiled files into the bundle
Robocopy ..\..\..\ . README.md LICENSE package.json package-lock.json /NFL /NDL
Robocopy ..\..\..\dashboard .\dashboard\ /s /e /NFL /NDL
Robocopy ..\..\..\extension .\extension\ /s /e /NFL /NDL
Robocopy ..\..\..\graphics .\graphics\ /s /e /NFL /NDL
Robocopy ..\..\..\images .\images\ /s /e /NFL /NDL

# Install the node_modules required in production
npm ci --omit=dev --legacy-peer-deps

## Zip file for release
Set-Location ..\..\..
Compress-Archive dist/* "$REPO_NAME.zip" -CompressionLevel Fastest