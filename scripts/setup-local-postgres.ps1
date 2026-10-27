$ErrorActionPreference = "Stop"

function ConvertFrom-SecureInput([System.Security.SecureString]$Value) {
  $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Value)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
  }
}

$adminSecure = Read-Host "Local PostgreSQL administrator password (role postgres)" -AsSecureString
$appSecure = Read-Host "SpendSmart database password (at least 16 characters; use the existing role password if it exists)" -AsSecureString

try {
  [Environment]::SetEnvironmentVariable(
    "SPENDSMART_POSTGRES_ADMIN_PASSWORD",
    (ConvertFrom-SecureInput $adminSecure),
    "Process"
  )
  [Environment]::SetEnvironmentVariable(
    "SPENDSMART_APP_PASSWORD",
    (ConvertFrom-SecureInput $appSecure),
    "Process"
  )

  Push-Location (Split-Path -Parent $PSScriptRoot)
  try {
    node (Join-Path $PSScriptRoot "setup-local-postgres.mjs")
    if ($LASTEXITCODE -ne 0) {
      throw "PostgreSQL setup failed. Review the error above and retry."
    }
  } finally {
    Pop-Location
  }
} finally {
  [Environment]::SetEnvironmentVariable("SPENDSMART_POSTGRES_ADMIN_PASSWORD", $null, "Process")
  [Environment]::SetEnvironmentVariable("SPENDSMART_APP_PASSWORD", $null, "Process")
  $adminSecure.Dispose()
  $appSecure.Dispose()
}
