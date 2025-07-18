let currentUser = null;
let partyPlayers = [];
let currentTurn = 0;
let playerErrors = [0, 0];

window.onload = () => {
  setTimeout(() => {
    document.getElementById('intro-screen').style.display = 'none';
    document.getElementById('auth-screen').style.display = 'block';

    // Auto-login if remembered
    const remembered = localStorage.getItem('rememberedUser');
    if (remembered) {
      currentUser = remembered;
      showMenu();
    }
  }, 3000);

  document.getElementById('login-eye').onclick = () => togglePassword('login-password');
  document.getElementById('register-eye').onclick = () => togglePassword('register-password');
};

function togglePassword(id) {
  let input = document.getElementById(id);
  input.type = input.type === 'password' ? 'text' : 'password';
}

function toggleRegister() {
  const login = document.getElementById('auth-screen');
  const register = document.getElementById('register-screen');
  login.style.display = login.style.display === 'none' ? 'block' : 'none';
  register.style.display = register.style.display === 'none' ? 'block' : 'none';
}

function register() {
  const user = document.getElementById('register-username').value;
  const pass = document.getElementById('register-password').value;
  if (!user || !pass) return alert("Fill all fields.");
  if (localStorage.getItem(`user_${user}`)) return alert("User exists.");
  localStorage.setItem(`user_${user}`, pass);
  alert("Registered! You can now log in.");
  toggleRegister();
}

function login() {
  const user = document.getElementById('login-username').value;
  const pass = document.getElementById('login-password').value;
  const storedPass = localStorage.getItem(`user_${user}`);
  if (storedPass !== pass) return alert("Wrong credentials.");
  currentUser = user;
  if (document.getElementById('remember-login').checked) {
    localStorage.setItem('rememberedUser', user);
  }
  showMenu();
}

function showMenu() {
  hideAll();
  document.getElementById('main-menu').style.display = 'block';
}

function hideAll() {
  ['auth-screen', 'register-screen', 'main-menu', 'game-screen', 'winner-screen']
    .forEach(id => document.getElementById(id).style.display = 'none');
}

function logout() {
  currentUser = null;
  localStorage.removeItem('rememberedUser');
  hideAll();
  document.getElementById('auth-screen').style.display = 'block';
}

function deleteAccount() {
  if (!confirm("Are you sure?")) return;
  localStorage.removeItem(`user_${currentUser}`);
  logout();
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}

function startPartyMode() {
  partyPlayers = [currentUser, "Player 2"];
  currentTurn = 0;
  playerErrors = [0, 0];
  hideAll();
  document.getElementById('game-screen').style.display = 'block';
  updateTurnText();
}

function updateTurnText() {
  document.getElementById('player-turn').innerText = `${partyPlayers[currentTurn]}'s Turn`;
}

function endTurn() {
  playerErrors[currentTurn] += Math.floor(Math.random() * 5); // Random errors
  currentTurn++;
  if (currentTurn >= partyPlayers.length) {
    showWinner();
  } else {
    updateTurnText();
  }
}

function showWinner() {
  hideAll();
  const minErrors = Math.min(...playerErrors);
  const winnerIndex = playerErrors.indexOf(minErrors);
  document.getElementById('winner-text').innerText =
    `${partyPlayers[winnerIndex]} wins with ${minErrors} errors!`;
  document.getElementById('winner-screen').style.display = 'block';
}

function backToMenu() {
  showMenu();
}
