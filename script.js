// Global vars
let currentUser = null;

// Audio setup
const bgMusic = document.getElementById('background-music');
const masterVolumeControl = document.getElementById('master-volume');
const musicVolumeControl = document.getElementById('music-volume');

function setVolumes() {
  const masterVol = parseFloat(masterVolumeControl.value);
  const musicVol = parseFloat(musicVolumeControl.value);
  bgMusic.volume = masterVol * musicVol;
}

// Welcome screen fade
window.onload = () => {
  setTimeout(() => {
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('main-container').style.display = 'block';
  }, 2500);

  // Setup audio volumes
  setVolumes();

  masterVolumeControl.addEventListener('input', setVolumes);
  musicVolumeControl.addEventListener('input', setVolumes);

  bgMusic.play().catch(() => {}); // Try to autoplay (may require user interaction)

  // Eye icons toggle password
  document.getElementById('login-eye').onclick = () => togglePassword('login-password');
  document.getElementById('register-eye').onclick = () => togglePassword('register-password');

  // Switch login/register screens
  document.getElementById('to-register').onclick = () => switchAuthScreens('register');
  document.getElementById('to-login').onclick = () => switchAuthScreens('login');

  // Auth buttons
  document.getElementById('register-btn').onclick = register;
  document.getElementById('login-btn').onclick = login;

  // Main menu buttons
  document.getElementById('btn-duel').onclick = showDuelScreen;
  document.getElementById('btn-party').onclick = showPartyScreen;
  document.getElementById('btn-settings').onclick = showSettingsScreen;
  document.getElementById('btn-logout').onclick = logout;

  // Back buttons
  document.querySelectorAll('.btn-back').forEach(btn => {
    btn.onclick = () => {
      hideAllScreens();
      document.getElementById('menu-screen').style.display = 'block';
    };
  });

  // Duel mode buttons
  document.getElementById('start-duel-btn').onclick = startDuelGame;

  // Party mode buttons
  document.getElementById('create-party-btn').onclick = createParty;
  document.getElementById('join-party-btn').onclick = joinParty;
  document.getElementById('party-end-turn').onclick = endPartyTurn;

  // Initialize
  showAuthScreen();
};

// Toggle password visibility
function togglePassword(id) {
  const input = document.getElementById(id);
  input.type = input.type === 'password' ? 'text' : 'password';
}

// Show either login or register screens
function switchAuthScreens(screen) {
  if (screen === 'login') {
    document.getElementById('login-screen').style.display = 'block';
    document.getElementById('register-screen').style.display = 'none';
  } else {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('register-screen').style.display = 'block';
  }
}

function showAuthScreen() {
  hideAllScreens();
  document.getElementById('auth-container').style.display = 'block';
  document.getElementById('menu-screen').style.display = 'none';
  document.getElementById('duel-screen').style.display = 'none';
  document.getElementById('party-screen').style.display = 'none';
  document.getElementById('settings-screen').style.display = 'none';
}

// Simple localStorage user registration
function register() {
  const user = document.getElementById('register-username').value.trim();
  const pass = document.getElementById('register-password').value.trim();

  if (!user || !pass) {
    alert('Please enter username and password.');
    return;
  }
  if (user === 'Owner') {
    alert('Username "Owner" is reserved.');
    return;
  }
  if (localStorage.getItem('user_' + user) !== null) {
    alert('Username already taken.');
    return;
  }

  localStorage.setItem('user_' + user, pass);
  alert('Registered successfully! Please login.');
  switchAuthScreens('login');
}

// Login function
function login() {
  const user = document.getElementById('login-username').value.trim();
  const pass = document.getElementById('login-password').value.trim();

  if (!user || !pass) {
    alert('Please enter username and password.');
    return;
  }

  const storedPass = localStorage.getItem('user_' + user);
  if ((user === 'Owner' && pass === 'ownerpass') || storedPass === pass) {
    currentUser = user;
    alert(`Welcome, ${user}! Login successful.`);
    showMenuScreen();
  } else {
    alert('Wrong username or password.');
  }
}

function logout() {
  currentUser = null;
  showAuthScreen();
}

function showMenuScreen() {
  hideAllScreens();
  document.getElementById('menu-screen').style.display = 'block';
}

// Hide all screens helper
function hideAllScreens() {
  ['auth-container', 'menu-screen', 'duel-screen', 'party-screen', 'settings-screen'].forEach(id => {
    document.getElementById(id).style.display = 'none';
  });
}

/* ======= Duel Mode Logic ======= */

const emojiSets = {
  easy: ["🍎", "🍌", "🍇", "🍉"],
  medium: ["🍎", "🍌", "🍇", "🍉", "🥝", "🍒"],
  hard: ["🍎", "🍌", "🍇", "🍉", "🥝", "🍒", "🍓", "🍍"],
  extreme: ["🍎", "🍌", "🍇", "🍉", "🥝", "🍒", "🍓", "🍍", "🥥", "🥑"],
  impossible: ["🍎", "🍌", "🍇", "🍉", "🥝", "🍒", "🍓", "🍍", "🥥", "🥑", "🥭", "🍅"]
};

