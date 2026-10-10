$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$taskNode = Get-Command node -ErrorAction SilentlyContinue
if ($taskNode) { $taskNodePath = $taskNode.Source } else {
    $taskNodePath = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
}
if (-not (Test-Path -LiteralPath $taskNodePath)) { throw 'Node.js 22 or later is needed to run this game.' }
Write-Host 'Starting Trivia Duel. Allow Windows Firewall access on private networks if prompted.'
Start-Process 'http://localhost:8080'
& $taskNodePath server.mjs
