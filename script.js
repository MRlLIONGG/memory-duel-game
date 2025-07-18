let mode = '';
let currentPlayer = 0;
let players = [];
let gameStarted = false;
let flipped = [];
let matched = [];
let partyCode = '';
let errors = {};
let timer;

window.onload = () => {
  setTimeout(() => {
    document.getElementById("welcome").style.display = "none";
    document.getElementById("main-menu").classList.remove("hidden");
  }, 2000);
};

function playSound(id) {
  const audio = document.getElementById(id);
  if (audio) {
    audio.currentTime = 0;
    audio.play();
  }
}

function togglePassword() {
  const pass = document.getElementById("password");
  pass.type = pass.type === "password" ? "text" : "password";
}

function showLogin() {
  mode = 'login';
  document.getElementById("auth-title").innerText = "Login";
  document.getElementById("main-menu").classList.add("hidden");
  document.getElementById("auth-container").classList.remove("hidden");
}

function showRegister() {
  mode = 'register';
  document.getElementById("auth-title").innerText = "Register";
  document.getElementById("main-menu").classList.add("hidden");
  document.getElementById("auth-container").classList.remove("hidden");
}

function submitAuth() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;
  if (user && pass) {
    alert(`Welcome, ${user}! ${mode} successful.`);
    backToMenu();
  }
}

function backToMenu() {
  document.querySelectorAll('.hidden').forEach(el => el.classList.add('hidden'));
  document.getElementById("main-menu").classList.remove("hidden");
  clearInterval(timer);
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

function startDuel() {
  document.getElementById("main-menu").classList.add("hidden");
  document.getElementById("difficulty-select").classList.remove("hidden");
}

function beginGame(difficulty) {
  const sizes = { easy: 4, medium: 6, hard: 8, extreme: 10, impossible: 12 };
  const size = sizes[difficulty] || 4;
  const emojis = ["🍎", "🐶", "🚗", "🎵", "⚽", "🍕", "🐱", "🌟", "🚀", "🌈", "🧊", "👻"].slice(0, size);
  const cards = shuffle([...emojis, ...emojis]);
  const container = document.getElementById("game-container");
  container.innerHTML = '';
  flipped = [];
  matched = [];
  gameStarted = true;
  document.getElementById("difficulty-select").classList.add("hidden");
  container.classList.remove("hidden");
  setTimeout(() => {
    cards.forEach((emoji, i) => {
      const div = document.createElement("div");
      div.className = "card";
      div.dataset.index = i;
      div.dataset.emoji = emoji;
      div.innerText = emoji;
      container.appendChild(div);
    });
    setTimeout(() => {
      document.querySelectorAll(".card").forEach(card => card.innerText = '');
      container.addEventListener("click", handleCardClick);
    }, 1200);
  }, 100);
}

function handleCardClick(e) {
  const el = e.target;
  if (!el.classList.contains("card") || flipped.length >= 2 || el.classList.contains("flipped")) return;
  const index = el.dataset.index;
  const emoji = el.dataset.emoji;
  el.innerText = emoji;
  el.classList.add("flipped");
  flipped.push({ el, emoji });

  playSound('flip-sound');

  if (flipped.length === 2) {
    setTimeout(() => {
      const [a, b] = flipped;
      if (a.emoji === b.emoji) {
        matched.push(a.el, b.el);
        if (matched.length === document.querySelectorAll(".card").length) {
          playSound('win-sound');
          alert("You won!");
          backToMenu();
        }
      } else {
        a.el.innerText = '';
        b.el.innerText = '';
        a.el.classList.remove("flipped");
        b.el.classList.remove("flipped");
        if (mode === 'party') {
          errors[players[currentPlayer]]++;
          alert(`${players[currentPlayer]} +1 error!`);
        }
        nextTurn();
      }
      flipped = [];
    }, 800);
  }
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function startParty() {
  mode = 'party';
  document.getElementById("main-menu").classList.add("hidden");
  document.getElementById("party-container").classList.remove("hidden");
}

function createParty() {
  partyCode = Math.random().toString(36).substr(2, 5).toUpperCase();
  players = ["Player1", "Player2"];
  currentPlayer = 0;
  errors = { "Player1": 0, "Player2": 0 };
  document.getElementById("party-status").innerText = `Share this code: ${partyCode}`;
  setTimeout(() => {
    beginGame("medium");
    startTimer();
  }, 1000);
}

function joinParty() {
  const code = document.getElementById("party-code").value;
  if (code.length === 5) {
    alert("Joined party!");
    beginGame("medium");
    startTimer();
  } else {
    alert("Invalid code.");
  }
}

function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    alert(`${players[currentPlayer]}'s turn ended. +1 error.`);
    errors[players[currentPlayer]]++;
    nextTurn();
  }, 5000);
}

function nextTurn() {
  clearInterval(timer);
  currentPlayer = (currentPlayer + 1) % players.length;
  startTimer();
}
