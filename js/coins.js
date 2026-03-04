/* ─────────────────────────────────────────
   COINS
───────────────────────────────────────── */
let coins = [];

function spawnCoinsForPipe(topH) {
  // Only ~30% chance to spawn — keeps coins rare
  if (Math.random() > 0.30) return;

  const gapMid  = topH + PIPE_GAP / 2;
  const count   = Math.random() < 0.5 ? 1 : 2;
  const spacing = 80;
  const startX  = canvas.width + previewWidth + PIPE_WIDTH + 30;
  const spread  = Math.min(PIPE_GAP / 2 - 22, 28);

  for (let i = 0; i < count; i++) {
    const oY = (i % 2 === 0 ? 1 : -1) * spread * 0.4;
    coins.push({
      x:         startX + i * spacing,
      y:         gapMid + oY - 14,
      w:         28,
      h:         28,
      bobOffset: (Math.PI * 2 / Math.max(count, 1)) * i,
      collected: false,
      alpha:     1,
    });
  }
}

function updateCoins() {
  const bb = bird.getBounds();

  coins.forEach(c => {
    c.x         -= PIPE_SPEED;
    c.bobOffset += 0.06;

    if (c.collected) {
      c.y     -= 1.5;
      c.alpha -= 0.05;
      return;
    }

    // Collect check
    if (
      bb.x < c.x + c.w && bb.x + bb.width  > c.x &&
      bb.y < c.y + c.h && bb.y + bb.height > c.y
    ) {
      c.collected = true;
      coinCount++;
      totalCoins++;
      walletCoins++;
      localStorage.setItem('flippy-total-coins', totalCoins);
      localStorage.setItem('flippy-coins', walletCoins);
      playSound(sounds.point);
      spawnFloatingText('+🪙', c.x + c.w / 2, c.y, '#FFD700', 20);
      updateCoinHUD();
    }
  });

  coins = coins.filter(c => c.x + c.w > -10 && c.alpha > 0);
}

function drawCoins() {
  coins.forEach(c => {
    const cx = c.x + c.w / 2;
    const cy = c.y + c.h / 2 + Math.sin(c.bobOffset) * 4;
    ctx.save();
    ctx.globalAlpha = c.alpha;

    if (imgOK.coin) {
      ctx.drawImage(imgs.coin, cx - c.w / 2, cy - c.h / 2, c.w, c.h);
    } else {
      // Fallback: gold circle with inner shine ring
      ctx.translate(cx, cy);
      const r = c.w / 2;
      // Outer glow
      ctx.shadowColor  = 'rgba(255,215,0,0.7)';
      ctx.shadowBlur   = 8;
      ctx.fillStyle    = '#FFD700';
      ctx.strokeStyle  = '#B8860B';
      ctx.lineWidth    = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Inner shine
      ctx.shadowBlur   = 0;
      ctx.fillStyle    = 'rgba(255,255,200,0.55)';
      ctx.beginPath();
      ctx.arc(-r * 0.22, -r * 0.22, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
      // $ symbol
      ctx.fillStyle    = '#7a5c00';
      ctx.font         = `bold ${Math.round(r)}px Arial`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', 0, 1);
    }

    ctx.restore();
  });
}
