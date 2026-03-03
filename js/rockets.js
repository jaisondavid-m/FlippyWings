/* ─────────────────────────────────────────
   ROCKET  CLASS
───────────────────────────────────────── */
class Rocket {
  constructor(canvas, customY = null, customSpeed = null, xOffset = 0) {
    this.canvas = canvas;
    this.width  = 45;
    this.height = 56;
    this.x      = canvas.width + this.width + xOffset;
    this.y      = customY     !== null ? customY     : 60 + Math.random() * (canvas.height - 200);
    this.speed  = customSpeed !== null ? customSpeed : 1.8 + Math.random() * 1;

    this.sprite          = { x: 138, y: 50, width: 224, height: 400 };
    this.trail           = [];
    this.trailTimer      = 0;
    this.showWarning     = true;
    this.warningDuration = 600;
    this.warningPhase    = 0;
    this.warningAlpha    = 1;
    this.spawnTime       = Date.now();
    this.velocityY       = 0;
    this.affectedByGravity = false;
  }

  applyGravity() {
    this.affectedByGravity = true;
    this.velocityY = 0;
  }

  update() {
    const elapsed = Date.now() - this.spawnTime;
    if (elapsed < this.warningDuration) {
      this.showWarning  = true;
      this.warningPhase += 0.15;
      this.warningAlpha  = 0.5 + Math.sin(this.warningPhase) * 0.5;
      return;
    }

    this.showWarning = false;
    this.x -= this.speed;

    if (this.affectedByGravity) {
      this.velocityY += 0.5;
      this.y         += this.velocityY;
      this.speed     *= 0.98;
    }

    // Trail particles
    this.trailTimer++;
    if (this.trailTimer % 2 === 0) {
      this.trail.push({
        x:       this.x + this.width,
        y:       this.y + this.height / 2 + (Math.random() - 0.5) * 8,
        size:    3 + Math.random() * 4,
        alpha:   0.8,
        life:    15 + Math.random() * 10,
        maxLife: 25,
        vx:      1 + Math.random() * 2,
        vy:      (Math.random() - 0.5) * 1.5,
      });
    }

    for (let i = this.trail.length - 1; i >= 0; i--) {
      const p = this.trail[i];
      p.x    += p.vx;
      p.y    += p.vy;
      p.life--;
      p.alpha  = Math.max(0, p.life / p.maxLife) * 0.8;
      p.size  *= 0.95;
      if (p.life <= 0) this.trail.splice(i, 1);
    }
  }

  draw() {
    const c = canvas.getContext('2d');

    if (this.showWarning) {
      c.save();
      c.globalAlpha = this.warningAlpha;
      const wx = canvas.width - 30;
      const wy = this.y + this.height / 2;
      c.fillStyle = '#FF2200';
      c.beginPath();
      c.moveTo(wx + 15, wy);
      c.lineTo(wx, wy - 10);
      c.lineTo(wx, wy + 10);
      c.closePath();
      c.fill();
      c.font      = 'bold 14px Arial';
      c.textAlign = 'center';
      c.fillText('!', wx - 8, wy + 5);
      c.restore();
      return;
    }

    // Trail
    this.trail.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      g.addColorStop(0,   '#FFA500');
      g.addColorStop(0.5, '#FF4500');
      g.addColorStop(1,   'rgba(255,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Rocket sprite
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(-Math.PI / 2);
    if (imgOK.rocket) {
      ctx.drawImage(
        imgs.rocket,
        this.sprite.x, this.sprite.y, this.sprite.width, this.sprite.height,
        -this.width / 2, -this.height / 2, this.width, this.height
      );
    } else {
      this._fallback(ctx);
    }
    ctx.restore();
  }

  _fallback(c) {
    c.fillStyle = '#CC0000';
    c.beginPath();
    c.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#FF0000';
    c.beginPath();
    c.moveTo(this.width / 2, 0);
    c.lineTo(this.width / 2 - 10, -this.height / 2 + 2);
    c.lineTo(this.width / 2 - 10,  this.height / 2 - 2);
    c.closePath();
    c.fill();
    c.fillStyle = '#FFA500';
    c.beginPath();
    c.moveTo(-this.width / 2, -3);
    c.lineTo(-this.width / 2 - 14 - Math.random() * 5, 0);
    c.lineTo(-this.width / 2, 3);
    c.closePath();
    c.fill();
    c.fillStyle = '#87CEEB';
    c.beginPath();
    c.arc(4, 0, 4, 0, Math.PI * 2);
    c.fill();
  }

  getBounds() {
    return {
      x:      this.x + 5,
      y:      this.y + 3,
      width:  this.width  - 10,
      height: this.height - 6,
    };
  }

  isOffScreen() { return this.x + this.width < -20 || this.y > canvas.height + 60; }
  isActive()    { return (Date.now() - this.spawnTime) >= this.warningDuration; }
}

/* ─────────────────────────────────────────
   ROCKET  SYSTEM  (formation waves)
───────────────────────────────────────── */
const rocketSystem = {
  rockets:            [],
  explosions:         [],
  scoreThreshold:     10,
  nextWaveScore:      10,
  formationsPerWave:  3,
  formationsSpawned:  0,
  waveActive:         false,
  lastSpawnTime:      0,
  nextSpawnDelay:     0,
  waveWarningTimer:   0,
  waveWarningAlpha:   0,

  /* ── Public ── */

  update(sc) {
    const now = Date.now();
    if (!this.waveActive && sc >= this.nextWaveScore) {
      this._startWave();
      clearAllPipes();
    }
    if (this.waveActive && this.formationsSpawned < this.formationsPerWave) {
      if (now - this.lastSpawnTime >= this.nextSpawnDelay) {
        this._spawnFormation();
        this.lastSpawnTime     = now;
        this.formationsSpawned++;
        this.nextSpawnDelay    = 2500 + Math.random() * 2000;
        if (this.formationsSpawned >= this.formationsPerWave) this._endWave();
      }
    }
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      this.rockets[i].update();
      if (this.rockets[i].isOffScreen()) this.rockets.splice(i, 1);
    }
    this._updateExplosions();
  },

