select any `. from
video appearsthe aHLS`our network in rve 0p and 360p.

### Browsing YouTube Content

The main feed is populated by the YouTube Data API v3 via RapidAPI. Videos load with thumbnails, titles, channel names, and view counts — identical to the remote video player experience.

---

## Design System

KelvStream's UI is built on a custom design token system — no component framework.

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#0a0a0f` | Deep obsidian page background |
| `--accent-violet` | `#7c3aed` | Primary CTA, gradients, borders |
| `--accent-pink` | `#c084fc` | Highlights, hover states, neon glow |
| `--glass-bg` | `rgba(255,255,255,0.05)` | Glassmorphism card backgrounds |
| `--blur` | `backdrop-filter: blur(20px)` | Navbar and sidebar frosted glass |

**Micro-interactions:**
- Video card hover → `translateY(-4px)` + violet border glow
- Play overlay → opacity transition with radial gradient mask
- Upload in progress → pulsating pipeline loader animation

---

## API Reference

### `POST /upload`

Accepts a multipart form upload and initiates FFmpeg transcoding.

**Request**
```
Content-Type: multipart/form-data
Body: file (*.mp4)
```

**Response**
```json
{
  "id": "vid_1718000000000",
  "status": "transcoding",
  "manifest": "/transcoded/vid_1718000000000/master.m3u8"
}
```

### `GET /transcoded/:id/master.m3u8`

Returns the HLS master manifest for the given video ID.

```m3u8
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720
720p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
360p.m3u8
```

---

## Contributing

```bash
# Fork → clone → branch
git checkout -b feat/your-feature

# Make changes, then
git commit -m "feat: describe your change"
git push origin feat/your-feature
# Open a Pull Request
```

---

## License

MIT — see [`LICENSE`](./LICENSE) for details.

---

<div align="center">

Built with precision. Streamed with purpose.

**KelvStream** · FAANG-Grade Streaming Infrastructure

</div>
