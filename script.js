console.log("script.js loaded");

let currentUser = null;
const ownerUser = "Owner";
const ownerPass = "ownerpass";

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedPairs = 0;
let totalPairs = 0;

// Emoji sets for different difficulties
const emojiSets = {
  easy: ["🍎", "🍌", "🍇", "🍉"],               // 4 pairs
  medium: ["🍎", "🍌", "🍇", "🍉", "🥝", "🍒"],  // 6 pairs
  hard: ["🍎", "🍌", "🍇", "🍉", "🥝", "🍒", "🍓", "🍍"], // 8 pairs
  extreme: ["🍎", "🍌", "🍇", "🍉", "🥝", "🍒", "🍓", "🍍", "🥥", "🥑"] // 10 pairs
};

// Reveal time in milliseconds per difficulty
const revealTimes = {
  easy: 1500,
  medium: 2000,
  hard: 2500,
  extreme: 3000
};

function switchToRegister() {
  document.getElementById("auth-screen").style.display = "none";
  document.getElementById("register-screen").style.display = "block";
}

function switchToLogin() {
  document.getElementById("auth-screen").style.display = "block";
  document.getElementById("register-screen").style.display = "none";
}

function register() {
  const u = document.getElementById("register-username").value.trim();
  const p = document.getElementById("register-password").value.trim();

  if (!u || !p) {
    alert("Please enter username and password.");
    return;
  }
  if (u === ownerUser) {
    alert("Username 'Owner' is reserved.");
    return;
  }
  if (localStorage.getItem("user_" + u) !== null) {
    alert("Username already taken.");
    return;
  }

  localStorage.setItem("user_" + u, p);
  alert("Registered successfully!");
  switchToLogin();
}

function login() {
  const u = document.getElementById("login-username").value.trim();
  const p = document.getElementById("login-password").value.trim();

  if (!u || !p) {
    alert("Please enter username and password.");
    return;
  }

  if ((u === ownerUser && p === ownerPass) || localStorage.getItem("user_" + u) === p) {
    currentUser = u;
    document.getElementById("auth-screen").style.display = "none";
    document.getElementById("register-screen").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
    document.getElementById("user-display").textContent = currentUser;
    if (u === ownerUser) {
      document.getElementById("admin-panel").style.display = "block";
    } else {
      document.getElementById("admin-panel").style.display = "none";
    }
  } else {
    alert("Wrong username or password.");
  }
}

function deleteUser() {
  const u = document.getElementById("delete-user").value.trim();

  if (!u) {
    alert("Enter a username to delete.");
    return;
  }
  if (u === ownerUser) {
    alert("Cannot delete Owner.");
    return;
  }
  localStorage.removeItem("user_" + u);
  alert("User deleted if existed.");
}

// Reset game variables and board
function resetBoard() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  matchedPairs = 0;
  document.getElementById("game-message").textContent = "";
  document.getElementById("game-board").innerHTML = "";
}

// Called when a card is clicked
function reveal(card) {
  if (lockBoard) return;
  if (card === firstCard) return; // Prevent double-click same card

  card.classList.add("flip");
  card.textContent = card.dataset.value;

  if (!firstCard) {
    firstCard = card;
    return;
  }
  secondCard = card;
  lockBoard = true;

  if (firstCard.dataset.value === secondCard.dataset.value) {
    matchedPairs++;
    resetTurn();
    checkWin();
  } else {
    setTimeout(() => {
      firstCard.classList.remove("flip");
      secondCard.classList.remove("flip");
      firstCard.textContent = "";
      secondCard.textContent = "";
      resetTurn();
    }, 1000);
  }
}

function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

function checkWin() {
  if (matchedPairs === totalPairs) {
    document.getElementById("game-message").textContent = "🎉 You won! Start a new duel.";
  }
}

function startDuel() {
  resetBoard();
  const level = document.getElementById("level").value;
  const emojis = emojiSets[level];
  totalPairs = emojis.length;

  // Create deck of pairs and shuffle
  const deck = [...emojis, ...emojis];
  deck.sort(() => Math.random() - 0.5);

  const board = document.getElementById("game-board");
  board.style.gridTemplateColumns = `repeat(${Math.min(totalPairs, 6)}, 1fr)`;

  // Create cards
  deck.forEach(emoji => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.value = emoji;
    card.textContent = "";
    card.onclick = () => reveal(card);
    board.appendChild(card);
  });

  // Reveal all cards for a short time, then hide
  const cards = document.querySelectorAll(".card");
  cards.forEach(card => {
    card.textContent = card.dataset.value;
    card.classList.add("flip");
  });

  lockBoard = true;
  setTimeout(() => {
    cards.forEach(card => {
      card.textContent = "";
      card.classList.remove("flip");
    });
    lockBoard = false;
  }, revealTimes[level]);
}
