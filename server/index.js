const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;
const BACKEND_URL = process.env.BACKEND_URL || process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({
  origin: CLIENT_URL,
  methods: ['GET', 'POST']
}));

app.use(express.json());

// Root endpoint — KelvStream control panel UI
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>KelvStream — Transcoder</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg-primary:    #0a0a0f;
      --bg-secondary:  #111118;
      --bg-card:       #16161f;
      --bg-elevated:   #1e1e2e;
      --bg-hover:      #252535;

      --purple:        #7c3aed;
      --purple-light:  #8b5cf6;
      --purple-glow:   #a78bfa;
      --violet:        #6d28d9;
      --pink:          #c084fc;

      --text-primary:  #f1f0ff;
      --text-secondary:#9d9dba;
      --text-muted:    #5c5c7a;

      --border:        #2a2a3e;
      --border-light:  #3a3a52;

      --grad-hero:     linear-gradient(135deg, #7c3aed 0%, #c084fc 50%, #6d28d9 100%);
      --radius-sm:     8px;
      --radius-md:     12px;
      --radius-lg:     16px;
      --radius-xl:     24px;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html { scroll-behavior: smooth; }

    body {
      font-family: 'DM Sans', sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, var(--purple), var(--violet));
      border-radius: 10px;
    }
    ::-webkit-scrollbar-track { background: transparent; }

    /* ── NAVBAR ── */
    .navbar {
      position: sticky;
      top: 0;
      z-index: 100;
      height: 68px;
      background: rgba(10, 10, 15, 0.88);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
    }

    .brand-icon {
      width: 38px;
      height: 38px;
      background: var(--grad-hero);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }

    .brand-name {
      font-family: 'Syne', sans-serif;
      font-size: 1.5rem;
      font-weight: 800;
      background: var(--grad-hero);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -0.5px;
    }

    .nav-badge {
      font-size: 0.72rem;
      font-weight: 500;
      color: var(--text-muted);
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      padding: 4px 10px;
      border-radius: 20px;
      letter-spacing: 0.3px;
    }

    /* ── LAYOUT ── */
    .page {
      max-width: 1000px;
      margin: 0 auto;
      padding: 48px 24px 80px;
      display: flex;
      flex-direction: column;
      gap: 48px;
    }

    /* ── SECTION HEADERS ── */
    .section-label {
      font-family: 'Syne', sans-serif;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: var(--purple-glow);
      margin-bottom: 12px;
    }

    .section-title {
      font-family: 'Syne', sans-serif;
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1.2;
      letter-spacing: -0.5px;
      margin-bottom: 6px;
    }

    .section-sub {
      font-size: 0.9rem;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    /* ── UPLOAD CARD ── */
    .upload-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .upload-card-inner {
      padding: 36px 40px;
    }

    .form-row {
      margin-bottom: 24px;
    }

    .form-label {
      display: block;
      font-size: 0.8rem;
      font-weight: 500;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 10px;
    }

    .form-input {
      width: 100%;
      padding: 13px 16px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.95rem;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .form-input::placeholder { color: var(--text-muted); }

    .form-input:focus {
      border-color: var(--purple);
      box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.18);
    }

    /* ── FILE DROP ZONE ── */
    .drop-zone {
      width: 100%;
      border: 2px dashed var(--border-light);
      border-radius: var(--radius-md);
      padding: 40px 24px;
      text-align: center;
      cursor: pointer;
      transition: all 0.25s ease;
      background: var(--bg-primary);
      position: relative;
    }

    .drop-zone:hover, .drop-zone.drag-over {
      border-color: var(--purple);
      background: rgba(124, 58, 237, 0.06);
    }

    .drop-zone input[type="file"] {
      position: absolute;
      inset: 0;
      opacity: 0;
      cursor: pointer;
      width: 100%;
      height: 100%;
    }

    .drop-icon {
      font-size: 2.4rem;
      margin-bottom: 12px;
      display: block;
    }

    .drop-title {
      font-family: 'Syne', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .drop-sub {
      font-size: 0.82rem;
      color: var(--text-muted);
    }

    .drop-filename {
      margin-top: 12px;
      font-size: 0.82rem;
      color: var(--purple-glow);
      font-weight: 500;
    }

    /* ── SUBMIT BUTTON ── */
    .submit-btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 14px 28px;
      background: var(--grad-hero);
      border: none;
      border-radius: var(--radius-sm);
      color: #fff;
      font-family: 'Syne', sans-serif;
      font-size: 0.95rem;
      font-weight: 700;
      letter-spacing: 0.3px;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.15s;
      margin-top: 8px;
    }

    .submit-btn:hover { opacity: 0.9; transform: translateY(-1px); }
    .submit-btn:active { transform: translateY(0); }
    .submit-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

    /* ── PROGRESS BAR ── */
    .progress-bar-wrap {
      height: 3px;
      background: var(--border);
      border-radius: 0 0 var(--radius-lg) var(--radius-lg);
      overflow: hidden;
      display: none;
    }

    .progress-bar-fill {
      height: 100%;
      background: var(--grad-hero);
      width: 0%;
      transition: width 0.4s ease;
    }

    .upload-status {
      margin-top: 16px;
      font-size: 0.85rem;
      color: var(--text-secondary);
      display: none;
    }

    .upload-status.visible { display: block; }

    /* ── PIPELINE SPECS ── */
    .specs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-top: 24px;
    }

    .spec-card {
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 18px 20px;
    }

    .spec-label {
      font-size: 0.72rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-muted);
      margin-bottom: 6px;
    }

    .spec-value {
      font-family: 'Syne', sans-serif;
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .spec-value span {
      font-size: 0.78rem;
      font-weight: 400;
      color: var(--text-secondary);
      font-family: 'DM Sans', sans-serif;
      margin-left: 4px;
    }

    /* ── VIDEO LIST ── */
    .video-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .video-item {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 20px 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      transition: border-color 0.2s, background 0.2s;
      animation: fadeIn 0.35s ease forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0);   }
    }

    .video-item:hover {
      border-color: var(--purple);
      background: var(--bg-elevated);
    }

    .video-thumb {
      width: 48px;
      height: 48px;
      background: var(--grad-hero);
      border-radius: var(--radius-sm);
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
    }

    .video-info {
      flex: 1;
      min-width: 0;
    }

    .video-title-text {
      font-family: 'Syne', sans-serif;
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 3px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .video-id {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-family: 'DM Mono', 'Courier New', monospace;
    }

    .video-actions {
      display: flex;
      gap: 10px;
      flex-shrink: 0;
      flex-wrap: wrap;
    }

    .action-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
      font-weight: 500;
      text-decoration: none;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .action-link-m3u8 {
      background: rgba(124, 58, 237, 0.15);
      border: 1px solid rgba(124, 58, 237, 0.35);
      color: var(--purple-glow);
    }

    .action-link-m3u8:hover {
      background: rgba(124, 58, 237, 0.28);
      border-color: var(--purple);
    }

    .action-link-play {
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
    }

    .action-link-play:hover {
      background: rgba(16, 185, 129, 0.22);
    }

    /* ── EMPTY STATE ── */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
      border: 1px dashed var(--border-light);
      border-radius: var(--radius-lg);
      text-align: center;
      gap: 12px;
    }

    .empty-icon {
      font-size: 2.5rem;
      opacity: 0.4;
    }

    .empty-text {
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    /* ── TOAST ── */
    #toast {
      position: fixed;
      bottom: 28px;
      right: 28px;
      background: var(--bg-elevated);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      padding: 14px 20px;
      font-size: 0.85rem;
      color: var(--text-primary);
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      transform: translateY(20px);
      opacity: 0;
      transition: all 0.3s ease;
      pointer-events: none;
      z-index: 999;
      max-width: 320px;
    }

    #toast.show { opacity: 1; transform: translateY(0); }
    #toast.success { border-color: rgba(16, 185, 129, 0.5); }
    #toast.error   { border-color: rgba(220, 38, 38, 0.5); }

    /* ── DIVIDER ── */
    .divider {
      height: 1px;
      background: var(--border);
      width: 100%;
    }

    /* ── RESPONSIVE ── */
    @media (max-width: 640px) {
      .navbar { padding: 0 16px; }
      .upload-card-inner { padding: 24px 20px; }
      .page { padding: 32px 16px 60px; }
      .video-item { flex-direction: column; align-items: flex-start; }
      .video-actions { width: 100%; }
    }
  </style>
