function showRegister() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('register-screen').style.display = 'block';
}

function showLogin() {
  document.getElementById('register-screen').style.display = 'none';
  document.getElementById('login-screen').style.display = 'block';
}

function login() {
  alert("Logged in (this would be real in a full version).");
}

function register() {
  alert("Registered (this would be real in a full version).");
}