/* ─────────────────────────────────────────
   CANVAS  &  VIEWPORT
───────────────────────────────────────── */
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

canvas.width  = 400;
canvas.height = 600;

const ui = document.getElementById('ui');

function resize() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const aspect = 400 / 600;
  let w = vh * aspect;
  let h = vh;
  if (w > vw) { w = vw; h = vw / aspect; }
  canvas.style.width  = w + 'px';
  canvas.style.height = h + 'px';
  ui.style.width  = w + 'px';
  ui.style.height = h + 'px';
  ui.style.left   = ((vw - w) / 2) + 'px';
  ui.style.top    = ((vh - h) / 2) + 'px';
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
