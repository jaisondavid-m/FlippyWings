/* ─────────────────────────────────────────
   BIRD
───────────────────────────────────────── */
const bird = {
  width:  40,
  height: 30,
  x: canvas.width  / 2 - 20,
  y: canvas.height * 0.35,
  velocity:     0,
  gravity:      0.25,
  jumpStrength: -6,
  rotation:     0,
  frame:        0,
  lastFrame:    0,
  frameInterval: 100,
  frames: [
    { x: 223, y: 124, width: 17, height: 12 },
    { x: 264, y: 90,  width: 17, height: 12 },
    { x: 264, y: 64,  width: 17, height: 12 },
  ],

  getBounds() {
    const p = 5;
    return {
      x:      this.x + p,
      y:      this.y + p,
      width:  this.width  - p * 2,
      height: this.height - p * 2,
    };
  },
};

function drawBird(now) {
  if (now - bird.lastFrame > bird.frameInterval) {
    bird.frame     = (bird.frame + 1) % bird.frames.length;
    bird.lastFrame = now;
  }

  ctx.save();
  ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
  ctx.rotate(bird.rotation * Math.PI / 180);

  if (spriteLoaded) {
    const f = bird.frames[bird.frame];
    ctx.drawImage(
      spriteSheet,
      f.x, f.y, f.width, f.height,
      -bird.width / 2, -bird.height / 2, bird.width, bird.height
    );
  } else {
    // Fallback shape
    ctx.fillStyle = '#f4d03f';
    ctx.beginPath();
    ctx.ellipse(0, 0, bird.width / 2, bird.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8a200';
    ctx.beginPath();
    ctx.moveTo(bird.width / 2 - 4, -4);
    ctx.lineTo(bird.width / 2 + 8,  0);
    ctx.lineTo(bird.width / 2 - 4,  4);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

function flap() {
  if (gameState !== 'playing' || isPaused) return;
  bird.velocity = bird.jumpStrength;
  playSound(sounds.flap);
}
