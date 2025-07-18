console.log("script.js loaded");

let currentUser = null;
const ownerUser = "Owner";
const ownerPass = "ownerpass";

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
    alert("Please enter both username and password.");
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
  alert("Registered! You can now login.");
  switchToLogin();
}

function login() {
  const u = document.getElementById("login-username").value.trim();
  const p = document.getElementById("login-password").value.trim();
  if (!u || !p) {
    alert("Please enter both username and password.");
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
    alert("Please enter a username to delete.");
    return;
  }
  if (u === ownerUser) {
    alert("Cannot delete the Owner account.");
    return;
  }
  localStorage.removeItem("user_" + u);
  alert("User deleted if existed.");
}

function startDuel() {
  const board = document.getElementById("game-board");
  board.innerHTML = "";
  // Simple 8 cards, 4 pairs
  const values = ["A", "B", "C", "D", "A", "B", "C", "D"];
  // Shuffle
  values.sort(() => 0.5 - Math.random());

  values.forEach(val => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.value = val;
    card.textContent = ""; // hide value initially
    card.onclick = () => reveal(card);
    board.appendChild(card);
  });

  first = null; // reset game state
}

let first = null;
function reveal(card) {
  if (card.classList.contains("revealed")) return;
  card.textContent = card.dataset.value;
  card.classList.add("revealed");
  if (!first) {
    first = card;
  } else {
    if (first.dataset.value === card.dataset.value) {
      first = null;
    } else {
      setTimeout(() => {
        first.textContent = "";
        card.textContent = "";
        first.classList.remove("revealed");
        card.classList.remove("revealed");
        first = null;
      }, 1000);
    }
  }
}
