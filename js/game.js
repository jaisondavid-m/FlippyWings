/* ─────────────────────────────────────────
   GAME  LIFECYCLE
───────────────────────────────────────── */

/** Reset everything and start a fresh round. */
function startGame() {
  score         = 0;
  coinCount     = 0;
  coins         = [];
  floaters      = [];
  pipes         = [];
  lastPipeTime  = 0;
  bgX           = 0;
  groundX       = 0;

  bird.x        = canvas.width  / 2 - 20;
  bird.y        = canvas.height * 0.35;
  bird.velocity = bird.jumpStrength;
  bird.rotation = 0;
  bird.frame    = 0;

  gameState = 'playing';
  isPaused  = false;

  rocketSystem.reset();
  document.getElementById('pauseBtn').textContent = '⏸';
  showPlayingUI();

  sounds.die.pause();
  sounds.die.currentTime = 0;
  playSound(sounds.swoosh);
  setTimeout(() => playSound(sounds.mainTheme), 300);
}

/** Kill the player and transition to the dead state. */
function triggerGameOver(byPipe) {
  if (gameState !== 'playing') return;
  gameState     = 'dead';
  bird.velocity = -3;

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('flippy-best', bestScore);
  }

  sounds.mainTheme.pause();
  sounds.mainTheme.currentTime = 0;
  playSound(byPipe ? sounds.hit : sounds.die);
  setTimeout(showGameOverUI, 700);
}

/* ─────────────────────────────────────────
   MAIN  LOOP
───────────────────────────────────────── */
function loop(now) {

  /* ── Update phase ── */
  if (gameState === 'playing' && !isPaused) {
    // Scroll background
    bgX -= BG_SPEED;
    if (bgX <= -bgSprite.width) bgX = 0;
    groundX -= GROUND_SPEED;
    if (groundX <= -20) groundX = 0;

    // Bird physics
    bird.velocity += bird.gravity;
    if (bird.velocity > 10) bird.velocity = 10;
    bird.y        += bird.velocity;
    bird.rotation  = Math.min(Math.max(bird.velocity * 5, -30), 90);

    if (bird.y < 0) { bird.y = 0; bird.velocity = 0; }
    if (bird.y + bird.height >= GROUND_Y) {
      bird.y = GROUND_Y - bird.height;
      triggerGameOver(true);
    }

    // Pipes (suppressed during rocket wave)
    if (!rocketSystem.waveActive) updatePipes(now);
    checkPipeScore();
    if (checkPipeCollision()) triggerGameOver(true);

    // Pickups & FX
    updateCoins();
    updateFloaters();

    // Rockets
    const wasWave = rocketSystem.waveActive;
    rocketSystem.update(score);
    if (wasWave && !rocketSystem.waveActive) {
      spawnPipe(now);
      lastPipeTime = now;
    }
    if (rocketSystem.checkCollision(bird)) triggerGameOver(false);
  }

  // Dead-bird fall animation
  if (gameState === 'dead') {
    bird.velocity += bird.gravity;
    if (bird.velocity > 10) bird.velocity = 10;
    bird.y        += bird.velocity;
    bird.rotation  = 90;
    if (bird.y + bird.height >= GROUND_Y) bird.y = GROUND_Y - bird.height;
    rocketSystem._updateExplosions();
  }

  /* ── Draw phase ── */
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawHomeScreen();       // no-op unless gameState === 'start'
  drawPipes();
  drawCoins();
  rocketSystem.draw();
  if (gameState !== 'start') drawGround();
  if (gameState !== 'start') drawBird(now);
  drawHUD();
  drawFloaters();
  drawPauseOverlay();
  drawSidePreview();
  drawLeftPreview();

  // Keep START button pinned just below the home image
  if (gameState === 'start') {
    document.getElementById('startBtn').style.top =
      (homeImgBottomPct * 100 + 2) + '%';
  }

  requestAnimationFrame(loop);
}

/* ─────────────────────────────────────────
   SIDE  PREVIEW  (right blue strip)
───────────────────────────────────────── */
/**
 * Draws a seamless continuation of the game world into the right-side
 * blue strip: sky, city background, upcoming pipes, and ground.
 * Only runs when the preview canvas is visible (wide screens).
 */
