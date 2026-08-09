# Demo production

The short product demo is rendered from six reviewable SVG scenes. No generated
claim or private screen recording is used.

## Outputs

- `ctxray-demo.mp4`: 1280×720, 60 fps, exactly 20 seconds.
- `ctxray-demo.gif`: bandwidth-conscious README preview; click through to the
  smoother 60 fps MP4.
- `ctxray-demo-poster.png`: repository and release poster.
- `ctxray-demo-square.mp4`: square social cut with a blurred branded surround.

## Render on Windows

Install FFmpeg and ImageMagick, then run:

```powershell
npm run demo:render:windows
```

If either executable is outside `PATH`, pass it directly:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/render-demo.ps1 `
  -FfmpegPath C:\path\to\ffmpeg.exe `
  -MagickPath C:\path\to\magick.exe
```

The renderer rasterizes the SVG scenes and keeps every scene stationary for
readability. Motion is confined to brand-aligned diagonal transitions and soft
opening/closing fades. It encodes the MP4 with H.264 at 60 fps and derives the
other formats. Temporary PNGs stay under the ignored
`benchmarks/demo/work/` directory.
