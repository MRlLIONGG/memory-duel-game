console.log("script.js loaded");

let currentUser = null;

const ownerUser = "Owner";
const ownerPass = "ownerpass";

// Duel emojis sets
const duelEmojiSets = {
  easy: ["🍎", "🍌", "🍇", "🍉"],               // 4 pairs
  medium: ["🍎", "🍌", "🍇", "🍉", "🥝", "🍒"],  // 6 pairs
  hard: ["🍎", "🍌", "🍇", "🍉", "🥝", "🍒", "🍓", "🍍"], // 8 pairs
  extreme: ["🍎", "🍌", "🍇", "🍉", "🥝", "🍒", "🍓", "🍍", "🥥", "🥑"], // 10 pairs
  impossible: ["🍎","🍌","🍇","🍉","🥝","🍒","🍓","🍍","🥥","🥑","🍋","🥭"] // 12 pairs
};

// Duel mode variables
let duelBoardLocked = false;
let firstCard = null;
let secondCard = null;
let matchedPairs = 0;
let totalPairs = 0;

// Party mode variables
let partyCode = null;
let partyData = null;
let partyPollingInterval = null;
let partyGameStarted = false;
let partyCurrentTurn = 0;
let partyErrors = [];
let partyEmojis = [];
let partyFirstCard = null;
let partySecondCard = null;
let partyBoardLocked = false;

// UTILITIES

