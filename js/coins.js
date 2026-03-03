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
  const startX  = canvas.width + PIPE_WIDTH + 30;
  const spread  = Math.min(PIPE_GAP / 2 - 22, 28);

  for (let i = 0; i < count; i++) {
    const oY = (i % 2 === 0 ? 1 : -1) * spread * 0.4;
    coins.push({
      x:         startX + i * spacing,
      y:         gapMid + oY - 11,
      w:         22,
      h:         22,
      bobOffset: (Math.PI * 2 / Math.max(count, 1)) * i,
      angle:     0,
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
    c.angle     += 0.04;

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
    const cy = c.y + c.h / 2 + Math.sin(c.bobOffset) * 3;
    ctx.save();
    ctx.globalAlpha = c.alpha;
    ctx.translate(c.x + c.w / 2, cy);
    ctx.rotate(c.angle);
    const sx = Math.abs(Math.cos(c.angle));
    ctx.scale(Math.max(sx, 0.1), 1);

    if (imgOK.coin) {
      ctx.drawImage(imgs.coin, -c.w / 2, -c.h / 2, c.w, c.h);
    } else {
      // Fallback coin shape
      ctx.fillStyle   = '#FFD700';
      ctx.strokeStyle = '#B8860B';
      ctx.lineWidth   = 2;
      ctx.beginPath();
      ctx.arc(0, 0, c.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle    = '#FFF8DC';
      ctx.font         = 'bold 10px Arial';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', 0, 0);
    }

    ctx.restore();
  });
}
