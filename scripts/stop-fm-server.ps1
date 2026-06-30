param(
  [Parameter(Mandatory = $true)]
  [string]$ServerPath
)

$resolvedServerPath = (Resolve-Path -LiteralPath $ServerPath).Path

Get-CimInstance Win32_Process |
  Where-Object {
    $_.CommandLine -and
    $_.CommandLine.Contains($resolvedServerPath) -and
    $_.ProcessId -ne $PID
  } |
  ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
  }