  checkCollision(bird) {
    const bb = bird.getBounds();
    for (let i = 0; i < this.rockets.length; i++) {
      const r = this.rockets[i];
      if (!r.isActive()) continue;
      const rb = r.getBounds();
      if (
        bb.x < rb.x + rb.width  && bb.x + bb.width  > rb.x &&
        bb.y < rb.y + rb.height && bb.y + bb.height > rb.y
      ) {
        this._spawnExplosion(r.x + r.width / 2, r.y + r.height / 2);
        this.rockets.splice(i, 1);
        return true;
      }
    }
    return false;
  },

  draw() {
    this._drawWaveWarning();
    for (const r of this.rockets) r.draw();

    for (const ex of this.explosions) {
      // Flash
      if (ex.flashTimer > 0) {
        ctx.save();
        ctx.globalAlpha = ex.flashAlpha * 0.3;
        ctx.fillStyle   = '#FFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }
      // Shockwave
      if (ex.shockwave) {
        const sw = ex.shockwave;
        ctx.save();
        ctx.globalAlpha = sw.alpha;
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth   = 3;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      // Blast image
      if (ex.blastImg && imgOK.blast) {
        const bi = ex.blastImg;
        const bw = 80 * bi.scale;
        const bh = 80 * bi.scale;
        ctx.save();
        ctx.globalAlpha = bi.alpha;
        ctx.drawImage(imgs.blast, ex.x - bw / 2, ex.y - bh / 2, bw, bh);
        ctx.restore();
      }
      // Particles
      ex.particles.forEach(p => {
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle   = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    ctx.globalAlpha = 1;
  },

  reset() {
    this.rockets           = [];
    this.explosions        = [];
    this.lastSpawnTime     = 0;
    this.nextWaveScore     = this.scoreThreshold;
    this.formationsSpawned = 0;
    this.waveActive        = false;
    this.nextSpawnDelay    = 0;
    this.waveWarningTimer  = 0;
    this.waveWarningAlpha  = 0;
  },

  /* ── Private ── */

  _startWave() {
    this.waveActive        = true;
    this.formationsSpawned = 0;
    this.lastSpawnTime     = Date.now();
    this.nextSpawnDelay    = 1200 + Math.random() * 800;
    this.waveWarningTimer  = 130;
    this.waveWarningAlpha  = 1;
  },

  _endWave() {
    this.waveActive    = false;
    this.nextWaveScore += 15;
  },

  _spawnFormation() {
    const rH   = 56;
    const gap  = 150;
    const topM = 60;
    const btmM = 140;
    const playH = canvas.height - topM - btmM;
    const zoneH = (playH - gap) / 3;
    const gapPos = Math.random() < 0.5 ? 1 : 2;
    const speed  = 1.8 + Math.random() * 0.7;
    const xOff   = [0, 100 + Math.random() * 50, 220 + Math.random() * 80];
    let yPos;

    if (gapPos === 1) {
      yPos = [
        topM + Math.random() * 30,
        topM + zoneH + gap + Math.random() * 30,
        canvas.height - btmM - rH - Math.random() * 30,
      ];
    } else {
      yPos = [
        topM + Math.random() * 30,
        topM + zoneH + Math.random() * 30,
        canvas.height - btmM - rH - Math.random() * 30,
      ];
    }

    for (let i = 0; i < 3; i++) {
      this.rockets.push(new Rocket(canvas, yPos[i], speed, xOff[i]));
    }
  },

  _spawnExplosion(x, y) {
    playSound(sounds.blast);
    const cols = ['#FF4500', '#FFA500', '#FFD700', '#FF0000', '#FFFF00'];
    const exp  = { particles: [], flashAlpha: 1, flashTimer: 10, x, y };

    for (let i = 0; i < 25; i++) {
      const angle = (Math.PI * 2 / 25) * i;
      const sp    = 2 + Math.random() * 6;
      exp.particles.push({
        x, y,
        vx:      Math.cos(angle) * sp,
        vy:      Math.sin(angle) * sp,
        size:    3 + Math.random() * 5,
        alpha:   1,
        life:    30 + Math.random() * 20,
        maxLife: 50,
        color:   cols[i % cols.length],
        gravity: 0.08,
        decay:   0.96,
      });
    }
    // Smoke puffs
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      exp.particles.push({
        x, y,
        vx:      Math.cos(angle) * 1.5,
        vy:      Math.sin(angle) * 1.5,
        size:    10,
        alpha:   0.5,
        life:    40,
        maxLife: 40,
        color:   '#555',
        gravity: -0.02,
        decay:   0.97,
      });
    }

    exp.shockwave = { x, y, radius: 5, maxRadius: 80, alpha: 0.8, speed: 4 };
    exp.blastImg  = { x, y, alpha: 1, scale: 0.3, growSpeed: 0.15 };
    this.explosions.push(exp);
  },

  _updateExplosions() {
    for (let e = this.explosions.length - 1; e >= 0; e--) {
      const ex = this.explosions[e];

      if (ex.flashTimer > 0) {
        ex.flashTimer--;
        ex.flashAlpha = ex.flashTimer / 10;
      }
      if (ex.shockwave) {
        ex.shockwave.radius += ex.shockwave.speed;
        ex.shockwave.alpha  *= 0.92;
        if (ex.shockwave.radius >= ex.shockwave.maxRadius) ex.shockwave = null;
      }
      if (ex.blastImg) {
        ex.blastImg.scale += ex.blastImg.growSpeed;
        ex.blastImg.alpha -= 0.05;
        if (ex.blastImg.alpha <= 0) ex.blastImg = null;
      }

      let allDead = true;
      for (let i = ex.particles.length - 1; i >= 0; i--) {
        const p  = ex.particles[i];
        p.x     += p.vx;
        p.y     += p.vy;
        p.vy    += p.gravity;
        p.vx    *= p.decay;
        p.vy    *= p.decay;
        p.life--;
        p.alpha  = Math.max(0, p.life / p.maxLife);
        p.size  *= 0.98;
        if (p.life <= 0) ex.particles.splice(i, 1);
        else allDead = false;
      }
      if (allDead && ex.flashTimer <= 0 && !ex.shockwave && !ex.blastImg) {
        this.explosions.splice(e, 1);
      }
    }
  },

  _drawWaveWarning() {
    if (!this.waveWarningTimer || this.waveWarningTimer <= 0) return;
    this.waveWarningTimer--;
    this.waveWarningAlpha =
      Math.min(1, this.waveWarningTimer / 30) *
      (0.6 + 0.4 * Math.sin(this.waveWarningTimer * 0.25));

    ctx.save();
    ctx.globalAlpha = this.waveWarningAlpha;
    const pulse = 1 + 0.08 * Math.sin(this.waveWarningTimer * 0.3);
    ctx.translate(canvas.width / 2, canvas.height / 2 - 60);
    ctx.scale(pulse, pulse);
    ctx.fillStyle    = '#FF2200';
    ctx.strokeStyle  = '#FFD700';
    ctx.lineWidth    = 3;
    ctx.font         = 'bold 24px Arial Black, Arial';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeText('⚠ ROCKETS INCOMING! ⚠', 0, 0);
    ctx.fillText('⚠ ROCKETS INCOMING! ⚠', 0, 0);
    ctx.restore();
    ctx.globalAlpha = 1;
  },
};
