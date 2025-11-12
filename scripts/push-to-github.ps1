<#
PowerShell helper: push-to-github.ps1
Usage (from project root):
  .\scripts\push-to-github.ps1

This script:
 - Verifies Git is installed
 - Initializes a new repo on branch 'main' if .git is missing
 - Adds a remote named 'origin' (overwrites existing origin)
 - Stages all files and creates an initial commit if none exists
 - Pushes to the remote (you may be prompted for credentials)

Adjust $RemoteUrl or pass parameters to the script if needed.
#>

[CmdletBinding()]
param(
    [string]$RemoteUrl = "https://github.com/nasran-thaivis/Profile.git",
    [string]$Branch = "main",
    [string]$CommitMessage = "initial commit"
)

function Fail($msg){ Write-Error $msg; exit 1 }

# Ensure we're in the repo root (user should run from project root)
$repoPath = Get-Location
Write-Host "Working directory: $repoPath"

# Check git
try {
    & git --version > $null 2>&1
} catch {
    Fail "Git not found. Install Git for Windows: https://git-scm.com/download/win and re-run this script."
}

# Initialize repo if it doesn't exist
if (-not (Test-Path -Path .git)) {
    Write-Host "Initializing git repository on branch '$Branch'..."
    & git init -b $Branch
} else {
    Write-Host "Found existing .git — skipping init."
}

# Ensure remote
# Remove existing origin to avoid duplicate remote errors, then add
try { & git remote remove origin > $null 2>&1 } catch {}
Write-Host "Adding remote origin: $RemoteUrl"
& git remote add origin $RemoteUrl

# Stage all files
Write-Host "Staging files..."
& git add .

# Commit: if no HEAD yet, create initial commit; otherwise try to commit staged changes
$hasHead = $false
try {
    & git rev-parse --verify HEAD > $null 2>&1
    $hasHead = $true
} catch {}

if (-not $hasHead) {
    Write-Host "Creating initial commit..."
    & git commit -m $CommitMessage
} else {
    Write-Host "Repository already has commits. Attempting to commit staged changes (if any)."
    try {
        & git commit -m $CommitMessage > $null 2>&1
        Write-Host "Created commit with staged changes."
    } catch {
        Write-Host "No staged changes to commit."
    }
}

# Ensure branch name
& git branch -M $Branch

Write-Host "Pushing to remote origin/$Branch... (you may be prompted for credentials)"
try {
    & git push -u origin $Branch
    Write-Host "Push finished."
} catch {
    Write-Error "Push failed. If authentication is required, ensure you have credentials (PAT or SSH) configured."
    exit 1
}

Write-Host "Done."