let duelFirstCard = null;
let duelSecondCard = null;
let duelLockBoard = false;
let duelMatchedPairs = 0;
let duelTotalPairs = 0;

function startDuelGame() {
  resetDuelBoard();
  const level = document.getElementById('duel-level').value;
  const emojis = emojiSets[level];
  duelTotalPairs = emojis.length;

  const deck = [...emojis, ...emojis];
  deck.sort(() => Math.random() - 0.5);

  const board = document.getElementById('duel-game-board');
  board.style.gridTemplateColumns = `repeat(${Math.min(duelTotalPairs, 6)}, 1fr)`;

  deck.forEach(emoji => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.value = emoji;
    card.textContent = '';
    card.onclick = () => duelReveal(card);
    board.appendChild(card);
  });

  const cards = board.querySelectorAll('.card');
  cards.forEach(card => {
    card.textContent = card.dataset.value;
    card.classList.add('flip');
  });

  duelLockBoard = true;
  setTimeout(() => {
    cards.forEach(card => {
      card.textContent = '';
      card.classList.remove('flip');
    });
    duelLockBoard = false;
  }, 1200);
}

function resetDuelBoard() {
  duelFirstCard = null;
  duelSecondCard = null;
  duelLockBoard = false;
  duelMatchedPairs = 0;
  document.getElementById('duel-game-message').textContent = '';
  document.getElementById('duel-game-board').innerHTML = '';
}

function duelReveal(card) {
  if (duelLockBoard) return;
  if (card === duelFirstCard) return;

  card.classList.add('flip');
  card.textContent = card.dataset.value;

  if (!duelFirstCard) {
    duelFirstCard = card;
    return;
  }

  duelSecondCard = card;
  duelLockBoard = true;

  if (duelFirstCard.dataset.value === duelSecondCard.dataset.value) {
    duelMatchedPairs++;
    resetDuelTurn();
    checkDuelWin();
  } else {
    setTimeout(() => {
      duelFirstCard.classList.remove('flip');
      duelSecondCard.classList.remove('flip');
      duelFirstCard.textContent = '';
      duelSecondCard.textContent = '';
      resetDuelTurn();
    }, 1000);
  }
}

function resetDuelTurn() {
  duelFirstCard = null;
  duelSecondCard = null;
  duelLockBoard = false;
}

function checkDuelWin() {
  if (duelMatchedPairs === duelTotalPairs) {
    document.getElementById('duel-game-message').textContent = "You won the duel! 🎉";
  }
}

/* ======= Party Mode Logic ======= */

let partyPlayers = [];
let currentPartyTurn = 0;
let partyPlayerErrors = [];
let partyGameStarted = false;
let partyTimeout = null;
let partyCurrentDifficulty = 'easy';
let partyCode = null;

function generatePartyCode() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

function createParty() {
  partyPlayers = [currentUser];
  currentPartyTurn = 0;
  partyPlayerErrors = [0];
  partyGameStarted = false;
  partyCurrentDifficulty = document.getElementById('party-difficulty').value;
  partyCode = generatePartyCode();

  localStorage.setItem('party_' + partyCode, JSON.stringify({
    players: partyPlayers,
    errors: partyPlayerErrors,
    difficulty: partyCurrentDifficulty,
    turn: currentPartyTurn,
    gameStarted: partyGameStarted
  }));

  showPartyScreen(true);
}

function joinParty() {
  const code = document.getElementById('join-code-input').value.trim().toUpperCase();
  if (!code) {
    alert('Please enter a party code.');
    return;
  }

  const partyDataStr = localStorage.getItem('party_' + code);
  if (!partyDataStr) {
    alert('Party not found or expired.');
    return;
  }

  let partyData = JSON.parse(partyDataStr);

  if (partyData.players.includes(currentUser)) {
    alert('You are already in this party.');
    return;
  }

  partyPlayers = partyData.players;
  partyPlayerErrors = partyData.errors;
  partyCurrentDifficulty = partyData.difficulty;
  currentPartyTurn = partyData.turn;
  partyGameStarted = partyData.gameStarted;
  partyCode = code;

  partyPlayers.push(currentUser);
  partyPlayerErrors.push(0);

  // Save updated party
  localStorage.setItem('party_' + partyCode, JSON.stringify({
    players: partyPlayers,
    errors: partyPlayerErrors,
    difficulty: partyCurrentDifficulty,
    turn: currentPartyTurn,
    gameStarted: partyGameStarted
  }));

  showPartyScreen(false);
}

function showPartyScreen(isCreator) {
  hideAllScreens();
  document.getElementById('party-screen').style.display = 'block';

  const info = document.getElementById('party-info');
  info.innerHTML = `<strong>Party Code:</strong> ${partyCode}<br><strong>Players:</strong> ${partyPlayers.join(', ')}<br><strong>Difficulty:</strong> ${partyCurrentDifficulty.charAt(0).toUpperCase() + partyCurrentDifficulty.slice(1)}`;

  if (!partyGameStarted) {
    if (partyPlayers.length > 1) {
      partyGameStarted = true;
      startPartyGame();
    } else {
      info.innerHTML += `<br>Waiting for more players to join...`;
    }
  }
}

