// Intro fade
window.onload = () => {
  setTimeout(() => {
    document.getElementById("intro-screen").style.display = "none";
    document.getElementById("auth-screen").style.display = "block";
  }, 3000);
};

// Dark mode
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

// Eye toggle
document.getElementById("login-eye").onclick = () => {
  let pw = document.getElementById("login-password");
  pw.type = pw.type === "password" ? "text" : "password";
};

document.getElementById("register-eye").onclick = () => {
  let pw = document.getElementById("register-password");
  pw.type = pw.type === "password" ? "text" : "password";
};

// Auth system (fake)
function login() {
  let user = document.getElementById("login-username").value;
  let pass = document.getElementById("login-password").value;
  if (user && pass) {
    localStorage.setItem("user", user);
    showMenu();
  } else alert("Enter credentials");
}

function register() {
  let user = document.getElementById("register-username").value;
  let pass = document.getElementById("register-password").value;
  if (user && pass) {
    localStorage.setItem("user", user);
    showMenu();
  } else alert("Enter credentials");
}

function logout() {
  localStorage.removeItem("user");
  location.reload();
}

function deleteAccount() {
  localStorage.removeItem("user");
  alert("Account deleted");
  location.reload();
}

function toggleRegister() {
  let auth = document.getElementById("auth-screen");
  let reg = document.getElementById("register-screen");
  auth.style.display = auth.style.display === "none" ? "block" : "none";
  reg.style.display = reg.style.display === "none" ? "block" : "none";
}

function showMenu() {
  document.getElementById("auth-screen").style.display = "none";
  document.getElementById("register-screen").style.display = "none";
  document.getElementById("main-menu").style.display = "block";
}

// Party Mode logic
let players = ["Player 1", "Player 2"];
let turnIndex = 0;
let errors = [0, 0];

function startPartyMode() {
  turnIndex = 0;
  errors = [0, 0];
  document.getElementById("main-menu").style.display = "none";
  document.getElementById("game-screen").style.display = "block";
  nextTurn();
}

function nextTurn() {
  document.getElementById("player-turn").innerText = players[turnIndex] + "'s Turn";
  document.getElementById("card-grid").innerText = "[Card grid placeholder]";
}

function endTurn() {
  errors[turnIndex] = Math.floor(Math.random() * 5); // Simulate errors
  turnIndex++;
  if (turnIndex >= players.length) {
    let minErr = Math.min(...errors);
    let winnerIndex = errors.indexOf(minErr);
    document.getElementById("game-screen").style.display = "none";
    document.getElementById("winner-screen").style.display = "block";
    document.getElementById("winner-text").innerText = `${players[winnerIndex]} wins with ${minErr} errors!`;
  } else {
    nextTurn();
  }
}

function backToMenu() {
  document.getElementById("winner-screen").style.display = "none";
  document.getElementById("main-menu").style.display = "block";
}