function drawSidePreview() {
  if (!previewCtx || previewCanvas.style.display === 'none') return;
  const pw = previewCanvas.width;
  const ph = previewCanvas.height;

  // ── Sky fill
  previewCtx.fillStyle = '#70c5ce';
  previewCtx.fillRect(0, 0, pw, ph);

  // ── City background (continuation from game canvas right edge)
  if (spriteLoaded) {
    const bgScale = 2.7;
    const cropY   = 60, cropH = 150;
    const sw      = bgSprite.width  * bgScale;  // tile width  (~388.8)
    const sh      = cropH           * bgScale;
    const byPos   = GROUND_Y - sh;
    // phase: how far into the tile we are at game x=400 (= preview x=0)
    const phase   = ((400 - bgX * bgScale) % sw + sw) % sw;
    const count   = Math.ceil((pw + phase) / sw) + 1;
    for (let i = 0; i < count; i++) {
      previewCtx.drawImage(
        spriteSheet,
        bgSprite.x, bgSprite.y + cropY, bgSprite.width, cropH,
        Math.round(-phase + i * sw), byPos, sw, sh
      );
    }
  }

  // ── Upcoming pipes (those still to the right of the game canvas)
  pipes.forEach(p => {
    const drawX = Math.round(p.x - 400);
    if (drawX + PIPE_WIDTH < 0 || drawX > pw) return;   // outside strip

    if (spriteLoaded) {
      const capH = 12;
      const ts   = pipeSpr.top;
      const bs   = pipeSpr.bottom;

      // Top body
      const topBodyH = Math.max(0, p.topHeight - capH);
      for (let y = 0; y < topBodyH; y += ts.height - capH) {
        const h = Math.min(ts.height - capH, topBodyH - y);
        previewCtx.drawImage(spriteSheet, ts.x, ts.y, ts.width, h,
          drawX, y, PIPE_WIDTH, h);
      }
      // Top cap
      previewCtx.drawImage(spriteSheet,
        ts.x, ts.y + ts.height - capH, ts.width, capH,
        drawX - 3, p.topHeight - capH, PIPE_WIDTH + 6, capH);

      // Bottom cap
      previewCtx.drawImage(spriteSheet, bs.x, bs.y, bs.width, capH,
        drawX - 3, p.bottomY, PIPE_WIDTH + 6, capH);
      // Bottom body
      const btmBodyH = Math.max(0, ph - p.bottomY - capH);
      for (let y = 0; y < btmBodyH; y += bs.height - capH) {
        const h = Math.min(bs.height - capH, btmBodyH - y);
        previewCtx.drawImage(spriteSheet, bs.x, bs.y + capH, bs.width, h,
          drawX, p.bottomY + capH + y, PIPE_WIDTH, h);
      }
    } else {
      previewCtx.fillStyle = '#5cb85c';
      previewCtx.fillRect(drawX, 0, PIPE_WIDTH, p.topHeight);
      previewCtx.fillStyle = '#4cae4c';
      previewCtx.fillRect(drawX - 5, p.topHeight - 28, PIPE_WIDTH + 10, 28);
      previewCtx.fillStyle = '#5cb85c';
      previewCtx.fillRect(drawX, p.bottomY, PIPE_WIDTH, ph);
      previewCtx.fillStyle = '#4cae4c';
      previewCtx.fillRect(drawX - 5, p.bottomY, PIPE_WIDTH + 10, 28);
    }
  });

  // ── Ground (continuation from game canvas right edge)
  if (spriteLoaded) {
    const gw      = groundSprite.width;   // 154
    // phase: tile offset at game x=400 (= preview x=0)
    const phase_g = ((400 - groundX) % gw + gw) % gw;
    const count_g = Math.ceil((pw + phase_g) / gw) + 1;
    for (let i = 0; i < count_g; i++) {
      previewCtx.drawImage(
        spriteSheet,
        groundSprite.x, groundSprite.y, groundSprite.width, groundSprite.height,
        Math.round(-phase_g + i * gw), GROUND_Y, gw, 80
      );
    }
  } else {
    previewCtx.fillStyle = '#DEB887';
    previewCtx.fillRect(0, GROUND_Y, pw, ph - GROUND_Y);
    previewCtx.fillStyle = '#8B4513';
    previewCtx.fillRect(0, GROUND_Y, pw, 15);
  }
}

/* ─────────────────────────────────────────
   PAST  VIEW  (left blue strip)
───────────────────────────────────────── */
/**
 * Draws the portion of the game world that has already scrolled off the
 * left edge of the game canvas: sky, city background, passed pipes, ground.
 * The left canvas shows game coords from -previewWidth to 0.
 * preview_x = game_x + previewWidth
 */
