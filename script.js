let currentUser = null;
let partyPlayers = [];
let currentTurn = 0;
let playerErrors = [0, 0];

// Duel game state
let duelCards = [];
let flippedCards = [];
let matchedCount = 0;

window.onload = () => {
  setTimeout(() => {
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('main-menu').style.display = 'flex';
  }, 2500);
};

// Password toggle
function togglePassword(id) {
  const input = document.getElementById(id);
  input.type = input.type === 'password' ? 'text' : 'password';
}
document.getElementById('login-eye').onclick = () => togglePassword('login-password');
document.getElementById('register-eye').onclick = () => togglePassword('register-password');

// Switch login/register
document.getElementById('to-register').onclick = () => {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('register-screen').style.display = 'block';
};
document.getElementById('to-login').onclick = () => {
  document.getElementById('register-screen').style.display = 'none';
  document.getElementById('login-screen').style.display = 'block';
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
  document.getElementById('to-login').onclick();
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

function showGameScreen() {
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('game-screen').style.display = 'flex';
  document.getElementById('user-display').textContent = currentUser;
  document.getElementById('game-message').textContent = 'Choose a mode to start playing.';
  clearBodyModes();
  clearDuelGame();
}

// Clear body modes classes
function clearBodyModes() {
  document.body.classList.remove('dark-mode', 'duel-mode', 'party-mode');
}

// Dark mode toggle
document.getElementById('darkmode-btn').onclick = () => {
  document.body.classList.toggle('dark-mode');
  document.body.classList.remove('duel-mode', 'party-mode');
  document.getElementById('game-message').textContent = 'Dark mode toggled.';
};

// Duel mode button
document.getElementById('duelmode-btn').onclick = () => {
  clearBodyModes();
  document.body.classList.add('duel-mode');
  startDuelGame();
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
  clearDuelGame();
  document.getElementById('game-screen').style.display = 'none';
  document.getElementById('main-menu').style.display = 'flex';
  document.getElementById('game-message').textContent = '';
};

/* ====== DUEL GAME LOGIC ====== */
const emojiCards = ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼'];
// 8 pairs, total 16 cards

function startDuelGame() {
  matchedCount = 0;
  flippedCards = [];
  duelCards = shuffle([...emojiCards, ...emojiCards]); // 16 cards shuffled

  const duelGame = document.getElementById('duel-game');
  duelGame.innerHTML = '';
  duelGame.style.display = 'grid';
  document.getElementById('game-message').textContent = 'Match pairs by clicking cards!';

  duelCards.forEach((emoji, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.index = i;
    card.dataset.emoji = emoji;
    card.textContent = ''; // Hidden by default
    card.onclick = () => flipCard(card);
    duelGame.appendChild(card);
  });
}

function clearDuelGame() {
  const duelGame = document.getElementById('duel-game');
  duelGame.innerHTML = '';
  duelGame.style.display = 'none';
}

function flipCard(card) {
  if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
  if (flippedCards.length >= 2) return; // Wait for checking

  card.classList.add('flipped');
  card.textContent = card.dataset.emoji;
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    setTimeout(checkMatch, 800);
  }
}

function checkMatch() {
  const [card1, card2] = flippedCards;
  if (card1.dataset.emoji === card2.dataset.emoji) {
    card1.classList.add('matched');
    card2.classList.add('matched');
    matchedCount += 2;
    document.getElementById('game-message').textContent = `Matched pair! ${matchedCount} / 16 matched.`;
    if (matchedCount === duelCards.length) {
      document.getElementById('game-message').textContent = 'You matched all pairs! You win!';
    }
  } else {
    card1.classList.remove('flipped');
    card2.classList.remove('flipped');
    card1.textContent = '';
    card2.textContent = '';
    document.getElementById('game-message').textContent = 'Try again!';
  }
  flippedCards = [];
}

/* ====== PARTY MODE LOGIC (demo) ====== */
function startPartyMode() {
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

// Utility shuffle
function shuffle(array) {
  let currentIndex = array.length, randomIndex;

  while(currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // Swap
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
}
