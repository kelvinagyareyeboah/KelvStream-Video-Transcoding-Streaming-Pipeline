<div align="center">

# ⚡ KelvStream

### FAANG-Grade Adaptive Bitrate Streaming Platform

*Production-quality HLS transcoding pipeline · Luxury dark UI · YouTube Data API v3 integration*

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Node.js-16+-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![FFmpeg](https://img.shields.io/badge/FFmpeg-HLS-007808?style=flat-square&logo=ffmpeg)](https://ffmpeg.org)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express)](https://expressjs.com)

</div>

---

## Overview

KelvStream is a full-stack, production-inspired video streaming platform that replicates the core infrastructure behind services like YouTube and Netflix. It features a **live FFmpeg-powered HLS transcoding pipeline**, adaptive bitrate delivery, and a bespoke luxury UI — built to demonstrate mastery of the complete client-to-server video delivery lifecycle.

> **Not a tutorial clone.** KelvStream implements real streaming infrastructure — multiplexed encoding, segmented manifests, and client-side ABR switching — backed by a live Express transcoding server.


![KelvStream Banner](banner.png)

---

## Table of Contents

- [Architecture](#architecture)
- [Feature Highlights](#feature-highlights)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage Walkthrough](#usage-walkthrough)
- [Design System](#design-system)
- [API Reference](#api-reference)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React + Vite)                    │
│                                                                 │
│   ┌──────────┐    ┌──────────────┐    ┌───────────────────┐    │
│   │  YouTube  │    │  ReactPlayer  │    │  Local HLS Feed   │    │
│   │  API Feed │    │  (ABR Client) │    │  (⚡ Badge)        │    │
│   └──────────┘    └──────┬───────┘    └─────────┬─────────┘    │
│                          │                       │              │
└──────────────────────────┼───────────────────────┼─────────────┘
                           │ HTTP                  │ HLS Segments
┌──────────────────────────┼───────────────────────┼─────────────┐
│                   SERVER (Node.js + Express)      │             │
│                          │                        │             │
│   ┌──────────────────────▼────────────────────────▼──────────┐ │
│   │                  /upload endpoint                         │ │
│   │           Raw .mp4 → FFmpeg child process                 │ │
│   │                        │                                  │ │
│   │          ┌─────────────┴──────────────┐                   │ │
│   │          ▼                            ▼                   │ │
│   │   720p HD Profile              360p SD Profile            │ │
│   │   (high bitrate)               (low bandwidth)            │ │
│   │          │                            │                   │ │
│   │          └─────────────┬──────────────┘                   │ │
│   │                        ▼                                  │ │
│   │              master.m3u8 manifest                         │ │
│   │           Served from /transcoded/                        │ │
│   └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### How ABR Works in KelvStream

1. A raw `.mp4` is uploaded to the Express server via the local Control Panel.
2. FFmpeg spawns asynchronously and encodes **two renditions** in parallel — 720p HD and 360p SD — splitting each into 6-second `.ts` segments.
3. A **master manifest** (`master.m3u8`) is generated, referencing both rendition playlists.
4. The React frontend detects the new upload and renders it with a `⚡ Local HLS` badge.
5. ReactPlayer fetches the master manifest and begins streaming. As network conditions change, it **automatically switches** between the 720p and 360p playlists — zero buffering, seamless quality shifts.

---

## Feature Highlights

| Feature | Description |
|---|---|
| **HLS Transcoding Pipeline** | Server-side FFmpeg encodes uploads into segmented HLS streams in real time |
| **Adaptive Bitrate (ABR)** | Client automatically switches quality tiers based on live bandwidth |
| **Dual Quality Renditions** | 720p HD and 360p SD profiles with 6-second `.ts` segments |
| **Master M3U8 Manifest** | Single entry point enabling standards-compliant ABR switching |
| **YouTube API Integration** | Live feed of YouTube content via RapidAPI's YouTube Data v3 wrapper |
| **Local HLS Discovery** | Frontend auto-detects and surfaces locally transcoded videos |
| **Transcoding Control Panel** | Built-in Express UI at `localhost:5000` for direct upload testing |
| **Luxury Dark UI** | Glassmorphism, violet gradients, micro-animations, mobile-responsive |

---

## Tech Stack

**Frontend**
- [React 18](https://react.dev) + [TypeScript](https://typescriptlang.org) — component architecture and type safety
- [Vite](https://vitejs.dev) — lightning-fast dev server and HMR
- [ReactPlayer](https://github.com/cookpete/react-player) — HLS-compatible video playback with ABR support
- Custom CSS Design System — glassmorphism, CSS variables, responsive grid/flex

**Backend**
- [Node.js](https://nodejs.org) + [Express](https://expressjs.com) — upload handling and static HLS segment serving
- [FFmpeg](https://ffmpeg.org) — video transcoding and HLS segmentation via child process
- [Multer](https://github.com/expressjs/multer) — multipart file upload middleware

**External APIs**
- [RapidAPI YouTube Data v3](https://rapidapi.com) — remote video feed

---

## Project Structure

```
kelvstream/
├── client/                         # React + TypeScript Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar/             # Glassmorphism top navigation
│   │   │   ├── Feed/               # Main video grid + local HLS discovery
│   │   │   ├── VideoDetail/        # ReactPlayer + ABR playback view
│   │   │   ├── VideoCard/          # Thumbnail cards with hover animations
│   │   │   └── Sidebar/            # Category navigation
│   │   └── utils/
│   │       └── api.js              # YouTube API service layer
│   ├── public/                     # Static assets and icons
│   ├── .env                        # RapidAPI key (gitignored)
│   └── vite.config.ts
│
└── server/                         # Node.js + Express Backend
    ├── index.js                    # Server entry point + transcoding logic
    ├── uploads/                    # Temporary raw video storage (gitignored)
    └── transcoded/                 # HLS output: manifests + .ts segments
        └── <video-id>/
            ├── master.m3u8         # ABR entry point
            ├── 720p.m3u8           # HD rendition playlist
            ├── 360p.m3u8           # SD rendition playlist
            └── *.ts                # 6-second media segments
```

---

## Getting Started

### Prerequisites

Ensure the following are installed and available on your `PATH`:

| Dependency | Version | Install |
|---|---|---|
| Node.js | v16+ | [nodejs.org](https://nodejs.org) |
| Yarn | Latest | `npm install -g yarn` |
| FFmpeg | Any recent | See below |

**Installing FFmpeg:**

```bash
# macOS
brew install ffmpeg

# Windows (winget)
winget install Gyan.FFmpeg
# Then add C:\ffmpeg\bin to System Environment Variables → PATH

# Ubuntu / Debian
sudo apt update && sudo apt install ffmpeg

# Verify installation
ffmpeg -version
```

---

### Step 1 — Start the Transcoding Server

```bash
cd server
npm install
npm start
```

The server starts at **`http://localhost:5000`** and exposes:
- `POST /upload` — accepts `.mp4`, transcodes to HLS via FFmpeg
- `GET /transcoded/:id/master.m3u8` — serves master manifest
- `GET /transcoded/:id/*.ts` — serves media segments
- Control Panel UI — upload interface for direct testing

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
