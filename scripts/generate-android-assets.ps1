Add-Type -AssemblyName System.Drawing

$resDir = "D:\goodman\android\app\src\main\res"
$sourcePath = "D:\goodman\public\pwa-512x512.png"

Write-Host "Source image: $sourcePath"
$src = [System.Drawing.Image]::FromFile($sourcePath)

function Resize-Image($source, $width, $height, $targetPath) {
    $bmp = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($source, 0, 0, $width, $height)
    $g.Dispose()
    
    $dir = [System.IO.Path]::GetDirectoryName($targetPath)
    if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force }
    $bmp.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Saved: $targetPath ($($width)x$($height))"
}

# Launcher Icon Sizes
$iconSizes = @{
    "mipmap-mdpi" = 48
    "mipmap-hdpi" = 72
    "mipmap-xhdpi" = 96
    "mipmap-xxhdpi" = 144
    "mipmap-xxxhdpi" = 192
}

foreach ($entry in $iconSizes.GetEnumerator()) {
    $folder = $entry.Key
    $size = $entry.Value
    
    $targetIcon = Join-Path $resDir "$folder\ic_launcher.png"
    $targetRound = Join-Path $resDir "$folder\ic_launcher_round.png"
    $targetFore = Join-Path $resDir "$folder\ic_launcher_foreground.png"
    
    Resize-Image $src $size $size $targetIcon
    Resize-Image $src $size $size $targetRound
    
    # Foreground is typically scaled with padding (108/48 ratio)
    $foreSize = [int][Math]::Round($size * (108.0 / 48.0))
    Resize-Image $src $foreSize $foreSize $targetFore
}

# Check existing splash dimensions
Get-ChildItem -Path $resDir -Filter "splash.png" -Recurse | ForEach-Object {
    $existing = [System.Drawing.Image]::FromFile($_.FullName)
    $w = $existing.Width
    $h = $existing.Height
    $existing.Dispose()
    Write-Host "Re-generating splash: $($_.FullName) ($w x $h)"
    
    # Generate centered logo splash on dark background #0f172a
    $splashBmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($splashBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    # Dark modern background #0f172a
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 15, 23, 42))
    $g.FillRectangle($brush, 0, 0, $w, $h)
    $brush.Dispose()
    
    # Draw centered icon (about 35% of the shortest side)
    $shortest = [Math]::Min($w, $h)
    $iconDim = [int][Math]::Round($shortest * 0.40)
    if ($iconDim -gt 512) { $iconDim = 512 }
    if ($iconDim -lt 48) { $iconDim = 48 }
    $x = [int][Math]::Round(($w - $iconDim) / 2)
    $y = [int][Math]::Round(($h - $iconDim) / 2)
    
    $g.DrawImage($src, $x, $y, $iconDim, $iconDim)
    $g.Dispose()
    
    $splashBmp.Save($_.FullName, [System.Drawing.Imaging.ImageFormat]::Png)
    $splashBmp.Dispose()
}

$src.Dispose()
Write-Host "All Android icons and splash screens successfully generated!"
