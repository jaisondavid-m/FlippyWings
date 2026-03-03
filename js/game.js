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

  // Keep START button pinned just below the home image
  if (gameState === 'start') {
    document.getElementById('startBtn').style.top =
      (homeImgBottomPct * 100 + 2) + '%';
  }

  requestAnimationFrame(loop);
}

/* ─────────────────────────────────────────
   BOOT
───────────────────────────────────────── */
showStartUI();
requestAnimationFrame(loop);
