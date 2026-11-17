$ErrorActionPreference = "Stop"

$projectRoot = $PSScriptRoot
$envFiles = @(
    (Join-Path $projectRoot "backend\.env"),
    (Join-Path $projectRoot ".env")
)

# Si el proyecto ya define una contraseña directa en application*.properties,
# no permitas que un valor de SPRING_DATASOURCE_PASSWORD en .env la sustituya.
$localDatasourcePasswordConfigured = $false
$resourcesPath = Join-Path $projectRoot "backend\src\main\resources"
if (Test-Path -LiteralPath $resourcesPath -PathType Container) {
    foreach ($propertiesFile in Get-ChildItem -LiteralPath $resourcesPath -Filter "application*.properties" -File) {
        foreach ($propertyLine in [System.IO.File]::ReadAllLines($propertiesFile.FullName, [System.Text.Encoding]::UTF8)) {
            if ($propertyLine -match '^\s*spring\.datasource\.password\s*[:=]\s*(.*?)\s*(?:#.*)?$') {
                $propertyValue = $Matches[1].Trim()
                if (-not [string]::IsNullOrWhiteSpace($propertyValue) -and
                    $propertyValue -notmatch '^\$\{[^}]+\}$') {
                    $localDatasourcePasswordConfigured = $true
                    break
                }
            }
        }
        if ($localDatasourcePasswordConfigured) {
            break
        }
    }
}
if ($localDatasourcePasswordConfigured) {
    [Environment]::SetEnvironmentVariable("SPRING_DATASOURCE_PASSWORD", $null, "Process")
}

foreach ($envFile in $envFiles) {
    if (-not (Test-Path -LiteralPath $envFile -PathType Leaf)) {
        continue
    }

    [System.IO.File]::ReadAllLines($envFile, [System.Text.Encoding]::UTF8) | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith("#")) {
            return
        }

        if ($line -match '^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$') {
            $name = $Matches[1]
            $value = $Matches[2].Trim()
            if ($value.Length -ge 2 -and
                (($value.StartsWith('"') -and $value.EndsWith('"')) -or
                 ($value.StartsWith("'") -and $value.EndsWith("'")))) {
                $value = $value.Substring(1, $value.Length - 2)
            }
            $value = $value.Trim()

            $passwordComesFromProperties =
                $name -eq "SPRING_DATASOURCE_PASSWORD" -and $localDatasourcePasswordConfigured
            if (-not $passwordComesFromProperties -and
                [string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($name, "Process"))) {
                [Environment]::SetEnvironmentVariable($name, $value, "Process")
            }
        }
    }
}

$missing = @()
if ([string]::IsNullOrWhiteSpace($env:SUBLI_ADMIN_USERNAME)) {
    $missing += "SUBLI_ADMIN_USERNAME"
}
if ([string]::IsNullOrWhiteSpace($env:SUBLI_ADMIN_PASSWORD)) {
    $missing += "SUBLI_ADMIN_PASSWORD"
} elseif ($env:SUBLI_ADMIN_PASSWORD.Length -lt 16) {
    Write-Error "SUBLI_ADMIN_PASSWORD debe tener al menos 16 caracteres. Configúrala en backend/.env o como variable de entorno."
}

if ($missing.Count -gt 0) {
    Write-Error ("Faltan variables obligatorias: {0}. Configúralas en backend/.env o como variables de entorno. Puedes partir de backend/.env.example." -f ($missing -join ", "))
}

$backendPath = Join-Path $projectRoot "backend"
Push-Location -LiteralPath $backendPath
try {
    & .\mvnw.cmd spring-boot:run
    exit $LASTEXITCODE
} finally {
    Pop-Location
}
