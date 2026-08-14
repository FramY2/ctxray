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
$videoPath = Join-Path $demoRoot "ctxwise-demo.mp4"
$squarePath = Join-Path $demoRoot "ctxwise-demo-square.mp4"
$gifPath = Join-Path $demoRoot "ctxwise-demo.gif"
$posterPath = Join-Path $demoRoot "ctxwise-demo-poster.png"

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
$transitionDuration = 0.56
$transitionName = "diagtr"
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
for ($index = 0; $index -lt $sceneImages.Count; $index++) {
    $filterParts += "[$index`:v]scale=1280:720:flags=lanczos,fps=$frameRate,format=yuv420p,setsar=1,setpts=PTS-STARTPTS[s$index]"
}

$currentLabel = "s0"
for ($index = 1; $index -lt $sceneImages.Count; $index++) {
    $offset = $index * ($sceneDuration - $transitionDuration)
    $outputLabel = "x$index"
    $offsetText = $offset.ToString([Globalization.CultureInfo]::InvariantCulture)
    $filterParts += "[$currentLabel][s$index]xfade=transition=$transitionName`:duration=$transitionDuration`:offset=$offsetText[$outputLabel]"
    $currentLabel = $outputLabel
}

$totalDuration = ($sceneImages.Count * $sceneDuration) - (($sceneImages.Count - 1) * $transitionDuration)
$fadeOutStart = ($totalDuration - 0.28).ToString([Globalization.CultureInfo]::InvariantCulture)
$filterParts += "[$currentLabel]fade=t=in:st=0:d=0.22,fade=t=out:st=$fadeOutStart`:d=0.28[video]"
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
