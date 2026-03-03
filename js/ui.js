/* ─────────────────────────────────────────
   DOM  UI  HELPERS
───────────────────────────────────────── */

/** Sync the desktop side-panel score display. */
function updateDesktopScores() {
  const best   = document.getElementById('ds-best');
  const wallet = document.getElementById('ds-wallet');
  if (best)   best.textContent   = bestScore;
  if (wallet) wallet.textContent = walletCoins;
}

/** Show the start / title screen UI. */
function showStartUI() {
  const overlay  = document.getElementById('overlay');
  const startBtn = document.getElementById('startBtn');

  document.getElementById('gameTitle').classList.add('hidden');
  document.getElementById('gameOverText').classList.add('hidden');
  document.getElementById('scoreBoard').classList.add('hidden');
  document.getElementById('tapsHint').classList.add('hidden');
  document.getElementById('pauseBtn').classList.add('hidden');
  document.getElementById('coinHUD').classList.add('hidden');

  startBtn.textContent = 'START';
  startBtn.style.top   = '';

  overlay.classList.remove('hidden');
  overlay.classList.add('start-mode');
  updateDesktopScores();
}

/** Show game-over results screen. */
function showGameOverUI() {
  const overlay  = document.getElementById('overlay');
  const startBtn = document.getElementById('startBtn');

  overlay.classList.remove('start-mode');
  startBtn.style.top = '';

  document.getElementById('gameTitle').classList.add('hidden');
  document.getElementById('gameOverText').classList.remove('hidden');
  document.getElementById('sbScore').textContent = score;
  document.getElementById('sbBest').textContent  = bestScore;
  document.getElementById('sbCoins').textContent = coinCount;
  document.getElementById('sbTotal').textContent = walletCoins;
  document.getElementById('scoreBoard').classList.remove('hidden');
  document.getElementById('tapsHint').classList.add('hidden');
  document.getElementById('pauseBtn').classList.add('hidden');
  document.getElementById('coinHUD').classList.add('hidden');

  startBtn.textContent = 'RESTART';
  overlay.classList.remove('hidden');
  updateDesktopScores();
}

/** Hide the overlay while the player is actively playing. */
function showPlayingUI() {
  const overlay  = document.getElementById('overlay');
  const startBtn = document.getElementById('startBtn');

  overlay.classList.remove('start-mode');
  startBtn.style.top = '';
  overlay.classList.add('hidden');

  document.getElementById('pauseBtn').classList.remove('hidden');
  document.getElementById('coinHUD').classList.remove('hidden');
  updateCoinHUD();
}