</head>
<body>

  <nav class="navbar">
    <a class="brand" href="/">
      <div class="brand-icon">▶</div>
      <span class="brand-name">KelvStream</span>
    </a>
    <span class="nav-badge">Transcoder v1.0</span>
  </nav>

  <div class="page">

    <!-- Upload Section -->
    <section>
      <p class="section-label">Pipeline</p>
      <h1 class="section-title">Upload &amp; Transcode</h1>
      <p class="section-sub">Videos are segmented into multi-resolution HLS streams for adaptive bitrate playback.</p>

      <div class="specs-grid">
        <div class="spec-card">
          <div class="spec-label">Stream 0</div>
          <div class="spec-value">360p <span>800k bitrate</span></div>
        </div>
        <div class="spec-card">
          <div class="spec-label">Stream 1</div>
          <div class="spec-value">720p <span>2.8M bitrate</span></div>
        </div>
        <div class="spec-card">
          <div class="spec-label">Segment length</div>
          <div class="spec-value">6s <span>HLS VOD</span></div>
        </div>
        <div class="spec-card">
          <div class="spec-label">Audio codec</div>
          <div class="spec-value">AAC <span>96–128k</span></div>
        </div>
      </div>
    </section>

    <div class="divider"></div>

    <!-- Upload Form -->
    <section>
      <div class="upload-card">
        <div class="upload-card-inner">
          <form id="upload-form" enctype="multipart/form-data">
            <div class="form-row">
              <label class="form-label" for="title-input">Video Title</label>
              <input
                id="title-input"
                class="form-input"
                type="text"
                name="title"
                placeholder="e.g. System Design Mock Interview"
                required
              />
            </div>

            <div class="form-row">
              <label class="form-label">Video File</label>
              <div class="drop-zone" id="drop-zone">
                <input type="file" name="video" id="file-input" accept="video/*" required />
                <span class="drop-icon">🎬</span>
                <div class="drop-title">Drop your video here</div>
                <div class="drop-sub">.mp4, .mov, .webm, .avi and more</div>
                <div class="drop-filename" id="drop-filename"></div>
              </div>
            </div>

            <button type="submit" class="submit-btn" id="submit-btn">
              <span>▶</span> Upload &amp; Start Transcoding
            </button>

            <div class="upload-status" id="upload-status"></div>
          </form>
        </div>
        <div class="progress-bar-wrap" id="progress-wrap">
          <div class="progress-bar-fill" id="progress-fill"></div>
        </div>
      </div>
    </section>

    <div class="divider"></div>

    <!-- Videos List -->
    <section>
      <p class="section-label">Library</p>
      <h2 class="section-title" style="font-size:1.4rem;">Transcoded Videos</h2>

      <div class="video-list" id="video-list" style="margin-top: 24px;">
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <p class="empty-text">Loading videos…</p>
        </div>
      </div>
    </section>

  </div>

  <div id="toast"></div>

  <script>
    const fileInput   = document.getElementById('file-input');
    const dropZone    = document.getElementById('drop-zone');
    const dropName    = document.getElementById('drop-filename');
    const uploadForm  = document.getElementById('upload-form');
    const submitBtn   = document.getElementById('submit-btn');
    const statusEl    = document.getElementById('upload-status');
    const progressWrap= document.getElementById('progress-wrap');
    const progressFill= document.getElementById('progress-fill');
    const videoList   = document.getElementById('video-list');

    // Drag-over highlight
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      if (e.dataTransfer.files[0]) {
        fileInput.files = e.dataTransfer.files;
        dropName.textContent = '✓ ' + e.dataTransfer.files[0].name;
      }
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files[0]) dropName.textContent = '✓ ' + fileInput.files[0].name;
    });

    // Toast
    function showToast(msg, type = 'info') {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.className = 'show ' + type;
      clearTimeout(t._timer);
      t._timer = setTimeout(() => { t.className = ''; }, 3800);
    }

    // Upload + poll
    uploadForm.addEventListener('submit', async e => {
      e.preventDefault();
      const title = document.getElementById('title-input').value.trim();
      if (!fileInput.files[0]) { showToast('Please select a video file.', 'error'); return; }

      const formData = new FormData(uploadForm);
      submitBtn.disabled = true;
      submitBtn.textContent = '⏳ Uploading…';
      progressWrap.style.display = 'block';
      progressFill.style.width = '5%';
      statusEl.className = 'upload-status visible';
      statusEl.textContent = 'Uploading video to server…';

      try {
        const res = await fetch('/upload', { method: 'POST', body: formData });
        if (!res.ok) throw new Error('Upload failed with status ' + res.status);
        const data = await res.json();

        progressFill.style.width = '25%';
        statusEl.textContent = 'Transcoding pipeline started — polling for status…';
        showToast('Upload received! Transcoding in progress…');
        submitBtn.textContent = '⏳ Transcoding…';

        const videoId = data.videoId;
        pollStatus(videoId, title);

      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>▶</span> Upload &amp; Start Transcoding';
        progressFill.style.width = '0%';
        statusEl.textContent = 'Error: ' + err.message;
        showToast('Upload failed: ' + err.message, 'error');
      }
    });

    function pollStatus(id, title) {
      const interval = setInterval(async () => {
        try {
          const res = await fetch('/status/' + id);
          const job = await res.json();

          if (job.status === 'completed') {
            clearInterval(interval);
            progressFill.style.width = '100%';
            statusEl.textContent = '✓ Transcoding complete!';
            showToast('✓ "' + title + '" is ready to stream!', 'success');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>▶</span> Upload &amp; Start Transcoding';
            uploadForm.reset();
            dropName.textContent = '';
            setTimeout(() => {
              progressFill.style.width = '0%';
              progressWrap.style.display = 'none';
              statusEl.className = 'upload-status';
            }, 2000);
            loadVideos();

          } else if (job.status === 'failed') {
            clearInterval(interval);
            progressFill.style.width = '0%';
            statusEl.textContent = '✗ Transcoding failed: ' + (job.error || 'Unknown error');
            showToast('Transcoding failed.', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>▶</span> Upload &amp; Start Transcoding';

          } else {
            // Animate progress bar while processing
            const current = parseFloat(progressFill.style.width) || 25;
            if (current < 90) progressFill.style.width = Math.min(current + 4, 90) + '%';
          }
        } catch (err) {
          // Network hiccup — keep polling
        }
      }, 2500);
    }

    // Load video list
    async function loadVideos() {
      try {
        const res = await fetch('/videos');
        const videos = await res.json();

        if (!videos || videos.length === 0) {
          videoList.innerHTML = \`
            <div class="empty-state">
              <div class="empty-icon">🎞️</div>
              <p class="empty-text">No transcoded videos yet — upload one above.</p>
            </div>\`;
          return;
        }

        videoList.innerHTML = '';
        videos.slice().reverse().forEach(v => {
          const item = document.createElement('div');
          item.className = 'video-item';
          item.innerHTML = \`
            <div class="video-thumb">▶</div>
            <div class="video-info">
              <div class="video-title-text">\${escHtml(v.title)}</div>
              <div class="video-id">ID: \${v.id}</div>
            </div>
            <div class="video-actions">
              <a class="action-link action-link-m3u8" href="/streams/\${v.id}/master.m3u8" target="_blank">
                🔗 master.m3u8
              </a>
              <a class="action-link action-link-play" href="${CLIENT_URL}/video/\${v.id}" target="_blank">
                 ▶ Play App
              </a>
            </div>\`;
          videoList.appendChild(item);
        });

      } catch (err) {
        videoList.innerHTML = \`
          <div class="empty-state">
            <div class="empty-icon">⚠️</div>
            <p class="empty-text">Failed to load videos from server.</p>
          </div>\`;
      }
    }

    function escHtml(str) {
      return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    loadVideos();
  </script>
</body>
</html>`);
});

// Ensure required directories exist
const UPLOADS_DIR = path.join(__dirname, process.env.UPLOADS_DIR || 'uploads');
const TRANSCODED_DIR = path.join(__dirname, process.env.TRANSCODED_DIR || 'transcoded');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(TRANSCODED_DIR)) fs.mkdirSync(TRANSCODED_DIR, { recursive: true });