function shuffleArray(array) {
  for (let i = array.length -1; i >0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function generatePartyCode() {
  // 4 letter uppercase random code
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";
  for(let i=0; i<4; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return code;
}

function savePartyData() {
  if (!partyCode || !partyData) return;
  localStorage.setItem("party_" + partyCode, JSON.stringify(partyData));
}

function loadPartyData(code) {
  const d = localStorage.getItem("party_" + code);
  if (!d) return null;
  try {
    return JSON.parse(d);
  } catch(e) {
    return null;
  }
}

// WELCOME & LOGIN

window.onload = () => {
  setTimeout(() => {
    document.getElementById("welcome-screen").style.display = "none";
    document.getElementById("main-menu").style.display = "flex";
  }, 2500);
};

// Switch login/register screens
document.getElementById("to-register").onclick = () => {
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("register-screen").style.display = "block";
};
document.getElementById("to-login").onclick = () => {
  document.getElementById("register-screen").style.display = "none";
  document.getElementById("login-screen").style.display = "block";
};

// Registration logic
document.getElementById("register-btn").onclick = () => {
  let u = document.getElementById("register-username").value.trim();
  let p = document.getElementById("register-password").value.trim();
  if (!u || !p) return alert("Please enter username and password.");
  if (u === ownerUser) return alert('Username "Owner" is reserved.');
  if (localStorage.getItem("user_" + u) !== null) return alert("Username already taken.");

  localStorage.setItem("user_" + u, p);
  alert("Registered successfully! Please login.");
  document.getElementById("register-screen").style.display = "none";
  document.getElementById("login-screen").style.display = "block";
};

// Login logic
document.getElementById("login-btn").onclick = () => {
  let u = document.getElementById("login-username").value.trim();
  let p = document.getElementById("login-password").value.trim();

  if (!u || !p) return alert("Please enter username and password.");

  if ((u === ownerUser && p === ownerPass) || localStorage.getItem("user_" + u) === p) {
    currentUser = u;
    alert("Welcome, " + u + "! Login successful.");
    showGameScreen();
  } else {
    alert("Wrong username or password.");
  }
};

// Show game screen after login
function showGameScreen() {
  document.getElementById("main-menu").style.display = "none";
  document.getElementById("game-screen").style.display = "block";
  document.getElementById("user-display").textContent = currentUser;
}

// Logout
document.getElementById("logout-btn").onclick = () => {
  currentUser = null;
  document.getElementById("game-screen").style.display = "none";
  document.getElementById("main-menu").style.display = "flex";
  clearDuelBoard();
  clearParty();
};

// Dark mode toggle
document.getElementById("dark-mode-toggle").onclick = () => {
  document.body.classList.toggle("dark-mode");
};

// === DUEL MODE ===

document.getElementById("start-duel-btn").onclick = () => {
  startDuelMode();
};

function startDuelMode() {
  clearDuelBoard();
  const level = document.getElementById("duel-level").value;
  const emojis = duelEmojiSets[level];
  totalPairs = emojis.length;
  matchedPairs = 0;
  duelBoardLocked = true;

  const deck = [...emojis, ...emojis];
  shuffleArray(deck);

  const board = document.getElementById("duel-game-board");

  const cols = Math.min(totalPairs, 6);
  board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  deck.forEach(emoji => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.value = emoji;
    card.textContent = emoji; // show face up initially
    board.appendChild(card);
  });

  setTimeout(() => {
    const cards = board.querySelectorAll(".card");
    cards.forEach(card => {
      card.textContent = "";
      card.classList.remove("flip");
      card.onclick = () => duelCardClick(card);
    });
    duelBoardLocked = false;
    document.getElementById("duel-message").textContent = "Match all pairs!";
  }, 1200);
}

function duelCardClick(card) {
  if (duelBoardLocked) return;
  if (card === firstCard) return;

  card.textContent = card.dataset.value;
  card.classList.add("flip");

  if (!firstCard) {
    firstCard = card;
    return;
  }
  secondCard = card;
  duelBoardLocked = true;

  if (firstCard.dataset.value === secondCard.dataset.value) {
    matchedPairs++;
    firstCard = null;
    secondCard = null;
    duelBoardLocked = false;
    document.getElementById("duel-message").textContent = `Good! Pairs matched: ${matchedPairs} / ${totalPairs}`;
    if (matchedPairs === totalPairs) {
      document.getElementById("duel-message").textContent = "🎉 You won Duel Mode! 🎉";
    }
  } else {
    setTimeout(() => {
      firstCard.textContent = "";
      secondCard.textContent = "";
      firstCard.classList.remove("flip");
      secondCard.classList.remove("flip");
      firstCard = null;
      secondCard = null;
      duelBoardLocked = false;
      document.getElementById("duel-message").textContent = "Try again!";
    }, 900);
  }
}

function clearDuelBoard() {
  const board = document.getElementById("duel-game-board");
  board.innerHTML = "";
  firstCard = null;
  secondCard = null;
  duelBoardLocked = false;
  document.getElementById("duel-message").textContent = "";
}

// === PARTY MODE ===

// Elements
const partyStatus = document.getElementById("party-status");
const partyCodeDisplay = document.getElementById("party-code-display");
const partyPlayersList = document.getElementById("party-players-list");
const partyDifficultyVotes = document.getElementById("party-difficulty-votes");
const partyVoteMessage = document.getElementById("party-vote-message");
const partyLobby = document.getElementById("party-lobby");
const partySetup = document.getElementById("party-setup");
const partyGame = document.getElementById("party-game");
const partyTurnInfo = document.getElementById("party-turn-info");
const partyGameBoard = document.getElementById("party-game-board");
const partyEndTurnBtn = document.getElementById("party-end-turn-btn");
const partyErrorInfo = document.getElementById("party-error-info");
const partyWinner = document.getElementById("party-winner");
const partyBackBtn = document.getElementById("party-back-btn");

// Difficulty options (same as Duel)
const difficulties = ["easy","medium","hard","extreme","impossible"];
const difficultyLabels = {
  easy: "🍎 Easy",
  medium: "🍌 Medium",
  hard: "🍇 Hard",
  extreme: "🍉 Extreme",
  impossible: "🥝 Impossible"
};

// Emojis for party (same as duel)
const partyEmojisMap = duelEmojiSets;

// Party create/join buttons
document.getElementById("create-party-btn").onclick = () => {
  if (!currentUser) { alert("You must be logged in!"); return; }
  partyCode = generatePartyCode();
  partyData = {
    code: partyCode,
    players: [currentUser],
    votes: {},
    started: false,
    turn: 0,
    errors: [],
    difficulty: null,
    flippedCards: [],
    matchedPairs: 0,
  };
  savePartyData();
  partyStatus.textContent = "Party created! Share the code with your friend.";
  partyCodeDisplay.textContent = partyCode;
  updatePartyPlayersList();
  showPartyLobby();
  startPartyPolling();
};

document.getElementById("join-party-btn").onclick = () => {
  if (!currentUser) { alert("You must be logged in!"); return; }
  const code = document.getElementById("join-party-code").value.trim().toUpperCase();
  if (!code) return alert("Enter a party code.");
  let loaded = loadPartyData(code);
  if (!loaded) {
    partyStatus.textContent = "Party not found or expired.";
    return;
  }
  if (loaded.players.length >= 2) {
    partyStatus.textContent = "Party full.";
    return;
  }
  if (loaded.players.includes(currentUser)) {
    partyStatus.textContent = "You already joined this party.";
    return;
  }
  partyCode = code;
  partyData = loaded;
  partyData.players.push(currentUser);
  partyData.errors.push(0);
  savePartyData();
  partyStatus.textContent = "Joined party!";
  partyCodeDisplay.textContent = partyCode;
  updatePartyPlayersList();
  showPartyLobby();
  startPartyPolling();
};

// Show party lobby
function showPartyLobby() {
  partySetup.style.display = "none";
  partyLobby.style.display = "block";
  partyGame.style.display = "none";
  partyWinner.style.display = "none";
  partyBackBtn.style.display = "none";
  partyVoteMessage.textContent = "";
  renderDifficultyVotes();
}

// Update player list UI
function updatePartyPlayersList() {
  partyPlayersList.innerHTML = "";
  if (!partyData) return;
  partyData.players.forEach(p => {
    const li = document.createElement("li");
    li.textContent = p + (p === currentUser ? " (You)" : "");
    partyPlayersList.appendChild(li);
  });
}

// Render difficulty voting buttons
function renderDifficultyVotes() {
  partyDifficultyVotes.innerHTML = "";
  difficulties.forEach(d => {
    const btn = document.createElement("button");
    btn.textContent = difficultyLabels[d];
    btn.style.margin = "3px";
    btn.disabled = partyData.started;
    btn.onclick = () => {
      if (partyData.started) return;
      partyData.votes[currentUser] = d;
      savePartyData();
      partyVoteMessage.textContent = `You voted ${difficultyLabels[d]}`;
      renderDifficultyVotes();
    };
    if (partyData.votes[currentUser] === d) {
      btn.style.backgroundColor = "#27ae60";
      btn.style.color = "white";
    }
    partyDifficultyVotes.appendChild(btn);
  });
}

// Poll party data for changes every 1s
function startPartyPolling() {
  if (partyPollingInterval) clearInterval(partyPollingInterval);
  partyPollingInterval = setInterval(() => {
    const data = loadPartyData(partyCode);
    if (!data) {
      partyStatus.textContent = "Party expired or deleted.";
      clearInterval(partyPollingInterval);
      return;
    }
    partyData = data;
    updatePartyPlayersList();
    renderDifficultyVotes();
    checkVotes();
  }, 1000);
}

// Check if both players voted and start game
function checkVotes() {
  if (!partyData) return;
  if (partyData.players.length < 2) {
    partyVoteMessage.textContent = "Waiting for 2 players to join...";
    return;
  }
  if (Object.keys(partyData.votes).length < 2) {
    partyVoteMessage.textContent = "Waiting for both players to vote...";
    return;
  }

  const votes = Object.values(partyData.votes);
  // If votes not same, show message
  if (votes[0] !== votes[1]) {
    partyVoteMessage.textContent = `Players voted differently. Waiting to agree...`;
    return;
  }

  // Both voted same difficulty, start game!
  if (!partyData.started) {
    partyData.started = true;
    partyData.difficulty = votes[0];
    partyData.turn = 0;
    partyData.errors = [0,0];
    partyData.flippedCards = [];
    partyData.matchedPairs = 0;
    savePartyData();
    partyVoteMessage.textContent = `Starting game with difficulty: ${difficultyLabels[votes[0]]}`;
    setTimeout(() => startPartyGame(), 1500);
  }
}

// Start party game
function startPartyGame() {
  partyLobby.style.display = "none";
  partyGame.style.display = "block";
  partyBackBtn.style.display = "none";
  partyWinner.style.display = "none";
  partyGameStarted = true;
  partyCurrentTurn = partyData.turn;
  partyErrors = [...partyData.errors];
  setupPartyBoard(partyData.difficulty);
  updatePartyTurnText();
  partyEndTurnBtn.style.display = "none";
  partyErrorInfo.textContent = "";
}

// Setup party game board with emoji cards
function setupPartyBoard(level) {
  partyGameBoard.innerHTML = "";
  const emojis = partyEmojisMap[level];
  partyEmojis = [...emojis, ...emojis];
  shuffleArray(partyEmojis);
  const cols = Math.min(emojis.length, 6);
  partyGameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  partyBoardLocked = true;

  partyEmojis.forEach((emoji, i) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.index = i;
    card.dataset.value = emoji;
    card.textContent = emoji; // show face up first
    partyGameBoard.appendChild(card);
  });

  setTimeout(() => {
    const cards = partyGameBoard.querySelectorAll(".card");
    cards.forEach(card => {
      card.textContent = "";
      card.classList.remove("flip");
      card.onclick = partyCardClick;
    });
    partyBoardLocked = false;
  }, 1200);
}

// Party card click
function partyCardClick(e) {
  if (partyBoardLocked) return;
  const card = e.currentTarget;
  if (partyFirstCard === card) return;

  if (partyCurrentTurn !== partyData.players.indexOf(currentUser)) {
    partyErrorInfo.textContent = "Not your turn!";
    return;
  }

  card.textContent = card.dataset.value;
  card.classList.add("flip");

  if (!partyFirstCard) {
    partyFirstCard = card;
    return;
  }
  partySecondCard = card;
  partyBoardLocked = true;

  if (partyFirstCard.dataset.value === partySecondCard.dataset.value) {
    partyData.matchedPairs++;
    partyFirstCard = null;
    partySecondCard = null;
    partyBoardLocked = false;
    partyErrorInfo.textContent = "Match found!";
    updatePartyGameState();
  } else {
    partyErrorInfo.textContent = "No match.";
    partyErrors[partyCurrentTurn]++;
    updatePartyGameState();
    setTimeout(() => {
      partyFirstCard.textContent = "";
      partySecondCard.textContent = "";
      partyFirstCard.classList.remove("flip");
      partySecondCard.classList.remove("flip");
      partyFirstCard = null;
      partySecondCard = null;
      partyBoardLocked = false;
    }, 900);
  }
}

// Update party game state & save
function updatePartyGameState() {
  partyData.errors = partyErrors;
  partyData.matchedPairs = partyData.matchedPairs;
  savePartyData();

  if (partyData.matchedPairs === partyEmojis.length / 2) {
    endPartyGame();
  } else {
    partyEndTurnBtn.style.display = "inline-block";
  }
}

// Update turn display
function updatePartyTurnText() {
  partyTurnInfo.textContent = `${partyData.players[partyCurrentTurn]}'s Turn`;
  partyErrorInfo.textContent = "";
  partyEndTurnBtn.style.display = "none";
}

// End turn handler
partyEndTurnBtn.onclick = () => {
  partyCurrentTurn = (partyCurrentTurn + 1) % partyData.players.length;
  partyData.turn = partyCurrentTurn;
  savePartyData();
  updatePartyTurnText();
};

// End party game & show winner
function endPartyGame() {
  partyGame.style.display = "none";
  partyWinner.style.display = "block";
  partyBackBtn.style.display = "inline-block";

  const minErrors = Math.min(...partyErrors);
  const winners = partyData.players.filter((p,i) => partyErrors[i] === minErrors);

  if (winners.length === 1) {
    partyWinner.textContent = `🎉 ${winners[0]} wins with ${minErrors} errors! 🎉`;
  } else {
    partyWinner.textContent = `🤝 Tie! Winners: ${winners.join(", ")} with ${minErrors} errors each!`;
  }
}

// Back to main menu from party winner screen
partyBackBtn.onclick = () => {
  clearParty();
  document.getElementById("game-screen").style.display = "block";
  partyWinner.style.display = "none";
  partyBackBtn.style.display = "none";
  partyLobby.style.display = "none";
  partySetup.style.display = "block";
  partyStatus.textContent = "";
};

// Clear party data on logout or restart
function clearParty() {
  partyCode = null;
  partyData = null;
  partyGameStarted = false;
  partyCurrentTurn = 0;
  partyErrors = [];
  partyEmojis = [];
  partyFirstCard = null;
  partySecondCard = null;
  partyBoardLocked = false;
  partyPollingInterval && clearInterval(partyPollingInterval);

  partyStatus.textContent = "";
  partyCodeDisplay.textContent = "";
  partyPlayersList.innerHTML = "";
  partyDifficultyVotes.innerHTML = "";
  partyVoteMessage.textContent = "";
  partyLobby.style.display = "none";
  partyGame.style.display = "none";
  partyWinner.style.display = "none";
  partyBackBtn.style.display = "none";
  partySetup.style.display = "block";
}
