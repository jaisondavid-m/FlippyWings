/* ─────────────────────────────────────────
   PIPES
───────────────────────────────────────── */
let PIPE_SPEED = 2;

const pipeSpr = {
  top:    { x: 302, y: 0, width: 26, height: 135 },
  bottom: { x: 330, y: 0, width: 26, height: 121 },
};

let pipes        = [];
let lastPipeTime = 0;

function spawnPipe(now) {
  const minTop = 80;
  const maxTop = canvas.height - PIPE_GAP - 180;
  const topH   = Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop;
  pipes.push({
    x:         canvas.width,
    topHeight: topH,
    bottomY:   topH + PIPE_GAP,
    scored:    false,
  });
  spawnCoinsForPipe(topH);
}

function updatePipes(now) {
  if (now - lastPipeTime > PIPE_INTERVAL) {
    spawnPipe(now);
    lastPipeTime = now;
  }
  pipes.forEach(p => (p.x -= PIPE_SPEED));
  pipes = pipes.filter(p => p.x + PIPE_WIDTH > -10);
}

function checkPipeCollision() {
  const pad = 5;
  const bx1 = bird.x + pad;
  const bx2 = bird.x + bird.width  - pad;
  const by1 = bird.y + pad;
  const by2 = bird.y + bird.height - pad;

  for (const p of pipes) {
    if (bx2 > p.x && bx1 < p.x + PIPE_WIDTH) {
      if (by1 < p.topHeight || by2 > p.bottomY) return true;
    }
  }
  return false;
}

function checkPipeScore() {
  for (const p of pipes) {
    if (!p.scored && p.x + PIPE_WIDTH < bird.x) {
      p.scored = true;
      score++;
      playSound(sounds.point);
      spawnFloatingText('+1', bird.x + bird.width, bird.y - 10, '#FFFFFF', 20);
    }
  }
}

function drawPipes() {
  pipes.forEach(p => {
    const px = Math.round(p.x);

    if (spriteLoaded) {
      const capH = 12;
      const ts   = pipeSpr.top;
      const bs   = pipeSpr.bottom;

      // ── Top pipe body
      const topBodyH = Math.max(0, p.topHeight - capH);
      if (topBodyH > 0) {
        for (let y = 0; y < topBodyH; y += ts.height - capH) {
          const h = Math.min(ts.height - capH, topBodyH - y);
          ctx.drawImage(spriteSheet, ts.x, ts.y, ts.width, h, px, y, PIPE_WIDTH, h);
        }
      }
      // Top cap
      ctx.drawImage(spriteSheet,
        ts.x, ts.y + ts.height - capH, ts.width, capH,
        px - 3, p.topHeight - capH, PIPE_WIDTH + 6, capH);

      // ── Bottom pipe cap + body
      ctx.drawImage(spriteSheet, bs.x, bs.y, bs.width, capH,
        px - 3, p.bottomY, PIPE_WIDTH + 6, capH);
      const btmBodyH = Math.max(0, canvas.height - p.bottomY - capH);
      for (let y = 0; y < btmBodyH; y += bs.height - capH) {
        const h = Math.min(bs.height - capH, btmBodyH - y);
        ctx.drawImage(spriteSheet, bs.x, bs.y + capH, bs.width, h,
          px, p.bottomY + capH + y, PIPE_WIDTH, h);
      }

    } else {
      // Fallback solid rectangles
      ctx.fillStyle = '#5cb85c';
      ctx.fillRect(px, 0, PIPE_WIDTH, p.topHeight);
      ctx.fillStyle = '#4cae4c';
      ctx.fillRect(px - 5, p.topHeight - 28, PIPE_WIDTH + 10, 28);

      ctx.fillStyle = '#5cb85c';
      ctx.fillRect(px, p.bottomY, PIPE_WIDTH, canvas.height);
      ctx.fillStyle = '#4cae4c';
      ctx.fillRect(px - 5, p.bottomY, PIPE_WIDTH + 10, 28);
    }
  });
}

function clearAllPipes() {
  pipes        = [];
  lastPipeTime = performance.now();
}