function drawLeftPreview() {
  if (!pastCtx || pastCanvas.style.display === 'none') return;
  const lw = pastCanvas.width;
  const lh = pastCanvas.height;

  // ── Sky fill
  pastCtx.fillStyle = '#70c5ce';
  pastCtx.fillRect(0, 0, lw, lh);

  // ── City background (continuation to the left of game canvas x=0)
  if (spriteLoaded) {
    const bgScale = 2.7;
    const cropY   = 60, cropH = 150;
    const sw      = bgSprite.width * bgScale;
    const sh      = cropH          * bgScale;
    const byPos   = GROUND_Y - sh;
    // at left-preview x=0  →  game x = -lw
    const phase   = ((-lw - bgX * bgScale) % sw + sw) % sw;
    const count   = Math.ceil((lw + phase) / sw) + 1;
    for (let i = 0; i < count; i++) {
      pastCtx.drawImage(
        spriteSheet,
        bgSprite.x, bgSprite.y + cropY, bgSprite.width, cropH,
        Math.round(-phase + i * sw), byPos, sw, sh
      );
    }
  }

  // ── Pipes (those that have scrolled to the left of game x=0)
  pipes.forEach(p => {
    const drawX = Math.round(p.x + lw);   // game x → left-preview x
    if (drawX + PIPE_WIDTH < 0 || drawX > lw) return;  // outside strip

    if (spriteLoaded) {
      const capH = 12;
      const ts   = pipeSpr.top;
      const bs   = pipeSpr.bottom;

      // Top body
      const topBodyH = Math.max(0, p.topHeight - capH);
      for (let y = 0; y < topBodyH; y += ts.height - capH) {
        const h = Math.min(ts.height - capH, topBodyH - y);
        pastCtx.drawImage(spriteSheet, ts.x, ts.y, ts.width, h,
          drawX, y, PIPE_WIDTH, h);
      }
      // Top cap
      pastCtx.drawImage(spriteSheet,
        ts.x, ts.y + ts.height - capH, ts.width, capH,
        drawX - 3, p.topHeight - capH, PIPE_WIDTH + 6, capH);
      // Bottom cap
      pastCtx.drawImage(spriteSheet, bs.x, bs.y, bs.width, capH,
        drawX - 3, p.bottomY, PIPE_WIDTH + 6, capH);
      // Bottom body
      const btmBodyH = Math.max(0, lh - p.bottomY - capH);
      for (let y = 0; y < btmBodyH; y += bs.height - capH) {
        const h = Math.min(bs.height - capH, btmBodyH - y);
        pastCtx.drawImage(spriteSheet, bs.x, bs.y + capH, bs.width, h,
          drawX, p.bottomY + capH + y, PIPE_WIDTH, h);
      }
    } else {
      pastCtx.fillStyle = '#5cb85c';
      pastCtx.fillRect(drawX, 0, PIPE_WIDTH, p.topHeight);
      pastCtx.fillStyle = '#4cae4c';
      pastCtx.fillRect(drawX - 5, p.topHeight - 28, PIPE_WIDTH + 10, 28);
      pastCtx.fillStyle = '#5cb85c';
      pastCtx.fillRect(drawX, p.bottomY, PIPE_WIDTH, lh);
      pastCtx.fillStyle = '#4cae4c';
      pastCtx.fillRect(drawX - 5, p.bottomY, PIPE_WIDTH + 10, 28);
    }
  });

  // ── Ground (continuation to the left)
  if (spriteLoaded) {
    const gw      = groundSprite.width;
    const phase_g = ((-lw - groundX) % gw + gw) % gw;
    const count_g = Math.ceil((lw + phase_g) / gw) + 1;
    for (let i = 0; i < count_g; i++) {
      pastCtx.drawImage(
        spriteSheet,
        groundSprite.x, groundSprite.y, groundSprite.width, groundSprite.height,
        Math.round(-phase_g + i * gw), GROUND_Y, gw, 80
      );
    }
  } else {
    pastCtx.fillStyle = '#DEB887';
    pastCtx.fillRect(0, GROUND_Y, lw, lh - GROUND_Y);
    pastCtx.fillStyle = '#8B4513';
    pastCtx.fillRect(0, GROUND_Y, lw, 15);
  }
}

/* ─────────────────────────────────────────
   BOOT
───────────────────────────────────────── */
showStartUI();
requestAnimationFrame(loop);