// Serve transcoded HLS stream directories statically
app.use('/streams', express.static(TRANSCODED_DIR));

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are supported.'));
    }
  }
});

// In-memory job tracker
const jobs = {};

// POST /upload — receive video and kick off FFmpeg
app.post('/upload', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No video file uploaded.' });
  }

  const videoId = crypto.randomUUID();
  const inputFilePath = req.file.path;
  const videoTitle = req.body.title || 'Untitled Video';

  const outputFolder = path.join(TRANSCODED_DIR, videoId);
  const stream0Folder = path.join(outputFolder, 'stream_0');
  const stream1Folder = path.join(outputFolder, 'stream_1');

  fs.mkdirSync(outputFolder, { recursive: true });
  fs.mkdirSync(stream0Folder, { recursive: true });
  fs.mkdirSync(stream1Folder, { recursive: true });

  jobs[videoId] = {
    id: videoId,
    title: videoTitle,
    status: 'processing',
    progress: 0,
    startedAt: new Date(),
    completedAt: null,
    error: null,
    streamUrl: `${BACKEND_URL}/streams/${videoId}/master.m3u8`
  };

  res.status(202).json({
    message: 'Video upload received. Transcoding pipeline started.',
    videoId,
    statusUrl: `${BACKEND_URL}/status/${videoId}`
  });

  // FFmpeg — dual-resolution HLS transcode
  const ffmpegArgs = [
    '-i', inputFilePath,
    '-filter_complex', '[0:v]split=2[v1][v2]; [v1]scale=w=640:h=360[v1out]; [v2]scale=w=1280:h=720[v2out]',
    '-map', '[v1out]', '-map', '0:a', '-c:v:0', 'libx264', '-b:v:0', '800k', '-maxrate:v:0', '850k', '-bufsize:v:0', '1200k', '-c:a:0', 'aac', '-b:a:0', '96k',
    '-map', '[v2out]', '-map', '0:a', '-c:v:1', 'libx264', '-b:v:1', '2800k', '-maxrate:v:1', '2996k', '-bufsize:v:1', '4200k', '-c:a:1', 'aac', '-b:a:1', '128k',
    '-f', 'hls',
    '-hls_time', '6',
    '-hls_playlist_type', 'vod',
    '-hls_segment_filename', path.join(outputFolder, 'stream_%v', 'data%03d.ts'),
    '-master_pl_name', 'master.m3u8',
    '-var_stream_map', 'v:0,a:0 v:1,a:1',
    path.join(outputFolder, 'stream_%v', 'index.m3u8')
  ];

  const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);

  ffmpegProcess.on('error', (err) => {
    console.error(`[Error] FFmpeg failed to start for ${videoId}:`, err.message);
    jobs[videoId].status = 'failed';
    jobs[videoId].error = `FFmpeg failed to start: ${err.message}. Ensure FFmpeg is installed and on PATH.`;
    try { if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath); } catch (_) { }
  });

  ffmpegProcess.on('close', (code) => {
    try { if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath); } catch (_) { }

    if (code === 0) {
      console.log(`[OK] Transcoding complete: ${videoId}`);
      jobs[videoId].status = 'completed';
      jobs[videoId].progress = 100;
      jobs[videoId].completedAt = new Date();
    } else {
      console.error(`[Error] FFmpeg exited with code ${code} for ${videoId}`);
      jobs[videoId].status = 'failed';
      jobs[videoId].error = `FFmpeg exited with code ${code}. Check server logs.`;
    }
  });

  ffmpegProcess.stderr.on('data', (data) => {
    const line = data.toString().trim().split('\n')[0];
    console.log(`[FFmpeg ${videoId}] ${line}`);
  });
});

// GET /status/:id
app.get('/status/:id', (req, res) => {
  const job = jobs[req.params.id];
  if (!job) return res.status(404).json({ error: 'Transcoding job not found.' });
  res.json(job);
});

// GET /videos
app.get('/videos', (req, res) => {
  const completed = Object.values(jobs)
    .filter(j => j.status === 'completed')
    .map(j => ({ id: j.id, title: j.title, streamUrl: j.streamUrl, completedAt: j.completedAt }));
  res.json(completed);
});

app.listen(PORT, () => {
  console.log(`KelvStream Transcoder running on port ${PORT}`);
  console.log(`  → Control panel:  http://localhost:${PORT}/`);
  console.log(`  → Upload:         POST http://localhost:${PORT}/upload`);
  console.log(`  → Streams:        http://localhost:${PORT}/streams/`);
});