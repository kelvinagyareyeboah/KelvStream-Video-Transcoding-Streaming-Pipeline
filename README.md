8         pla#
| Dependen
winget install Gyaf### Step 1 — Start the Transcoding Serv
npmThe server starts at **`http://localhost:5000`** and exposes:
- `POST /upload` — accepts `.mp4`, transcodes to HLS via FFmpeg
- `GET /transcoded/:id/master.m3u8` — serves master manifest
- `GET /transcoded/:i
- Control Panel UI — upload int testing

---

### Step 2 — Configure and Start the Frontend

```bash
cd client
yarn install
```

Create a `.env` file in the `client/` directory:

```env
# client/.env
VITE_REACT_APP_RAPID_API_KEY=your_rapidapi_key_here
```

> **Get a key:** Sign up at [rapidapi.com](https://rapidapi.com) and subscribe to the **YouTube v3** API (free tier available).

```bash
yarn dev
```

Open **`http://localhost:5173`** in your browser.

---

## Usage Walkthrough

### Uploading and Streaming a Local Video

1. Open the Control Panel at `http://localhost:5000`.
2. Click **Choose File**, select any `.mp4` from your machine, and hit **Upload**.
3. The server spawns FFmpeg and transcodes the video. Watch the terminal — you'll see segment generation in real time.
4. Navigate to `http://localhost:5173`. Your video appears at the top of the feed with a `⚡ Local HLS` badge.
5. Click to play. ReactPlayer fetches `master.m3u8` and begins adaptive streaming. Throttle your network in DevTools → Network to observe live quality switching between 720p and 360p.

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
