console.log("script.js loaded");

let currentUser = null;
const ownerUser = "Owner";
const ownerPass = "ownerpass";

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedPairs = 0;
let totalPairs = 0;

let timerInterval = null;
let timeElapsed = 0;
let moves = 0;

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

// Sound effects URLs (free sounds or replace with your own)
const sounds = {
  flip: "https://freesound.org/data/previews/198/198841_285997-lq.mp3",
  match: "https://freesound.org/data/previews/66/66717_634166-lq.mp3",
  win: "https://freesound.org/data/previews/331/331912_3248244-lq.mp3"
};

function playSound(name) {
  const audio = new Audio(sounds[name]);
  audio.volume = 0.25;
  audio.play();
}

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
  const pc = document.getElementById("register-password-confirm").value.trim();

  if (!u || !p || !pc) {
    alert("Please fill in all fields.");
    return;
  }
  if (p !== pc) {
    alert("Passwords do not match.");
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
    loadLeaderboard();
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
  if (currentUser === u) {
    logout();
  }
}

function logout() {
  if (timerInterval) clearInterval(timerInterval);
  currentUser = null;
  document.getElementById("auth-screen").style.display = "block";
  document.getElementById("register-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "none";
  resetBoard();
}

function resetBoard() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  matchedPairs = 0;
  moves = 0;
  timeElapsed = 0;

  document.getElementById("game-message").textContent = "";
  document.getElementById("game-board").innerHTML = "";
  document.getElementById("moves").textContent = moves;
  document.getElementById("timer").textContent = timeElapsed;
  document.getElementById("score").textContent = matchedPairs;
  document.getElementById("total-pairs").textContent = totalPairs;
  document.getElementById("reset-button").disabled = true;

  if(timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function startTimer() {
  if(timerInterval) clearInterval(timerInterval);
  timeElapsed = 0;
  document.getElementById("timer").textContent = timeElapsed;

  timerInterval = setInterval(() => {
    timeElapsed++;
    document.getElementById("timer").textContent = timeElapsed;
  }, 1000);
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
    card.tabIndex = 0; // make keyboard focusable
    card.setAttribute("role", "button");
    card.setAttribute("aria-pressed", "false");
    card.onclick = () => reveal(card);
    card.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        reveal(card);
      }
      // Optional: Add arrow key navigation later
    };
    board.appendChild(card);
  });

  document.getElementById("score").textContent = matchedPairs;
  document.getElementById("total-pairs").textContent = totalPairs;

  // Reveal all cards briefly with flip animation
  const cards = document.querySelectorAll(".card");
  cards.forEach(card => {
    card.textContent = card.dataset.value;
    card.classList.add("flip");
  });

  lockBoard = true;
  document.getElementById("start-button").disabled = true;
  document.getElementById("reset-button").disabled = false;
  startTimer();

  setTimeout(() => {
    cards.forEach(card => {
      card.textContent = "";
      card.classList.remove("flip");
    });
    lockBoard = false;
  }, revealTimes[level]);
}

function reveal(card) {
  if (lockBoard) return;
  if (card === firstCard) return; // Prevent double-click same card

  card.classList.add("flip");
  card.textContent = card.dataset.value;
  card.setAttribute("aria-pressed", "true");
  playSound("flip");

  if (!firstCard) {
    firstCard = card;
    return;
  }
  secondCard = card;
  lockBoard = true;

  moves++;
  document.getElementById("moves").textContent = moves;

  if (firstCard.dataset.value === secondCard.dataset.value) {
    matchedPairs++;
    document.getElementById("score").textContent = matchedPairs;
    playSound("match");

    firstCard.classList.add("revealed");
    secondCard.classList.add("revealed");

    resetTurn();
    checkWin();
  } else {
    setTimeout(() => {
      firstCard.classList.remove("flip");
      secondCard.classList.remove("flip");
      firstCard.textContent = "";
      secondCard.textContent = "";
      firstCard.setAttribute("aria-pressed", "false");
      secondCard.setAttribute("aria-pressed", "false");
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
    playSound("win");
    if(timerInterval) clearInterval(timerInterval);

    // Update leaderboard
    updateLeaderboard(currentUser, timeElapsed);

    // Confetti
    startConfetti();
    
    document.getElementById("start-button").disabled = false;
    document.getElementById("reset-button").disabled = true;
  }
}

// Leaderboard stored as array of objects in localStorage
function loadLeaderboard() {
  const board = document.getElementById("leaderboard");
  board.innerHTML = "";

  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

  if(leaderboard.length === 0) {
    board.innerHTML = "<li>No scores yet.</li>";
    return;
  }

  leaderboard.sort((a,b) => a.time - b.time);

  leaderboard.forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = `${entry.username}: ${entry.time} sec`;
    board.appendChild(li);
  });
}

function updateLeaderboard(username, time) {
  if(!username || username === ownerUser) return;

  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  // Check if user exists and update if better time
  const index = leaderboard.findIndex(e => e.username === username);

  if(index === -1) {
    leaderboard.push({username, time});
  } else {
    if(time < leaderboard[index].time) {
      leaderboard[index].time = time;
    }
  }

  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  loadLeaderboard();
}

// Simple confetti effect
function startConfetti() {
  const duration = 3000;
  const end = Date.now() + duration;

  (function frame() {
    const confettiCount = 15;
    for(let i = 0; i < confettiCount; i++) {
      createConfettiParticle();
    }
    if(Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

function createConfettiParticle() {
  const colors = ["#1abc9c", "#3498db", "#e74c3c", "#f1c40f", "#9b59b6"];
  const confetti = document.createElement("div");
  confetti.style.position = "fixed";
  confetti.style.zIndex = 9999;
  confetti.style.width = "8px";
  confetti.style.height = "8px";
  confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
  confetti.style.left = Math.random() * window.innerWidth + "px";
  confetti.style.top = "-10px";
  confetti.style.borderRadius = "50%";
  confetti.style.opacity = 0.8;
  confetti.style.pointerEvents = "none";
  confetti.style.transition = "transform 3s linear, opacity 3s ease-out";

  document.body.appendChild(confetti);

  // Animate falling
  setTimeout(() => {
    confetti.style.transform = `translateY(${window.innerHeight + 20}px) rotate(${Math.random()*360}deg)`;
    confetti.style.opacity = 0;
  }, 10);

  // Remove after animation
  setTimeout(() => {
    confetti.remove();
  }, 3000);
}
