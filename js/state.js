/* ─────────────────────────────────────────
   PERSISTENT  STATE  (localStorage)
───────────────────────────────────────── */
let bestScore   = parseInt(localStorage.getItem('flippy-best')        || '0');
let totalCoins  = parseInt(localStorage.getItem('flippy-total-coins') || '0');
let walletCoins = parseInt(localStorage.getItem('flippy-coins')       || '0');

/* ─────────────────────────────────────────
   RUNTIME  STATE
───────────────────────────────────────── */
// Possible values: 'start' | 'playing' | 'dead'
let gameState        = 'start';
let isPaused         = false;

// Fraction of canvas height where the home image bottom edge sits.
// Updated every frame in drawHomeScreen() and used to position the START button.
let homeImgBottomPct = 0.65;

let score     = 0;
let coinCount = 0;
