let currentUser = null;
let partyPlayers = [];
let currentTurn = 0;
let playerErrors = [0, 0];
let duelCards = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedPairs = 0;
let totalPairs = 0;
let duelTimer = null;
let partyTimer = null;
let partyTimeoutSeconds = 5;

const emojiSets = {
  easy: ["🍎", "🍌", "🍇", "🍉"],
  medium: ["🍎", "🍌", "🍇", "🍉", "🥝", "🍒"],
  hard: ["🍎", "🍌", "🍇", "🍉", "🥝", "🍒", "🍓", "🍍"],
  extreme: ["🍎", "🍌", "🍇", "🍉", "🥝", "🍒", "🍓", "🍍", "🥥", "🥑"],
  impossible: ["🍎", "🍌", "🍇", "🍉", "🥝", "🍒", "🍓", "🍍", "🥥", "🥑", "🍔", "🍕"]
};

window.onload = () => {
  setTimeout(() => {
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('main-menu').style.display = 'flex';
  }, 2500);

  // Eye toggle handlers
  document.getElementById('login-eye').onclick = () => togglePassword('login-password');
  document.getElementById('register-eye').onclick = () => togglePassword('register-password');

  // Switch auth screens
  document.getElementById('to-register').onclick = () => switchScreen('login-screen', 'register-screen');
  document.getElementById('to-login').onclick = () => switchScreen('register-screen', 'login-screen');

  // Auth buttons
  document.getElementById('register-btn').onclick = register;
  document.getElementById('login-btn').onclick = login;

  // Game mode buttons
  document.getElementById('start-duel-btn').onclick = () => {
    showElement('duel-settings');
    clearGameBoard();
    setGameMessage('');
  };
  document.getElementById('duel-start-game-btn').onclick = startDuel;

  document.getElementById('start-party-btn').onclick = startPartyMode;

  document.getElementById('toggle-darkmode-btn').onclick = toggleDarkMode;

  document.getElementById('back-to-menu-btn').onclick = () => {
    backToMainMenu();
  };

  document.getElementById('winner-back-btn').onclick = () => {
    backToMainMenu();
  };
};

function togglePassword(id) {
  const input = document.getElementById(id);
  input.type = (input.type === 'password') ? 'text' : 'password';
}

function switchScreen(hideId, showId) {
  document.getElementById(hideId).style.display = 'none';
  document.getElementById(showId).style.display = 'block';
}

function register() {
  const user = document.getElementById('register-username').value.trim();
  const pass = document.getElementById('register-password').value.trim();
  if (!user || !pass) {
    alert("Please enter username and password.");
    return;
  }
  if (user.toLowerCase() === 'owner') {
    alert("Username 'Owner' is reserved.");
    return;
  }
  if (localStorage.getItem('user_' + user) !== null) {
    alert("Username already taken.");
    return;
  }
  localStorage.setItem('user_' + user, pass);
  alert("Registered successfully! Please login.");
  switchScreen('register-screen', 'login-screen');
}

function login() {
  const user = document.getElementById('login-username').value.trim();
  const pass = document.getElementById('login-password').value.trim();
  if (!user || !pass) {
    alert("Please enter username and password.");
    return;
  }
  if ((user.toLowerCase() === 'owner' && pass === 'ownerpass') || localStorage.getItem('user_' + user) === pass) {
    currentUser = user;
    document.getElementById('user-display').textContent = currentUser;
    showElement('game-screen');
    hideElement('main-menu');
    hideElement('duel-settings');
    clearGameBoard();
    setGameMessage('Choose a mode and start playing!');
  } else {
    alert("Wrong username or password.");
  }
}

function showElement(id) {
  document.getElementById(id).style.display = 'block';
}
function hideElement(id) {
  document.getElementById(id).style.display = 'none';
}

function clearGameBoard() {
  const board = document.getElementById('game-board');
  board.innerHTML = '';
}

function setGameMessage(msg) {
  document.getElementById('game-message').textContent = msg;
}

function backToMainMenu() {
  currentUser = null;
  partyPlayers = [];
  currentTurn = 0;
  playerErrors = [0, 0];
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  matchedPairs = 0;
  totalPairs = 0;
  clearTimeout(duelTimer);
  clearTimeout(partyTimer);

  hideElement('game-screen');
  hideElement('duel-settings');
  hideElement('winner-screen');
  showElement('main-menu');
  clearGameBoard();
  setGameMessage('');
}

function startDuel() {
  clearGameBoard();
  const level = document.getElementById('duel-level').value;
  const emojis = emojiSets[level];
  totalPairs = emojis.length;
  duelCards = [...emojis, ...emojis];
  shuffleArray(duelCards);

  const board = document.getElementById('game-board');
  board.style.gridTemplateColumns = `repeat(${Math.min(totalPairs, 6)}, 1fr)`;

  duelCards.forEach(emoji => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.value = emoji;
    card.textContent = '';
    card.onclick = () => revealCard(card);
    board.appendChild(card);
  });

  // Show all cards briefly, then hide
  duelCards.forEach((_, i) => {
    const card = board.children[i];
    card.textContent = card.dataset.value;
    card.classList.add('flip');
  });
  lockBoard = true;
  setGameMessage('Memorize the cards!');

  duelTimer = setTimeout(() => {
    duelCards.forEach((_, i) => {
      const card = board.children[i];
      card.textContent = '';
      card.classList.remove('flip');
    });
    lockBoard = false;
    setGameMessage('Match the pairs!');
  }, 1200);
}

function revealCard(card) {
  if (lockBoard) return;
  if (card === firstCard) return;

  card.textContent = card.dataset.value;
  card.classList.add('flip');

  if (!firstCard) {
    firstCard = card;
    return;
  }
  secondCard = card;
  lockBoard = true;

  if (firstCard.dataset.value === secondCard.dataset.value) {
    matchedPairs++;
    resetTurn();
    if (matchedPairs === totalPairs) {
      setGameMessage("🎉 You won the duel! 🎉");
    }
  } else {
    setTimeout(() => {
      firstCard.textContent = '';
      secondCard.textContent = '';
      firstCard.classList.remove('flip');
      secondCard.classList.remove('flip');
      resetTurn();
    }, 1000);
  }
}

function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

// Party mode

function startPartyMode() {
  partyPlayers = [currentUser];
  currentTurn = 0;
  playerErrors = [0];
  clearGameBoard();
  setGameMessage('');
  hideElement('duel-settings');
  showElement('game-screen');
  setGameMessage(`${partyPlayers[currentTurn]}'s turn!`);
  startTurnTimer();
}

function startTurnTimer() {
  clearTimeout(partyTimer);
  partyTimer = setTimeout(() => {
    playerErrors[currentTurn]++;
    setGameMessage(`${partyPlayers[currentTurn]} timed out! +1 error.`);
    nextPartyTurn();
  }, partyTimeoutSeconds * 1000);
}

function nextPartyTurn() {
  currentTurn++;
  if (currentTurn >= partyPlayers.length) {
    // End party game
    let minErrors = Math.min(...playerErrors);
    let winnerIndex = playerErrors.indexOf(minErrors);
    setGameMessage(`${partyPlayers[winnerIndex]} wins with ${minErrors} errors!`);
    showElement('winner-screen');
    hideElement('game-screen');
  } else {
    setGameMessage(`${partyPlayers[currentTurn]}'s turn!`);
    startTurnTimer();
  }
}
  
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}

// Utility: shuffle
function shuffleArray(array) {
  for(let i = array.length -1; i > 0; i--){
    const j = Math.floor(Math.random() * (i+1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
