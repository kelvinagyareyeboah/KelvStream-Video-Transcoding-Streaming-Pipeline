

### 2. Preimplements a bespoke luxury UI:
- **Color Scheme**: Deep with ultraviolet (`#7c3aed`) and pink neon (`#c084fc`) gradients.
- **Glassmorphism**: Translucent navbars and sidebars with modern backing filters (`backdrop-filter: blur(20px)`).
- **Responsive Layout**: Designed for mobile and desktop d models instead of strict framework boxes.
- **Micro-animations**: Interactive elements animate on hover, including play button overlay triggers, card translations, and pulsating pipeline loaders.

---

## 📂 Project Structure

```text
youtube-clone-main/
├── client/                 # React & TypeScript Frontend (Vite)
│   ├── src/
│   │   ├── components/     # UI Components (Navbar, Feed, VideoDetail, etc.)
│   │   └── utils/          # API services
│   └── public/             # Icons and static web assets
└── server/                 # Node.js + Express Backend
    ├── uploads/            # Temporary storage for raw video uploads
    └── transcoded/         # Transcoded HLS manifest playlists and chunks
```

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js** (v16+ recommended)
- **Yarn** package manager
- **FFmpeg** installed on your system PATH.
  - *Windows*: Run `winget install Gyan.FFmpeg` or download from Gyan.dev and add the `bin` directory to your System Environment variables.
  - *Mac*: `brew install ffmpeg`

---

### Step 1: Running the Backend
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install server dependencies:
   ```bash
   npm install
   ```
3. Start the transcoding server:
   ```bash
   npm start
   ```
   *The server runs at `http://localhost:5000` where it hosts an automated **Transcoding Control Panel** to test raw video submissions.*

---

### Step 2: Running the Frontend Client
1. Navigate to the client folder:
   ```bash
   cd client
   ```
2. Install client packages using Yarn (to ensure lockfile integrity):
   ```bash
   yarn install
   ```
3. Add your RapidAPI key to `.env` inside `client/`:
   ```env
   VITE_REACT_APP_RAPID_API_KEY=b1f98c5952msh6763552ad8b8870p121a5bjsn03ec77f54c00
   ```
4. Start the frontend developer build:
   ```bash
   yarn dev
   ```
5. Open your browser and navigate to `http://localhost:5173`.

---

## 🛠️ Verification Steps
1. Open the local control panel at `http://localhost:5000`.
2. Select any `.mp4` video from your computer and upload it.
3. Once transcoding completes, open `http://localhost:5173`.
4. Your uploaded video will automatically appear at the top of the feed tagged with a `⚡ Local HLS` badge.
5. Click on the video to watch it play seamlessly, leveraging adaptive streaming segments directly from your local disk.
