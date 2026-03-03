/* ─────────────────────────────────────────
   SCORE  HUD  (canvas drawn)
───────────────────────────────────────── */
function drawHUD() {
  if (gameState !== 'playing') return;
  ctx.save();
  ctx.fillStyle    = '#fff';
  ctx.strokeStyle  = '#000';
  ctx.lineWidth    = 3;
  ctx.font         = 'bold 36px Arial';
  ctx.textAlign    = 'center';
  ctx.strokeText(score, canvas.width / 2, 60);
  ctx.fillText(score,   canvas.width / 2, 60);
  ctx.restore();
}

function updateCoinHUD() {
  const el = document.getElementById('coinHUD');
  if (el) el.textContent = '🪙 ' + coinCount;
}

/* ─────────────────────────────────────────
   HOME  SCREEN  IMAGE
───────────────────────────────────────── */
function drawHomeScreen() {
  if (gameState !== 'start') return;

  if (imgOK.home) {
    const iw = imgs.home.naturalWidth  || canvas.width;
    const ih = imgs.home.naturalHeight || canvas.height;

    // Contain fit — whole image visible, no cropping
    const scale = Math.min(canvas.width / iw, canvas.height / ih);
    const dw    = iw * scale;
    const dh    = ih * scale;
    const dx    = (canvas.width  - dw) / 2;
    const dy    = (canvas.height - dh) / 2;

    // Track where the image bottom sits so the button can follow
    homeImgBottomPct = (dy + dh) / canvas.height;

    ctx.fillStyle = '#70c5ce';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgs.home, dx, dy, dw, dh);
  } else {
    ctx.fillStyle = '#70c5ce';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

/* ─────────────────────────────────────────
   PAUSE  OVERLAY  (canvas drawn)
───────────────────────────────────────── */
function drawPauseOverlay() {
  if (!isPaused || gameState !== 'playing') return;

  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cx    = canvas.width  / 2;
  const cy    = canvas.height / 2;
  const cardW = 260;
  const cardH = 180;
  const r     = 18;

  // Card background
  ctx.save();
  ctx.fillStyle   = 'rgba(20,20,30,0.92)';
  ctx.strokeStyle = '#f5a623';
  ctx.lineWidth   = 3;
  ctx.beginPath();
  ctx.moveTo(cx - cardW / 2 + r, cy - cardH / 2);
  ctx.arcTo(cx + cardW / 2, cy - cardH / 2, cx + cardW / 2, cy + cardH / 2, r);
  ctx.arcTo(cx + cardW / 2, cy + cardH / 2, cx - cardW / 2, cy + cardH / 2, r);
  ctx.arcTo(cx - cardW / 2, cy + cardH / 2, cx - cardW / 2, cy - cardH / 2, r);
  ctx.arcTo(cx - cardW / 2, cy - cardH / 2, cx + cardW / 2, cy - cardH / 2, r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.textAlign = 'center';

  // Paused icon + label
  ctx.font         = 'bold 38px Arial';
  ctx.textBaseline = 'middle';
  ctx.fillStyle    = '#f5a623';
  ctx.fillText('⏸  PAUSED', cx, cy - 50);

  // Divider line
  ctx.strokeStyle = 'rgba(245,166,35,0.35)';
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 90, cy - 22);
  ctx.lineTo(cx + 90, cy - 22);
  ctx.stroke();

  // Inline score / coins
  ctx.font         = 'bold 16px Arial';
  ctx.textBaseline = 'middle';
  ctx.fillStyle    = 'rgba(255,255,255,0.75)';
  ctx.fillText('SCORE  ' + score + '   🪙  ' + coinCount, cx, cy + 5);

  // Resume hint
  ctx.font      = 'bold 15px Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText('Tap anywhere or press P / K to resume', cx, cy + 50);

  ctx.restore();
}