let partyDeck = [];
let partyFirstCard = null;
let partySecondCard = null;
let partyLockBoard = false;
let partyMatchedPairs = 0;
let partyTotalPairs = 0;

function startPartyGame() {
  // Build deck
  const emojis = emojiSets[partyCurrentDifficulty];
  partyTotalPairs = emojis.length;
  partyMatchedPairs = 0;
  partyLockBoard = false;
  partyFirstCard = null;
  partySecondCard = null;
  partyGameStarted = true;

  // Build deck with pairs and shuffle
  partyDeck = [...emojis, ...emojis];
  partyDeck.sort(() => Math.random() - 0.5);

  const board = document.getElementById('party-game-board');
  board.style.gridTemplateColumns = `repeat(${Math.min(partyTotalPairs, 6)}, 1fr)`;
  board.innerHTML = '';

  partyDeck.forEach(emoji => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.value = emoji;
    card.textContent = '';
    card.onclick = () => partyReveal(card);
    board.appendChild(card);
  });

  // Show cards for 1.2s then hide
  const cards = board.querySelectorAll('.card');
  cards.forEach(card => {
    card.textContent = card.dataset.value;
    card.classList.add('flip');
  });
  partyLockBoard = true;

  setTimeout(() => {
    cards.forEach(card => {
      card.textContent = '';
      card.classList.remove('flip');
    });
    partyLockBoard = false;
    updatePartyTurnUI();
    startTurnTimer();
  }, 1200);
}

function partyReveal(card) {
  if (partyLockBoard) return;
  if (card === partyFirstCard) return;

  card.classList.add('flip');
  card.textContent = card.dataset.value;

  if (!partyFirstCard) {
    partyFirstCard = card;
    return;
  }

  partySecondCard = card;
  partyLockBoard = true;

  if (partyFirstCard.dataset.value === partySecondCard.dataset.value) {
    partyMatchedPairs++;
    resetPartyTurn();

    // Update errors: no error for correct match
    savePartyData();

    if (partyMatchedPairs === partyTotalPairs) {
      partyWin();
    } else {
      // Continue current player's turn
      partyLockBoard = false;
    }
  } else {
    // Wrong match -> after 1 sec flip back and add +1 error then next player's turn
    setTimeout(() => {
      partyFirstCard.classList.remove('flip');
      partySecondCard.classList.remove('flip');
      partyFirstCard.textContent = '';
      partySecondCard.textContent = '';
      partyPlayerErrors[currentPartyTurn]++;
      resetPartyTurn();
      savePartyData();
      nextPartyTurn();
    }, 1000);
  }
}

function resetPartyTurn() {
  partyFirstCard = null;
  partySecondCard = null;
  partyLockBoard = false;
}

function partyWin() {
  document.getElementById('party-message').textContent = `Party finished! Winner: ${partyPlayers.reduce((a, b, i) => partyPlayerErrors[i] < partyPlayerErrors[a] ? i : a, 0)}`;
  document.getElementById('party-end-turn').style.display = 'none';
  clearTimeout(partyTimeout);
}

function nextPartyTurn() {
  currentPartyTurn = (currentPartyTurn + 1) % partyPlayers.length;
  updatePartyTurnUI();
  startTurnTimer();
}

function updatePartyTurnUI() {
  const info = document.getElementById('party-info');
  info.innerHTML = `<strong>Party Code:</strong> ${partyCode}<br><strong>Players:</strong> ${partyPlayers.join(', ')}<br><strong>Difficulty:</strong> ${partyCurrentDifficulty.charAt(0).toUpperCase() + partyCurrentDifficulty.slice(1)}<br><strong>Turn:</strong> ${partyPlayers[currentPartyTurn]}`;
  document.getElementById('party-message').textContent = '';
  document.getElementById('party-end-turn').style.display = 'inline-block';
}

function startTurnTimer() {
  clearTimeout(partyTimeout);
  partyTimeout = setTimeout(() => {
    partyPlayerErrors[currentPartyTurn]++;
    alert(`${partyPlayers[currentPartyTurn]} took too long! +1 error.`);
    nextPartyTurn();
  }, 5000);
}

function endPartyTurn() {
  clearTimeout(partyTimeout);
  nextPartyTurn();
  document.getElementById('party-message').textContent = '';
  partyLockBoard = false;
  partyFirstCard = null;
  partySecondCard = null;
  partyLockBoard = false;
  savePartyData();
}

function savePartyData() {
  localStorage.setItem('party_' + partyCode, JSON.stringify({
    players: partyPlayers,
    errors: partyPlayerErrors,
    difficulty: partyCurrentDifficulty,
    turn: currentPartyTurn,
    gameStarted: partyGameStarted
  }));
}

/* ======= Settings Screen ======= */

function showSettingsScreen() {
  hideAllScreens();
  document.getElementById('settings-screen').style.display = 'block';
}
