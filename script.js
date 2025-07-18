console.log("script.js loaded");

let currentUser = null;
const ownerUser = "Owner";
const ownerPass = "ownerpass";

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedPairs = 0;
let totalPairs = 0;

const emojiSets = {
  easy: ["🍎","🍌","🍇","🍉"],           // 4 pairs
  medium: ["🍎","🍌","🍇","🍉","🥝","🍒"],  // 6 pairs
  hard: ["🍎","🍌","🍇","🍉","🥝","🍒","🍓","🍍"], // 8 pairs
  extreme: ["🍎","🍌","🍇","🍉","🥝","🍒","🍓","🍍","🥥","🥑"] // 10 pairs
};

const revealTimes = {
  easy: 1000,
  medium: 1500,
  hard: 2000,
  extreme: 2500
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
  if (localStorage.getItem("user_" + u)) {
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

function startDuel() {
  resetBoard();

  const level = document.getElementById("level").value;
  const emojis = emojiSets[level];
  totalPairs = emojis.length;
  matchedPairs = 0;

  // Create deck with pairs and shuffle
  const deck = [...emojis, ...emojis];
  deck.sort(() => Math.random() - 0.5);

  const board = document.getElementById("game-board");
  board.innerHTML = "";
  // Calculate columns based on pairs (max 5 columns)
  const cols = Math.min(5, Math.ceil(deck.length / 4));
  board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  deck.forEach(emoji => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.value = emoji;
    card.textContent = ""; // Hide value initially
    card.addEventListener("click", () => reveal(card));
    board.appendChild(card);
  });

  // Reveal all cards briefly with flip animation, then hide
  const cards = document.querySelectorAll(".card");
  cards.forEach(c => {
    c.textContent = c.dataset.value;
    c.classList.add("revealed", "flip");
  });

  lockBoard = true;
  setTimeout(() => {
    cards.forEach(c => {
      c.textContent = "";
      c.classList.remove("revealed", "flip");
    });
    lockBoard = false;
  }, revealTimes[level]);
}

function reveal(card) {
  if (lockBoard || card.classList.contains("revealed")) return;

  card.textContent = card.dataset.value;
  card.classList.add("revealed", "flip");

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
      firstCard.textContent = "";
      secondCard.textContent = "";
      firstCard.classList.remove("revealed", "flip");
      secondCard.classList.remove("revealed", "flip");
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
  } else {
    document.getElementById("game-message").textContent = "";
  }
}

function resetBoard() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  matchedPairs = 0;
  totalPairs = 0;
  document.getElementById("game-message").textContent = "";
}
