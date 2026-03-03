/* ─────────────────────────────────────────
   FLOATING  TEXT  EFFECTS
───────────────────────────────────────── */
let floaters = [];

function spawnFloatingText(text, x, y, color, size) {
  floaters.push({ text, x, y, color, size, alpha: 1, life: 55 });
}

function updateFloaters() {
  floaters = floaters.filter(f => f.life > 0);
  floaters.forEach(f => {
    f.y    -= 1.1;
    f.life--;
    f.alpha = f.life / 55;
  });
}

function drawFloaters() {
  floaters.forEach(f => {
    ctx.save();
    ctx.globalAlpha      = f.alpha;
    ctx.font             = `bold ${f.size}px Arial Black, Arial`;
    ctx.textAlign        = 'center';
    ctx.textBaseline     = 'bottom';
    ctx.strokeStyle      = '#000';
    ctx.lineWidth        = 3;
    ctx.strokeText(f.text, f.x, f.y);
    ctx.fillStyle        = f.color;
    ctx.fillText(f.text,   f.x, f.y);
    ctx.restore();
  });
}
