/* ─────────────────────────────────────────
   SPRITE  SHEET
───────────────────────────────────────── */
const spriteSheet = new Image();
let   spriteLoaded = false;
spriteSheet.onload = () => { spriteLoaded = true; };
spriteSheet.src    = 'assets/images/flappybirdassets.png';

/* ─────────────────────────────────────────
   INDIVIDUAL  IMAGES
───────────────────────────────────────── */
function loadImg(src) {
  const i = new Image();
  i.src = src;
  return i;
}

const imgs = {
  coin:   loadImg('assets/images/coin.png'),
  blast:  loadImg('assets/images/blast.png'),
  home:   loadImg('assets/images/flappy-bird-home.png'),
  rocket: loadImg('assets/images/rocket.png'),
};

const imgOK = {};
Object.keys(imgs).forEach(k => {
  imgs[k].onload  = () => { imgOK[k] = true; };
  imgs[k].onerror = () => { imgOK[k] = false; };
});

/* ─────────────────────────────────────────
   AUDIO
───────────────────────────────────────── */
function makeAudio(src, vol = 0.7) {
  const a = new Audio(src);
  a.volume = vol;
  return a;
}

const sounds = {
  flap:      makeAudio('assets/sounds/flap.mp3',    0.7),
  die:       makeAudio('assets/sounds/die.mp3',     0.8),
  hit:       makeAudio('assets/sounds/flappy-bird-hit-sound.mp3', 0.8),
  point:     makeAudio('assets/sounds/point.mp3',   0.6),
  swoosh:    makeAudio('assets/sounds/swoosh.mp3',  0.5),
  blast:     makeAudio('assets/sounds/blast.mp3',   0.7),
  mainTheme: makeAudio('assets/sounds/MainTheme.mp3', 0.45),
};
sounds.mainTheme.loop = true;

function playSound(snd) {
  try { snd.currentTime = 0; snd.play().catch(() => {}); } catch (e) {}
}
