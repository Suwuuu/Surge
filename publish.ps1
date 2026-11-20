# publish.ps1 — one-shot publish of this folder to a GitHub repo
# Usage:
#   $env:GH_TOKEN="ghp_xxx"; .\publish.ps1 -Owner yourname -Repo recall-surge -Public
#
# Requires GitHub CLI (gh). Creates the repo if missing, substitutes
# __OWNER__/__REPO__ in the module, commits and pushes to main.

param(
  [Parameter(Mandatory=$true)][string]$Owner,
  [Parameter(Mandatory=$true)][string]$Repo,
  [string]$Branch = "main",
  [switch]$Public
)

$ErrorActionPreference = "Stop"
if (-not $env:GH_TOKEN) { throw "Set GH_TOKEN env var to a PAT with 'repo' scope." }

# sanity: gh available
gh --version | Out-Null

# substitute placeholders in the module
$modPath = Join-Path $PSScriptRoot "recall-pro.sgmodule"
(Get-Content -LiteralPath $modPath -Raw) `
  -replace "__OWNER__", $Owner `
  -replace "__REPO__",  $Repo | Set-Content -LiteralPath $modPath -NoNewline -Encoding utf8

# init git
Push-Location $PSScriptRoot
if (-not (Test-Path .git)) { git init | Out-Null }
git branch -M $Branch
git add -A
git -c user.name="$Owner" -c user.email="$Owner@users.noreply.github.com" commit -m "Add Recall Pro Surge module" | Out-Null

# create repo if absent (ignore error if exists)
$vis = if ($Public) { "--public" } else { "--private" }
try { gh repo create "$Owner/$Repo" $vis --source . --remote origin --push } catch {
  git remote remove origin 2>$null
  git remote add origin "https://github.com/$Owner/$Repo.git"
  git push -u origin $Branch
}
Pop-Location

Write-Host ""
Write-Host "Module URL:" -ForegroundColor Green
Write-Host "https://raw.githubusercontent.com/$Owner/$Repo/$Branch/recall-pro.sgmodule"
