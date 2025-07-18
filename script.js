// Game & UI variables
let currentUser = null;

// Party mode vars
const parties = {}; // store parties by code
let currentParty = null; // current party code for player
let playerErrors = {};
let currentTurnIndex = 0;
let turnTimer = null;

// Duel mode vars
let duelFirstCard = null;
let duelSecondCard = null;
let duelLockBoard = false;
let duelMatchedPairs = 0;
let duelTotalPairs = 0;

const emojiSets = {
  easy: ["🍎", "🍌", "🍇", "🍉"],               // 4 pairs
  medium: ["🍎", "🍌", "🍇", "🍉", "🥝", "🍒"],  // 6 pairs
  hard: ["🍎", "🍌", "🍇", "🍉", "🥝", "🍒", "🍓", "🍍"], // 8 pairs
  extreme: ["🍎", "🍌", "🍇", "🍉", "🥝", "🍒", "🍓", "🍍", "🥥", "🥑"], // 10 pairs
  impossible: ["🍎","🍌","🍇","🍉","🥝","🍒","🍓","🍍","🥥","🥑","🥭","🍋"] // 12 pairs
};

const revealTimes = {
  easy: 1200,
  medium: 1500,
  hard: 1800,
  extreme: 2000,
  impossible: 2200
};

const ownerUser = "Owner";
const ownerPass = "ownerpass";

// --- UTILS ---
function generatePartyCode() {
  return Math.random().toString(36).substr(2, 5).toUpperCase();
}

function shuffleArray(arr) {
  for(let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// --- DOM helpers ---
function show(element) {
  element.classList.remove('hidden');
}
function hide(element) {
  element.classList.add('hidden');
}
function hideAllScreens() {
  const screens = [
    'welcome-screen', 'main-menu', 'login-screen', 'register-screen',
    'game-menu', 'duel-screen', 'party-create-screen', 'party-join-screen',
    'party-game-screen', 'winner-screen'
  ];
  screens.forEach(id => {
    let el = document.getElementById(id);
    if(el) hide(el);
  });
}

// --- PASSWORD TOGGLE ---
function setupPasswordToggle() {
  const loginEye = document.getElementById('login-eye');
  const registerEye = document.getElementById('register-eye');
  loginEye.onclick = () => togglePassword('login-password', loginEye);
  registerEye.onclick = () => togglePassword('register-password', registerEye);
}
function togglePassword(inputId, eyeEl) {
  const input = document.getElementById(inputId);
  if(input.type === 'password') {
    input.type = 'text';
    eyeEl.textContent = '🙈';
  } else {
    input.type = 'password';
    eyeEl.textContent = '👁️';
  }
}

// --- AUTH ---
function setupAuth() {
  document.getElementById('to-register').onclick = () => {
    hide(document.getElementById('login-screen'));
    show(document.getElementById('register-screen'));
  };
  document.getElementById('to-login').onclick = () => {
    hide(document.getElementById('register-screen'));
    show(document.getElementById('login-screen'));
  };

  document.getElementById('register-btn').onclick = () => {
    const u = document.getElementById('register-username').value.trim();
    const p = document.getElementById('register-password').value.trim();

    if(!u || !p) return alert("Please enter username and password.");
    if(u === ownerUser) return alert("Username 'Owner' is reserved.");
    if(localStorage.getItem("user_" + u) !== null) return alert("Username already taken.");

    localStorage.setItem("user_" + u, p);
    alert("Registered successfully!");
    // Switch back to login
    document.getElementById('register-username').value = '';
    document.getElementById('register-password').value = '';
    hide(document.getElementById('register-screen'));
    show(document.getElementById('login-screen'));
  };

  document.getElementById('login-btn').onclick = () => {
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value.trim();

    if(!u || !p) return alert("Please enter username and password.");

    if((u === ownerUser && p === ownerPass) || localStorage.getItem("user_" + u) === p) {
      currentUser = u;
      document.getElementById('user-display').textContent = currentUser;
      alert("Welcome, " + currentUser + "! Login successful.");
      showGameMenu();
    } else {
      alert("Wrong username or password.");
    }
  };
}

// --- SHOW GAME MENU ---
function showGameMenu() {
  hideAllScreens();
  show(document.getElementById('game-menu'));
}

// --- LOGOUT ---
function setupLogout() {
  document.getElementById('logout-btn').onclick = () => {
    currentUser = null;
    hideAllScreens();
    show(document.getElementById('main-menu'));
    // Clear input fields
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
  };
}

// --- DUEL MODE ---
function setupDuelMode() {
  const duelBtn = document.getElementById('start-duel-btn');
  const duelScreen = document.getElementById('duel-screen');
  const duelBackBtns = duelScreen.querySelectorAll('.back-btn');
  const duelStartBtn = document.getElementById('duel-start-game-btn');

  duelBtn.onclick = () => {
    hideAllScreens();
    show(duelScreen);
    document.getElementById('duel-message').textContent = '';
  };

  duelBackBtns.forEach(btn => btn.onclick = () => {
    hideAllScreens();
    show(document.getElementById('game-menu'));
    clearDuelBoard();
  });

  duelStartBtn.onclick = () => startDuelGame();
}

function clearDuelBoard() {
  const board = document.getElementById('duel-game-board');
  board.innerHTML = '';
  duelFirstCard = null;
  duelSecondCard = null;
  duelLockBoard = false;
  duelMatchedPairs = 0;
  duelTotalPairs = 0;
  document.getElementById('duel-message').textContent = '';
}

function startDuelGame() {
  clearDuelBoard();

  const level = document.getElementById('duel-difficulty').value;
  const emojis = emojiSets[level];
  duelTotalPairs = emojis.length;

  const deck = [...emojis, ...emojis];
  shuffleArray(deck);

  const board = document.getElementById('duel-game-board');
  board.style.gridTemplateColumns = `repeat(${Math.min(6, duelTotalPairs)}, 1fr)`;

  // Create cards with front/back for flip effect
  deck.forEach(emoji => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.value = emoji;

    const front = document.createElement('div');
    front.className = 'front';
    front.textContent = '';

    const back = document.createElement('div');
    back.className = 'back';
    back.textContent = emoji;

    card.appendChild(front);
    card.appendChild(back);

    card.onclick = () => duelRevealCard(card);

    board.appendChild(card);
  });

  // Show all cards briefly
  const cards =
