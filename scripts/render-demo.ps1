$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$demoRoot = Join-Path $repoRoot "benchmarks\demo"
$slidesRoot = Join-Path $demoRoot "slides"
$workRoot = Join-Path $demoRoot "work"
$videoPath = Join-Path $demoRoot "ctxray-demo.mp4"
$gifPath = Join-Path $demoRoot "ctxray-demo.gif"
$posterPath = Join-Path $demoRoot "ctxray-demo-poster.png"
$concatPath = Join-Path $workRoot "concat.txt"
$ffmpeg = (Get-Command ffmpeg -ErrorAction Stop).Source
$font = "C\:/Windows/Fonts/segoeui.ttf"
$accentFont = "C\:/Windows/Fonts/segoeuib.ttf"

New-Item -ItemType Directory -Force -Path $workRoot | Out-Null

$slides = @(
    @{ File = "01.txt"; Duration = 6 },
    @{ File = "02.txt"; Duration = 7 },
    @{ File = "03.txt"; Duration = 7 },
    @{ File = "04.txt"; Duration = 7 },
    @{ File = "05.txt"; Duration = 7 },
    @{ File = "06.txt"; Duration = 7 },
    @{ File = "07.txt"; Duration = 7 }
)

$segments = @()
for ($index = 0; $index -lt $slides.Count; $index++) {
    $slide = $slides[$index]
    $slideNumber = ($index + 1).ToString("00")
    $textPath = (Join-Path $slidesRoot $slide.File).Replace("\", "/").Replace(":", "\:")
    $segmentPath = Join-Path $workRoot "$slideNumber.mp4"
    $fadeOut = $slide.Duration - 0.55
    $filter = "drawbox=x=0:y=0:w=iw:h=12:color=0x7C6CFF:t=fill," +
        "drawtext=fontfile='$accentFont':text='CTXRAY  /  LIVE EVIDENCE':fontcolor=0xAFA7FF:fontsize=22:x=64:y=50," +
        "drawtext=fontfile='$font':textfile='$textPath':expansion=none:fontcolor=white:fontsize=48:line_spacing=20:x=(w-text_w)/2:y=(h-text_h)/2," +
        "fade=t=in:st=0:d=0.55,fade=t=out:st=${fadeOut}:d=0.55"
    $arguments = @(
        "-y", "-hide_banner", "-loglevel", "error", "-f", "lavfi", "-i", "color=c=0x0B1020:s=1280x720:r=30:d=$($slide.Duration)",
        "-vf", $filter,
        "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
        $segmentPath
    )
    & $ffmpeg @arguments
    if ($LASTEXITCODE -ne 0) { throw "FFmpeg failed while rendering slide $slideNumber." }
    $segments += "file '$($segmentPath.Replace("\", "/"))'"
}

[System.IO.File]::WriteAllLines($concatPath, $segments)
& $ffmpeg -y -hide_banner -loglevel error -f concat -safe 0 -i $concatPath -c copy -movflags +faststart $videoPath
if ($LASTEXITCODE -ne 0) { throw "FFmpeg failed while assembling the MP4." }

$gifFilter = "fps=12,scale=960:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3"
& $ffmpeg -y -hide_banner -loglevel error -i $videoPath -filter_complex $gifFilter -loop 0 $gifPath
if ($LASTEXITCODE -ne 0) { throw "FFmpeg failed while rendering the GIF." }

& $ffmpeg -y -hide_banner -loglevel error -ss 00:00:30 -i $videoPath -frames:v 1 $posterPath
if ($LASTEXITCODE -ne 0) { throw "FFmpeg failed while rendering the poster." }

Write-Output "Rendered $videoPath"
Write-Output "Rendered $gifPath"
Write-Output "Rendered $posterPath"
