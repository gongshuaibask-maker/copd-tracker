# COPD Icon Downloader - Extracts canvas from generate-icons.html and saves as PNG
param(
    [string]$OutDir = "D:\copdAPP\assets\images"
)

# This script is a helper - the actual icon generation is done via:
# 1. Open assets/images/generate-icons.html in a browser
# 2. Click the download buttons
# 3. Alternatively, use the built-in browser canvas export

Write-Host "=========================================" -ForegroundColor Green
Write-Host "  COPD App Icon Generator Helper" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "To generate icons:" -ForegroundColor Yellow
Write-Host "  1. Open this file in a browser:" -ForegroundColor White
Write-Host "     file:///D:/copdAPP/assets/images/generate-icons.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "  2. Click 'Download 1024x1024 (App Store)'" -ForegroundColor White
Write-Host "  3. Click 'Download 512x512 (Google Play)'" -ForegroundColor White
Write-Host ""
Write-Host "  4. Move downloaded files to:" -ForegroundColor White
Write-Host "     D:\copdAPP\assets\images\icon.png (renamed from icon-1024.png)" -ForegroundColor Cyan
Write-Host ""

# Check if icons already exist
$sizes = @(48, 96, 180, 512, 1024)
foreach ($size in $sizes) {
    $path = Join-Path $OutDir "icon-$size.png"
    if (Test-Path $path) {
        $img = [System.Drawing.Image]::FromFile($path)
        Write-Host "  [OK] icon-$size.png ($($img.Width)x$($img.Height))" -ForegroundColor Green
        $img.Dispose()
    } else {
        Write-Host "  [--] icon-$size.png (not found)" -ForegroundColor Gray
    }
}

# Check main icon
$mainIcon = Join-Path $OutDir "icon.png"
if (Test-Path $mainIcon) {
    Write-Host "  [OK] icon.png (main app icon)" -ForegroundColor Green
} else {
    Write-Host "  [--] icon.png (not found - will be generated)" -ForegroundColor Gray
}
