# Script to run for release

param(
    [string]$version='0.0.0',
    [string]$bundleName='nodecg-melee-scoreboard'
)

# Expecting to be run from the `scripts/` folder
if ((Get-Location | split-path -leaf) -eq "scripts") {
    Set-location ..
}

Write-Output "Bundle name: $bundleName"
Write-Output "Version: $version"

# setup nodecg
git clone --depth 1 --branch legacy-1.x https://github.com/nodecg/nodecg.git dist
Set-Location dist
npm install --omit=dev

# Copy the node exe and the launch script
xcopy ..\scripts\run-scoreboard.bat .
xcopy (Get-command node.exe).Path .

# Set up the bundle
Set-Location bundles
mkdir $bundleName
Set-Location $bundleName

# Copy the compiled files into the bundle
Robocopy ..\..\..\ . README.md LICENSE package.json package-lock.json /NFL /NDL
Robocopy ..\..\..\dashboard .\dashboard\ /s /e /NFL /NDL
Robocopy ..\..\..\extension .\extension\ /s /e /NFL /NDL
Robocopy ..\..\..\graphics .\graphics\ /s /e /NFL /NDL
Robocopy ..\..\..\images .\images\ /s /e /NFL /NDL

# Install the node_modules required in production
npm install --omit=dev --legacy-peer-deps

## Zip file for release
Set-Location ..\..\..
# Entire package
7z a portable-$bundleName-$version.zip ./dist/*

# Only bundle
7z a "$bundleName.zip" ./dist/bundles/$bundleName/*
