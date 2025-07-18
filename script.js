// script.js

// Card symbols (8 pairs for 16 cards)
const symbols = ['🍎','🍌','🍇','🍒','🍉','🍍','🥝','🍓'];

let gameBoard = document.getElementById('game-board');
let welcomeScreen = document.getElementById('welcome-screen');
let gameContainer = document.getElementById('game-container');

let startBtn = document.getElementById('start-game-btn');
let toggleThemeBtn = document.getElementById('toggle-theme-btn');
let toggleMusicBtn = document.getElementById('toggle-music-btn');
let leaveGameBtn = document.getElementById('leave-game-btn');

let bgMusic = document.getElementById('bg-music');
let clickSound = document.getElementById('click-sound');
let matchSound = document.getElementById('match-sound');
let winSound = document.getElementById('win-sound');

let turnInfo = document.getElementById('turn-info');
let scoreInfo = document.getElementById('score-info');

let darkMode = false;
let musicOn = true;

// Game state variables
let deck = [];
let flippedCards = [];
let matchedCards = [];
let currentPlayer = 1;
let scores = {1: 0, 2: 0};
let canClick = true;

function shuffle(array) {
  // Fisher-Yates shuffle
  for(let i = array.length -1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createDeck() {
  let doubled = symbols.concat(symbols);
  deck = shuffle(doubled);
}

function createCard(symbol, index) {
  let card = document.createElement('div');
  card.classList.add('card');
  card.dataset.symbol = symbol;
  card.dataset.index = index;
  card.textContent = ''; // hidden initially

  card.addEventListener('click', () => {
    if (!canClick) return;
    if (flippedCards.length >= 2) return;
    if (flippedCards.includes(card)) return;
    if (matchedCards.includes(card)) return;

    flipCard(card);
  });

  return card;
}

function flipCard(card) {
  playClick();

  card.classList.add('flipped');
  card.textContent = card.dataset.symbol;
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    canClick = false;

    setTimeout(() => {
      checkMatch();
    }, 1000);
  }
}

function checkMatch() {
  let [card1, card2] = flippedCards;

  if (card1.dataset.symbol === card2.dataset.symbol) {
    // Match!
    card1.classList.add('matched');
    card2.classList.add('matched');
    matchedCards.push(card1, card2);
    scores[currentPlayer]++;
    updateScore();

    playMatch();

    // Check win condition
    if (matchedCards.length === deck.length) {
      endGame();
      return;
    }

    // Player gets another turn
    flippedCards = [];
    canClick = true;

  } else {
    // No match, flip back and switch player
    setTimeout(() => {
      card1.classList.remove('flipped');
      card1.textContent = '';
      card2.classList.remove('flipped');
      card2.textContent = '';

      flippedCards = [];
      switchPlayer();
      canClick = true;
    }, 800);
  }
}

function switchPlayer() {
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  turnInfo.textContent = `Player ${currentPlayer}'s Turn`;
}

function updateScore() {
  scoreInfo.textContent = `Player 1: ${scores[1]} | Player 2: ${scores[2]}`;
}

function endGame() {
  canClick = false;
  let winner;
  if (scores[1] > scores[2]) winner = 1;
  else if (scores[2] > scores[1]) winner = 2;
  else winner = 0; // tie

  if (winner === 0) {
    turnInfo.textContent = `It's a tie!`;
  } else {
    turnInfo.textContent = `Player ${winner} wins! 🎉`;
    playWin();
  }
}

function resetGame() {
  deck = [];
  flippedCards = [];
  matchedCards = [];
  currentPlayer = 1;
  scores = {1: 0, 2: 0};
  canClick = true;
  updateScore();
  turnInfo.textContent = `Player 1's Turn`;
  gameBoard.innerHTML = '';
  createDeck();

  for (let i = 0; i < deck.length; i++) {
    const card = createCard(deck[i], i);
    gameBoard.appendChild(card);
  }
}

function toggleTheme() {
  darkMode = !darkMode;
  if (darkMode) {
    document.body.classList.add('dark-mode');
    toggleThemeBtn.textContent = '☀️ Light Mode';
  } else {
    document.body.classList.remove('dark-mode');
    toggleThemeBtn.textContent = '🌙 Dark Mode';
  }
}

function toggleMusic() {
  musicOn = !musicOn;
  if (musicOn) {
    bgMusic.play();
    toggleMusicBtn.textContent = '🔈 Music: On';
  } else {
    bgMusic.pause();
    toggleMusicBtn.textContent = '🔇 Music: Off';
  }
}

function playClick() {
  if (musicOn) clickSound.play();
}

function playMatch() {
  if (musicOn) matchSound.play();
}

function playWin() {
  if (musicOn) winSound.play();
}

function leaveGame() {
  if (confirm('Are you sure you want to leave the game?')) {
    gameContainer.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
    resetGame();
    bgMusic.pause();
    bgMusic.currentTime = 0;
    musicOn = true;
    toggleMusicBtn.textContent = '🔈 Music: On';
  }
}

// Event Listeners
startBtn.addEventListener('click', () => {
  welcomeScreen.classList.add('hidden');
  gameContainer.classList.remove('hidden');
  resetGame();
  if (musicOn) bgMusic.play();
});

toggleThemeBtn.addEventListener('click', toggleTheme);
toggleMusicBtn.addEventListener('click', toggleMusic);
leaveGameBtn.addEventListener('click', leaveGame);
