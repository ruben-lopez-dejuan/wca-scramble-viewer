# Genera dist/wca-scramble-viewer-<version>.zip listo para subir a la Chrome Web Store.
# Uso: powershell -ExecutionPolicy Bypass -File package.ps1
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$src = Join-Path $root 'wca-scramble-viewer'
$manifest = Get-Content (Join-Path $src 'manifest.json') -Raw | ConvertFrom-Json
$dist = Join-Path $root 'dist'
New-Item -ItemType Directory -Force $dist | Out-Null
$zipPath = Join-Path $dist ("wca-scramble-viewer-" + $manifest.version + ".zip")
if (Test-Path $zipPath) { Remove-Item $zipPath -Confirm:$false }

# Se escribe el zip a mano para que las rutas usen "/" (Compress-Archive de
# PowerShell 5.1 usa "\" y la Chrome Web Store no lo acepta bien).
$zip = [System.IO.Compression.ZipFile]::Open($zipPath, 'Create')
try {
  Get-ChildItem $src -Recurse -File |
    Where-Object { $_.Extension -notin '.pem', '.crx', '.md' } |
    ForEach-Object {
      $rel = $_.FullName.Substring($src.Length + 1).Replace('\', '/')
      [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $rel) | Out-Null
      Write-Host "  + $rel"
    }
} finally {
  $zip.Dispose()
}
Write-Host "Creado: $zipPath"
