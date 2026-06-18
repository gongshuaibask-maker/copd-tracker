# Node.js 安装脚本
$msiPath = "$env:TEMP\nodejs-installer.msi"
$nodeUrl = "https://nodejs.org/dist/v24.16.0/node-v24.16.0-x64.msi"

Write-Host "Downloading Node.js v24.16.0..."
try {
    Invoke-WebRequest -Uri $nodeUrl -OutFile $msiPath -UseBasicParsing -TimeoutSec 120
} catch {
    Write-Host "Download failed: $_"
    exit 1
}

if (-not (Test-Path $msiPath)) {
    Write-Host "MSI file not found"
    exit 1
}

Write-Host "Downloaded: $((Get-Item $msiPath).Length) bytes"
Write-Host "Installing (this may take a minute)..."
Start-Process msiexec.exe -ArgumentList "/i `"$msiPath`" /quiet /norestart" -Wait -NoNewWindow

Write-Host "Cleaning up..."
Remove-Item $msiPath -Force -ErrorAction SilentlyContinue

# Verify
$nodeExe = "C:\Program Files\nodejs\node.exe"
if (Test-Path $nodeExe) {
    $version = & $nodeExe --version
    Write-Host "SUCCESS: Node.js $version installed"
} else {
    Write-Host "WARNING: Install may have succeeded but node.exe not at expected path"
    Write-Host "Try opening a NEW command prompt and run: node --version"
}
