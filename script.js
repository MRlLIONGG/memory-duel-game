let currentUser = null;
let partyPlayers = [];
let currentTurn = 0;
let playerErrors = [0, 0];

// Wait for DOM load
window.onload = () => {
  setTimeout(() => {
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('main-menu').style.display = 'flex';
  }, 2500);
};

// Password toggle function
function togglePassword(id) {
  const input = document.getElementById(id);
  if (input.type === 'password') {
    input.type = 'text';
  } else {
    input.type = 'password';
  }
}
document.getElementById('login-eye').onclick = () => togglePassword('login-password');
document.getElementById('register-eye').onclick = () => togglePassword('register-password');

// Switch between login and register screens
const toRegister = document.getElementById('to-register');
const toLogin = document.getElementById('to-login');
const loginScreen = document.getElementById('login-screen');
const registerScreen = document.getElementById('register-screen');

toRegister.onclick = () => {
  loginScreen.style.display = 'none';
  registerScreen.style.display = 'block';
};
toLogin.onclick = () => {
  registerScreen.style.display = 'none';
  loginScreen.style.display = 'block';
};

// Login/Register logic
const ownerUser = 'Owner';
const ownerPass = 'ownerpass';

document.getElementById('register-btn').onclick = () => {
  const u = document.getElementById('register-username').value.trim();
  const p = document.getElementById('register-password').value.trim();

  if (!u || !p) return alert('Please enter username and password.');
  if (u === ownerUser) return alert('Username "Owner" is reserved.');
  if (localStorage.getItem('user_' + u) !== null) return alert('Username already taken.');

  localStorage.setItem('user_' + u, p);
  alert('Registered successfully! Please login.');
  toLogin.onclick();
};

document.getElementById('login-btn').onclick = () => {
  const u = document.getElementById('login-username').value.trim();
  const p = document.getElementById('login-password').value.trim();

  if (!u || !p) return alert('Please enter username and password.');

  if ((u === ownerUser && p === ownerPass) || localStorage.getItem('user_' + u) === p) {
    currentUser = u;
    alert('Welcome, ' + u + '! Login successful.');
    showGameScreen();
  } else {
    alert('Wrong username or password.');
  }
};

// Show game screen and update UI
function showGameScreen() {
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('game-screen').style.display = 'flex';
  document.getElementById('user-display').textContent = currentUser;
  document.getElementById('game-message').textContent = 'Choose a mode to start playing.';
  clearBodyModes();
}

// Clear all mode classes from body
function clearBodyModes() {
  document.body.classList.remove('dark-mode', 'duel-mode', 'party-mode');
}

// Dark mode toggle button
document.getElementById('darkmode-btn').onclick = () => {
  document.body.classList.toggle('dark-mode');
  // Remove other modes if enabled
  document.body.classList.remove('duel-mode', 'party-mode');
  document.getElementById('game-message').textContent = 'Dark mode toggled.';
};

// Duel mode button
document.getElementById('duelmode-btn').onclick = () => {
  clearBodyModes();
  document.body.classList.add('duel-mode');
  document.getElementById('game-message').textContent = 'Duel mode started! (Game logic not implemented yet)';
};

// Party mode button
document.getElementById('partymode-btn').onclick = () => {
  clearBodyModes();
  document.body.classList.add('party-mode');
  startPartyMode();
};

// Logout button
document.getElementById('logout-btn').onclick = () => {
  currentUser = null;
  clearBodyModes();
  document.getElementById('game-screen').style.display = 'none';
  document.getElementById('main-menu').style.display = 'flex';
};

// PARTY MODE FUNCTIONS
function startPartyMode() {
  // For demo, 2 players: currentUser and "Player 2"
  partyPlayers = [currentUser, "Player 2"];
  currentTurn = 0;
  playerErrors = [0, 0];
  document.getElementById('game-message').textContent = `${partyPlayers[currentTurn]}'s turn. Click "End Turn" when done.`;
  showPartyControls();
}

function showPartyControls() {
  if (!document.getElementById('end-turn-btn')) {
    const btn = document.createElement('button');
    btn.id = 'end-turn-btn';
    btn.textContent = 'End Turn';
    btn.onclick = endTurn;
    document.getElementById('mode-buttons').appendChild(btn);
  }
}

function hidePartyControls() {
  const btn = document.getElementById('end-turn-btn');
  if (btn) btn.remove();
}

function endTurn() {
  // Random errors made in this turn (demo)
  const errorsMade = Math.floor(Math.random() * 5);
  playerErrors[currentTurn] += errorsMade;
  currentTurn++;
  if (currentTurn >= partyPlayers.length) {
    // Game over
    hidePartyControls();
    showWinner();
  } else {
    document.getElementById('game-message').textContent = `${partyPlayers[currentTurn]}'s turn. Click "End Turn" when done.`;
  }
}

function showWinner() {
  document.getElementById('game-screen').style.display = 'none';
  const minErrors = Math.min(...playerErrors);
  const winnerIndex = playerErrors.indexOf(minErrors);
  document.getElementById('winner-text').textContent =
    `${partyPlayers[winnerIndex]} wins with ${minErrors} error(s)!`;
  document.getElementById('winner-screen').style.display = 'flex';
}

// Back to menu button on winner screen
document.getElementById('back-menu-btn').onclick = () => {
  document.getElementById('winner-screen').style.display = 'none';
  showGameScreen();
};
