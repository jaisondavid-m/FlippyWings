/* ─────────────────────────────────────────
   BACKGROUND  &  GROUND
───────────────────────────────────────── */
const bgSprite     = { x: 0,   y: 0, width: 144, height: 256 };
const groundSprite = { x: 146, y: 0, width: 154, height: 56  };

let bgX     = 0;
let groundX = 0;

function drawBackground() {
  // Sky fill
  ctx.fillStyle = '#70c5ce';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (spriteLoaded) {
    const cropY = 60;
    const cropH = 150;
    const scale = 2.7;
    const sw    = bgSprite.width * scale;
    const sh    = cropH * scale;
    const byPos = GROUND_Y - sh;
    const tiles = Math.ceil(canvas.width / sw) + 2;
    for (let i = 0; i < tiles; i++) {
      ctx.drawImage(
        spriteSheet,
        bgSprite.x, bgSprite.y + cropY, bgSprite.width, cropH,
        bgX * scale + i * sw, byPos, sw, sh
      );
    }
  }
}

function drawGround() {
  if (spriteLoaded) {
    const tiles = Math.ceil(canvas.width / groundSprite.width) + 1;
    for (let i = 0; i < tiles; i++) {
      ctx.drawImage(
        spriteSheet,
        groundSprite.x, groundSprite.y, groundSprite.width, groundSprite.height,
        Math.round(groundX + i * groundSprite.width), GROUND_Y,
        groundSprite.width, 80
      );
    }
  } else {
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, GROUND_Y, canvas.width, 15);
  }
}
