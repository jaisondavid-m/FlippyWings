/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   SCORE  HUD  (canvas drawn)
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   HOME  SCREEN
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function drawHomeScreen() {
  if (gameState !== 'start') return;
  const W   = canvas.width;   // 400
  const H   = canvas.height;  // 600
  const cx  = W / 2;
  const now = performance.now();

  // Helper: rounded-rect fill+stroke
  function pill(x, y, w, h, r, fill, stroke, lw) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y,     x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x,     y + h, r);
    ctx.arcTo(x,     y + h, x,     y,     r);
    ctx.arcTo(x,     y,     x + w, y,     r);
    ctx.closePath();
    if (fill)   { ctx.fillStyle   = fill;   ctx.fill();   }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 2; ctx.stroke(); }
  }

  // ── 2. Title card ──
  const titleCY = 118;

  // Title card background
  ctx.save();
  ctx.shadowColor  = 'rgba(255,185,0,0.4)';
  ctx.shadowBlur   = 22;
  pill(cx - 154, titleCY - 38, 308, 76, 38, 'rgba(0,12,28,0.65)', 'rgba(255,185,0,0.55)', 2);
  ctx.shadowColor  = 'transparent';
  // Decorative side accent lines
  ctx.strokeStyle  = 'rgba(255,185,0,0.3)';
  ctx.lineWidth    = 1.5;
  [[-130, -68], [68, 130]].forEach(([x1, x2]) => {
    ctx.beginPath(); ctx.moveTo(cx + x1, titleCY - 16); ctx.lineTo(cx + x2, titleCY - 16); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + x1, titleCY + 16); ctx.lineTo(cx + x2, titleCY + 16); ctx.stroke();
  });
  ctx.restore();

  // "FLIPPY" â€” gold gradient
  ctx.save();
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.font         = 'bold italic 36px "Arial Black", Arial, sans-serif';
  ctx.lineWidth    = 7;
  ctx.strokeStyle  = 'rgba(0,0,0,0.95)';
  ctx.strokeText('FLIPPY', cx, titleCY - 14);
  const g1 = ctx.createLinearGradient(cx, titleCY - 32, cx, titleCY);
  g1.addColorStop(0, '#FFF176'); g1.addColorStop(0.5, '#FFB300'); g1.addColorStop(1, '#E65100');
  ctx.fillStyle = g1;
  ctx.fillText('FLIPPY', cx, titleCY - 14);

  // "WINGS" â€” ice-blue gradient
  ctx.font      = 'bold italic 28px "Arial Black", Arial, sans-serif';
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(0,0,0,0.95)';
  ctx.strokeText('WINGS', cx, titleCY + 20);
  const g2 = ctx.createLinearGradient(cx, titleCY + 6, cx, titleCY + 34);
  g2.addColorStop(0, '#E0FFFF'); g2.addColorStop(1, '#40C4FF');
  ctx.fillStyle = g2;
  ctx.fillText('WINGS', cx, titleCY + 20);
  ctx.restore();

  // â”€â”€ 3. Animated bird â€” large, centred, hovering â”€â”€
  if (spriteLoaded) {
    const fi = Math.floor(now / 100) % 3;
    const f  = bird.frames[fi];
    const bw = 80, bh = 60;
    const bx = cx - bw / 2;
    const by = 215 + Math.sin(now * 0.0028) * 12;
    // Drop shadow ellipse
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse(cx, Math.round(by + bh + 5), bw * 0.3, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.drawImage(spriteSheet, f.x, f.y, f.width, f.height,
      Math.round(bx), Math.round(by), bw, bh);
  }

  // â”€â”€ 4. Best-score pill (only if a best exists) â”€â”€
  if (bestScore > 0) {
    ctx.save();
    pill(cx - 90, 306, 180, 30, 15, 'rgba(0,0,0,0.5)', 'rgba(255,215,0,0.5)', 1.5);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font      = 'bold 13px "Arial Black", Arial, sans-serif';
    ctx.fillStyle = '#FFD700';
    ctx.fillText('\uD83C\uDFC6  BEST  ' + bestScore, cx, 321);
    ctx.restore();
  }

  // â”€â”€ 5. Pulsing hint above ground â”€â”€
  ctx.save();
  ctx.globalAlpha  = 0.5 + 0.5 * Math.abs(Math.sin(now * 0.0022));
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.font         = 'bold 14px "Arial Black", Arial, sans-serif';
  ctx.lineWidth    = 4;
  ctx.strokeStyle  = 'rgba(0,0,0,0.8)';
  ctx.strokeText('TAP  \u00b7  SPACE  \u00b7  CLICK  TO  START', cx, GROUND_Y - 38);
  ctx.fillStyle    = '#ffffff';
  ctx.fillText('TAP  \u00b7  SPACE  \u00b7  CLICK  TO  START', cx, GROUND_Y - 38);
  ctx.restore();
}


/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   PAUSE  OVERLAY  (canvas drawn)
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

