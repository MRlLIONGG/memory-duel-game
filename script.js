console.log("script.js loaded");

let currentUser = null;
const ownerUser = "Owner";
const ownerPass = "ownerpass";

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedPairs = 0;
let totalPairs = 0;
let movesCount = 0;
let timerInterval = null;
let secondsElapsed = 0;

const emojiSets = {
  easy: ["🍎", "🍌", "🍇", "🍉"],               // 4 pairs
  medium: ["🍎", "🍌", "🍇", "🍉", "🥝", "🍒"],  // 6 pairs
  hard: ["🍎", "🍌", "🍇", "🍉", "🥝", "🍒", "🍓", "🍍"], // 8 pairs
  extreme: ["🍎", "🍌", "🍇", "🍉", "🥝", "🍒", "🍓", "🍍", "🥥", "🥑"] // 10 pairs
};

const revealTimes = {
  easy: 1500,
  medium: 2000,
  hard: 2500,
  extreme: 3000
};

const flipSound = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg");
const matchSound = new Audio("https://actions.google.com/sounds/v1/cartoon/concussive_hit_guitar_boing.ogg");

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
    alert("Please enter username and both password fields.");
    return;
  }
  if (u === ownerUser) {
    alert("Username 'Owner' is reserved.");
    return;
  }
  if (p !== pc) {
    alert("Passwords do not match.");
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
  const remember = document.getElementById("remember-me").checked;

  if (!u || !p) {
    alert("Please enter username and password.");
    return;
  }

  if ((u === ownerUser && p === ownerPass) || localStorage.getItem("user_" + u) === p) {
    currentUser = u;
    if(remember) {
      localStorage.setItem("rememberedUser", u);
    } else {
      localStorage.removeItem("rememberedUser");
    }
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
  loadLeaderboard();
}

// Show/hide password toggle
document.querySelectorAll(".toggle-password").forEach(span => {
  span.addEventListener("click", () => {
    const targetId = span.dataset.target;
    const input = document.getElementById(targetId);
    if (input.type === "password") input.type = "text";
    else input.type = "password";
  });
});

// Auto-login remembered user
window.onload = () => {
  const remembered = localStorage.getItem("rememberedUser");
  if (remembered) {
    document.getElementById("login-username").value = remembered;
    document.getElementById("remember-me").checked = true;
  }
};

// Game logic

function resetBoard() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  matchedPairs = 0;
  movesCount = 0;
  secondsElapsed = 0;
  clearInterval(timerInterval);
  document.getElementById("game-message").textContent = "";
  document.getElementById("game-board").innerHTML = "";
  updateMoves();
  updateTimer();
}

function reveal(card) {
  if (lockBoard) return;
  if (card === firstCard) return; // Prevent double-click same card

  flipSound.play();

  card.classList.add("flip");
  card.textContent = card.dataset.value;

  if (!firstCard) {
    firstCard = card;
    return;
  }
  secondCard = card;
  lockBoard = true;
  movesCount++;
  updateMoves();

  if (firstCard.dataset.value === secondCard.dataset.value) {
    matchSound.play();
    matchedPairs++;
    setTimeout(() => {
      resetTurn();
      checkWin();
    }, 500);
  } else {
    setTimeout(() => {
      firstCard.classList.remove("flip");
      secondCard.classList.remove("flip");
      firstCard.textContent = "";
      secondCard.textContent = "";
      resetTurn();
    }, 1200);
  }
}

function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

function checkWin() {
  if (matchedPairs === totalPairs) {
    document.getElementById("game-message").textContent = "🎉 You won! Start a new duel.";
    stopTimer();
    saveScore();
    confetti();
  }
}

