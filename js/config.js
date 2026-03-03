/* ─────────────────────────────────────────
   CANVAS  &  VIEWPORT
───────────────────────────────────────── */
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

canvas.width  = 400;
canvas.height = 600;

const ui = document.getElementById('ui');

/* ── Right-side preview canvas (shows upcoming pipes in the blue area) ── */
const previewCanvas = document.getElementById('previewCanvas');
const previewCtx    = previewCanvas.getContext('2d');
previewCtx.imageSmoothingEnabled = false;
previewCanvas.style.position       = 'fixed';
previewCanvas.style.imageRendering = 'pixelated';
previewCanvas.style.zIndex         = '0';

/* ── Left-side past canvas (shows world that has already scrolled past) ── */
const pastCanvas = document.getElementById('pastCanvas');
const pastCtx    = pastCanvas.getContext('2d');
pastCtx.imageSmoothingEnabled = false;
pastCanvas.style.position       = 'fixed';
pastCanvas.style.imageRendering = 'pixelated';
pastCanvas.style.zIndex         = '0';

/** Width of each side strip in game-coordinate pixels (0 on narrow screens). */
let previewWidth = 0;

function resize() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const aspect = 400 / 600;   // internal game resolution ratio

  let w = vh * aspect;
  let h = vh;
  if (w > vw) { w = vw; h = vw / aspect; }

  canvas.style.width  = w + 'px';
  canvas.style.height = h + 'px';
  canvas.style.left   = ((vw - w) / 2) + 'px';
  canvas.style.top    = ((vh - h) / 2) + 'px';

  ui.style.width  = w + 'px';
  ui.style.height = h + 'px';
  ui.style.left   = ((vw - w) / 2) + 'px';
  ui.style.top    = ((vh - h) / 2) + 'px';

  /* Side panels never used */
  const lp = document.getElementById('panel-left');
  const rp = document.getElementById('panel-right');
  if (lp) lp.classList.remove('visible');
  if (rp) rp.classList.remove('visible');

  /* ── Side strip canvases ── */
  const scale    = h / 600;         // CSS px per game px
  const sideCSS  = (vw - w) / 2;   // CSS width of each strip (equal L & R)
  if (sideCSS >= 20 && scale > 0) {
    previewWidth = Math.round(sideCSS / scale);

    // Right preview (upcoming pipes)
    previewCanvas.width  = previewWidth;
    previewCanvas.height = 600;
    previewCanvas.style.width   = sideCSS + 'px';
    previewCanvas.style.height  = h + 'px';
    previewCanvas.style.left    = ((vw + w) / 2) + 'px';
    previewCanvas.style.top     = ((vh - h) / 2) + 'px';
    previewCanvas.style.display = 'block';

    // Left past (pipes already scrolled by)
    pastCanvas.width  = previewWidth;
    pastCanvas.height = 600;
    pastCanvas.style.width   = sideCSS + 'px';
    pastCanvas.style.height  = h + 'px';
    pastCanvas.style.left    = ((vw - w) / 2 - sideCSS) + 'px';
    pastCanvas.style.top     = ((vh - h) / 2) + 'px';
    pastCanvas.style.display = 'block';
  } else {
    previewWidth = 0;
    previewCanvas.style.display = 'none';
    pastCanvas.style.display    = 'none';
  }
}
resize();
window.addEventListener('resize', resize);

/* ─────────────────────────────────────────
   WORLD  CONSTANTS
───────────────────────────────────────── */
const GROUND_Y      = canvas.height - 80;
const BG_SPEED      = 0.3;
const GROUND_SPEED  = 2;
const PIPE_WIDTH    = 70;
const PIPE_GAP      = 165;
const PIPE_INTERVAL = 1800;
