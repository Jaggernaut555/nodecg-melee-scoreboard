export default
{
    "branches": [
        "main"
    ],
    "plugins": [
        "@semantic-release/commit-analyzer",
        "@semantic-release/release-notes-generator",
        [
            "@semantic-release/npm",
            {
                "npmPublish": false
            }
        ],
        [
            "@semantic-release/exec",
            {
                "publishCmd": `pwsh prepare-nodecg.ps1 -version \${nextRelease.version} -bundleName ${process.env.REPO_NAME}`,
                "shell": "pwsh",
                "execCwd": "scripts"
            }
        ],
        [
            "@semantic-release/github",
            {
                "assets": [
                    "*.zip"
                ]
            }
        ],
        [
            "@semantic-release/git",
            {
                "assets": [
                    "package.json",
                    "package-lock.json"
                ]
            }
        ]
    ]
}