function startTimer() {
  timerInterval = setInterval(() => {
    secondsElapsed++;
    updateTimer();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function updateTimer() {
  document.getElementById("timer").textContent = `Time: ${secondsElapsed}s`;
}

function updateMoves() {
  document.getElementById("moves").textContent = `Moves: ${movesCount}`;
}

function startDuel() {
  resetBoard();
  const level = document.getElementById("level").value;
  const emojis = emojiSets[level];
  totalPairs = emojis.length;

  const deck = [...emojis, ...emojis];
  deck.sort(() => Math.random() - 0.5);

  const board = document.getElementById("game-board");
  board.style.gridTemplateColumns = `repeat(${Math.min(totalPairs, 6)}, 1fr)`;

  deck.forEach(emoji => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.value = emoji;
    card.textContent = "";
    card.onclick = () => reveal(card);
    board.appendChild(card);
  });

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
    startTimer();
  }, revealTimes[level]);
}

// Leaderboard

function saveScore() {
  // Score based on time + moves (lower is better)
  const score = secondsElapsed * 100 + movesCount;
  const leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");

  leaderboard.push({ user: currentUser, time: secondsElapsed, moves: movesCount, score });
  leaderboard.sort((a, b) => a.score - b.score);
  if (leaderboard.length > 10) leaderboard.pop();

  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  loadLeaderboard();
}

function loadLeaderboard() {
  const leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  const list = document.getElementById("leaderboard-list");
  list.innerHTML = "";

  leaderboard.forEach(entry => {
    const li = document.createElement("li");
    li.textContent = `${entry.user} - Time: ${entry.time}s, Moves: ${entry.moves}`;
    list.appendChild(li);
  });
}

// Dark mode toggle

document.getElementById("dark-mode-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  if(document.body.classList.contains("dark-mode")) {
    document.getElementById("dark-mode-toggle").textContent = "☀️ Light Mode";
  } else {
    document.getElementById("dark-mode-toggle").textContent = "🌙 Dark Mode";
  }
});

// Confetti animation (simple)

function confetti() {
  const canvas = document.getElementById("confetti-canvas");
  const ctx = canvas.getContext("2d");
  const W = canvas.width = window.innerWidth;
  const H = canvas.height = window.innerHeight;

  const confettiCount = 150;
  const confettis = [];

  function randomColor() {
    const colors = ["#f94144","#f3722c","#f9844a","#f9c74f","#90be6d","#43aa8b","#577590"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function Confetti() {
    this.x = Math.random() * W;
    this.y = Math.random() * H - H;
    this.r = (Math.random() * 6) + 4;
    this.d = (Math.random() * confettiCount) + 10;
    this.color = randomColor();
    this.tilt = Math.floor(Math.random() * 10) - 10;
    this.tiltAngleIncrement = (Math.random() * 0.07) + 0.05;
    this.tiltAngle = 0;

    this.draw = function() {
      ctx.beginPath();
      ctx.lineWidth = this.r / 2;
      ctx.strokeStyle = this.color;
      ctx.moveTo(this.x + this.tilt + (this.r / 4), this.y);
      ctx.lineTo(this.x + this.tilt, this.y + this.tilt + (this.r / 4));
      ctx.stroke();
    }
  }

  for(let i=0; i < confettiCount; i++) {
    confettis.push(new Confetti());
  }

  let angle = 0;
  let animationFrame;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for(let i=0; i < confettiCount; i++) {
      let c = confettis[i];
      c.tiltAngle += c.tiltAngleIncrement;
      c.y += (Math.cos(angle + c.d) + 3 + c.r / 2) / 2;
      c.x += Math.sin(angle);
      c.tilt = Math.sin(c.tiltAngle) * 15;

      if(c.y > H) {
        c.x = Math.random() * W;
        c.y = -20;
        c.tilt = Math.floor(Math.random() * 10) - 10;
      }
      c.draw();
    }
    angle += 0.01;
    animationFrame = requestAnimationFrame(draw);
  }

  draw();

  setTimeout(() => {
    cancelAnimationFrame(animationFrame);
    ctx.clearRect(0, 0, W, H);
  }, 5000);
}
