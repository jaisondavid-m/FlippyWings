/* ─────────────────────────────────────────
   INPUT  HANDLERS
───────────────────────────────────────── */

// ── Canvas click / tap ──────────────────
canvas.addEventListener('click', () => {
  if (gameState !== 'playing') return;
  if (isPaused) { togglePause(); return; }
  flap();
});

canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  if (gameState !== 'playing') return;
  if (isPaused) { togglePause(); return; }
  flap();
}, { passive: false });

// ── Keyboard ────────────────────────────
document.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();
    if (gameState === 'playing' && isPaused) { togglePause(); return; }
    flap();
  }
  if (e.code === 'Escape' || e.code === 'KeyP' || e.code === 'KeyK') {
    e.preventDefault();
    togglePause();
  }
});

// ── Start / Restart button ───────────────
document.getElementById('startBtn').addEventListener('click', e => {
  e.stopPropagation();
  startGame();
});
document.getElementById('startBtn').addEventListener('touchstart', e => {
  e.preventDefault();
  e.stopPropagation();
  startGame();
}, { passive: false });

// ── Pause button ─────────────────────────
document.getElementById('pauseBtn').addEventListener('click', e => {
  e.stopPropagation();
  togglePause();
});

/* ─────────────────────────────────────────
   TOGGLE  PAUSE
───────────────────────────────────────── */
function togglePause() {
  if (gameState !== 'playing') return;
  isPaused = !isPaused;
  document.getElementById('pauseBtn').textContent = isPaused ? '▶' : '⏸';

  if (isPaused) {
    sounds.mainTheme.pause();
  } else {
    sounds.mainTheme.play().catch(() => {});
    playSound(sounds.swoosh);
  }
}
