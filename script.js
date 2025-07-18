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
  const u = document.getElementById("register-username").value;
  const p = document.getElementById("register-password").value;
  if (u === ownerUser) return alert("Username 'Owner' is reserved.");
  localStorage.setItem("user_" + u, p);
  alert("Registered!");
  switchToLogin();
}

function login() {
  const u = document.getElementById("login-username").value;
  const p = document.getElementById("login-password").value;
  if ((u === ownerUser && p === ownerPass) || localStorage.getItem("user_" + u) === p) {
    currentUser = u;
    document.getElementById("auth-screen").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
    document.getElementById("user-display").textContent = currentUser;
    if (u === ownerUser) document.getElementById("admin-panel").style.display = "block";
  } else {
    alert("Wrong username or password.");
  }
}

function deleteUser() {
  const u = document.getElementById("delete-user").value;
  localStorage.removeItem("user_" + u);
  alert("User deleted if existed.");
}

function startDuel() {
  const board = document.getElementById("game-board");
  board.innerHTML = "";
  const values = ["A", "B", "C", "D", "A", "B", "C", "D"].sort(() => 0.5 - Math.random());
  values.forEach(val => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.value = val;
    card.onclick = () => reveal(card);
    board.appendChild(card);
  });
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