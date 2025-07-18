let users = JSON.parse(localStorage.getItem("users")) || {};
let currentUser = null;
let partyPlayers = [];
let currentTurn = 0;

window.login = login;
window.register = register;
window.switchToLogin = switchToLogin;
window.switchToRegister = switchToRegister;
window.deleteUser = deleteUser;
window.addPlayerToParty = addPlayerToParty;
window.startParty = startParty;
window.simulateRound = simulateRound;

function switchToRegister() {
  document.querySelectorAll(".auth-box")[0].classList.add("hidden");
  document.querySelectorAll(".auth-box")[1].classList.remove("hidden");
}

function switchToLogin() {
  document.querySelectorAll(".auth-box")[1].classList.add("hidden");
  document.querySelectorAll(".auth-box")[0].classList.remove("hidden");
}

function register() {
  const user = document.getElementById("register-username").value;
  const pass = document.getElementById("register-password").value;
  if (user && pass) {
    if (users[user]) return alert("User exists");
    users[user] = { password: pass };
    localStorage.setItem("users", JSON.stringify(users));
    alert("Registered!");
    switchToLogin();
  }
}

function login() {
  const user = document.getElementById("login-username").value;
  const pass = document.getElementById("login-password").value;
  if (users[user] && users[user].password === pass) {
    currentUser = user;
    document.getElementById("player-name").textContent = currentUser;
    document.getElementById("auth-screen").classList.add("hidden");
    document.getElementById("game-screen").classList.remove("hidden");
  } else {
    alert("Wrong credentials");
  }
}

function deleteUser() {
  if (confirm("Logout?")) {
    currentUser = null;
    document.getElementById("game-screen").classList.add("hidden");
    document.getElementById("auth-screen").classList.remove("hidden");
  }
}

function addPlayerToParty() {
  const name = document.getElementById("player-name-input").value;
  if (name) {
    partyPlayers.push({ name: name, errors: 0 });
    alert(`${name} added to party!`);
    document.getElementById("player-name-input").value = "";
  }
}

function startParty() {
  if (partyPlayers.length < 2) {
    alert("Need at least 2 players");
    return;
  }
  document.getElementById("turn-box").classList.remove("hidden");
  document.getElementById("current-player").textContent = partyPlayers[0].name;
}

function simulateRound() {
  const player = partyPlayers[currentTurn];
  const errors = Math.floor(Math.random() * 5); // Random errors 0-4
  player.errors += errors;
  alert(`${player.name} played. Made ${errors} errors.`);

  currentTurn++;
  if (currentTurn >= partyPlayers.length) {
    endParty();
  } else {
    document.getElementById("current-player").textContent = partyPlayers[currentTurn].name;
  }
}

function endParty() {
  document.getElementById("turn-box").classList.add("hidden");

  partyPlayers.sort((a, b) => a.errors - b.errors);
  const winner = partyPlayers[0];

  document.getElementById("result").classList.remove("hidden");
  document.getElementById("result").textContent = `🎉 Winner is ${winner.name} with ${winner.errors} errors!`;
}
