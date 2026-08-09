[CmdletBinding()]
param(
    [string]$FfmpegPath,
    [string]$MagickPath
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$demoRoot = Join-Path $repoRoot "benchmarks\demo"
$scenesRoot = Join-Path $demoRoot "scenes"
$workRoot = Join-Path $demoRoot "work"
$videoPath = Join-Path $demoRoot "ctxray-demo.mp4"
$squarePath = Join-Path $demoRoot "ctxray-demo-square.mp4"
$gifPath = Join-Path $demoRoot "ctxray-demo.gif"
$posterPath = Join-Path $demoRoot "ctxray-demo-poster.png"

function Resolve-Ffmpeg {
    param([string]$RequestedPath)

    if ($RequestedPath) {
        return (Resolve-Path -LiteralPath $RequestedPath).Path
    }
    $command = Get-Command ffmpeg -ErrorAction SilentlyContinue
    if ($command) {
        return $command.Source
    }
    $wingetRoot = Join-Path $env:LOCALAPPDATA "Microsoft\WinGet\Packages"
    if (Test-Path -LiteralPath $wingetRoot) {
        $candidate = Get-ChildItem -LiteralPath $wingetRoot -Recurse -Filter ffmpeg.exe -File -ErrorAction SilentlyContinue |
            Select-Object -First 1
        if ($candidate) {
            return $candidate.FullName
        }
    }
    throw "FFmpeg was not found. Install it or pass -FfmpegPath."
}

function Resolve-Magick {
    param([string]$RequestedPath)

    if ($RequestedPath) {
        return (Resolve-Path -LiteralPath $RequestedPath).Path
    }
    $command = Get-Command magick -ErrorAction SilentlyContinue
    if ($command) {
        return $command.Source
    }
    throw "ImageMagick was not found. Install it or pass -MagickPath."
}

$ffmpeg = Resolve-Ffmpeg -RequestedPath $FfmpegPath
$magick = Resolve-Magick -RequestedPath $MagickPath
$scenePaths = Get-ChildItem -LiteralPath $scenesRoot -Filter "*.svg" -File |
    Sort-Object Name |
    Select-Object -ExpandProperty FullName
if ($scenePaths.Count -ne 6) {
    throw "Expected 6 SVG scenes under $scenesRoot, found $($scenePaths.Count)."
}

New-Item -ItemType Directory -Force -Path $workRoot | Out-Null
$sceneImages = @()
foreach ($scenePath in $scenePaths) {
    $sceneImage = Join-Path $workRoot "$([System.IO.Path]::GetFileNameWithoutExtension($scenePath)).png"
    & $magick -background none $scenePath -resize "1280x720!" -strip $sceneImage
    if ($LASTEXITCODE -ne 0) {
        throw "ImageMagick failed while rasterizing $scenePath."
    }
    $sceneImages += $sceneImage
}

$frameRate = 60
$sceneDuration = 3.8
$transitionDuration = 0.64
$motionProfiles = @(
    @{ Zoom = 0.026; PanX = 0.14; PanY = -0.05 },
    @{ Zoom = 0.022; PanX = -0.16; PanY = 0.04 },
    @{ Zoom = 0.024; PanX = 0.12; PanY = -0.08 },
    @{ Zoom = 0.021; PanX = -0.12; PanY = 0.07 },
    @{ Zoom = 0.020; PanX = 0.10; PanY = -0.05 },
    @{ Zoom = 0.025; PanX = 0.00; PanY = -0.04 }
)
$transitionProfiles = @("fadeslow", "smoothleft", "fade", "smoothup", "fadeslow")
$renderArguments = @("-y", "-hide_banner", "-loglevel", "error")
foreach ($sceneImage in $sceneImages) {
    $renderArguments += @(
        "-loop", "1",
        "-framerate", $frameRate,
        "-t", $sceneDuration.ToString([Globalization.CultureInfo]::InvariantCulture),
        "-i", $sceneImage
    )
}

$filterParts = @()
$motionFrameCount = [math]::Round($sceneDuration * $frameRate) - 1
$ease = "(0.5-0.5*cos(PI*min(on,$motionFrameCount)/$motionFrameCount))"
for ($index = 0; $index -lt $sceneImages.Count; $index++) {
    $profile = $motionProfiles[$index]
    $zoom = $profile.Zoom.ToString([Globalization.CultureInfo]::InvariantCulture)
    $panX = $profile.PanX.ToString([Globalization.CultureInfo]::InvariantCulture)
    $panY = $profile.PanY.ToString([Globalization.CultureInfo]::InvariantCulture)
    $filterParts += "[$index`:v]scale=1408:792:flags=lanczos,zoompan=z='1+$zoom*$ease':x='(iw-iw/zoom)/2+$panX*(iw-iw/zoom)*$ease':y='(ih-ih/zoom)/2+$panY*(ih-ih/zoom)*$ease':d=1:s=1280x720:fps=$frameRate,eq=saturation=1.015:contrast=1.008,format=yuv420p,setsar=1,setpts=PTS-STARTPTS[s$index]"
}

$currentLabel = "s0"
for ($index = 1; $index -lt $sceneImages.Count; $index++) {
    $offset = $index * ($sceneDuration - $transitionDuration)
    $outputLabel = "x$index"
    $offsetText = $offset.ToString([Globalization.CultureInfo]::InvariantCulture)
    $transitionName = $transitionProfiles[$index - 1]
    $filterParts += "[$currentLabel][s$index]xfade=transition=$transitionName`:duration=$transitionDuration`:offset=$offsetText[$outputLabel]"
    $currentLabel = $outputLabel
}

$totalDuration = ($sceneImages.Count * $sceneDuration) - (($sceneImages.Count - 1) * $transitionDuration)
$fadeOutStart = ($totalDuration - 0.42).ToString([Globalization.CultureInfo]::InvariantCulture)
$filterParts += "[$currentLabel]fade=t=in:st=0:d=0.32,fade=t=out:st=$fadeOutStart`:d=0.42[video]"
$filterGraph = $filterParts -join ";"
$renderArguments += @(
    "-filter_complex", $filterGraph,
    "-map", "[video]",
    "-t", $totalDuration.ToString([Globalization.CultureInfo]::InvariantCulture),
    "-c:v", "libx264",
    "-preset", "medium",
    "-crf", "17",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    $videoPath
)

& $ffmpeg @renderArguments
if ($LASTEXITCODE -ne 0) {
    throw "FFmpeg failed while rendering the MP4."
}

$gifFilter = "fps=6,scale=640:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=64:stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle"
& $ffmpeg -y -hide_banner -loglevel error -i $videoPath -filter_complex $gifFilter -loop 0 $gifPath
if ($LASTEXITCODE -ne 0) {
    throw "FFmpeg failed while rendering the GIF."
}

& $ffmpeg -y -hide_banner -loglevel error -ss 00:00:00.8 -i $videoPath -frames:v 1 $posterPath
if ($LASTEXITCODE -ne 0) {
    throw "FFmpeg failed while rendering the poster."
}

$squareFilter = "split[main][copy];[copy]scale=1080:1080:force_original_aspect_ratio=increase,crop=1080:1080,gblur=sigma=34[bg];[main]scale=1080:-2:flags=lanczos[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,format=yuv420p"
& $ffmpeg -y -hide_banner -loglevel error -i $videoPath -vf $squareFilter -c:v libx264 -preset medium -crf 19 -movflags +faststart -an $squarePath
if ($LASTEXITCODE -ne 0) {
    throw "FFmpeg failed while rendering the square social cut."
}

Write-Output "Rendered $videoPath ($([math]::Round($totalDuration, 2)) seconds)"
Write-Output "Rendered $squarePath"
Write-Output "Rendered $gifPath"
Write-Output "Rendered $posterPath"
