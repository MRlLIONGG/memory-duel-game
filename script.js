window.onload = () => {
  const intro = document.getElementById('intro-screen');
  const menu = document.getElementById('main-menu');
  const bgMusic = document.getElementById('bg-music');

  intro.classList.add('active');
  setTimeout(() => {
    intro.classList.remove('active');
    intro.classList.add('hidden');
    menu.classList.remove('hidden');
    menu.classList.add('active');
    bgMusic.volume = 0.5;
    bgMusic.play();
  }, 2000);
};

function showLogin() {
  playClick();
  hideAll();
  document.getElementById('login-screen').classList.add('active');
}

function showRegister() {
  playClick();
  hideAll();
  document.getElementById('register-screen').classList.add('active');
}

function showSettings() {
  playClick();
  hideAll();
  document.getElementById('settings-screen').classList.add('active');
}

function backToMenu() {
  playClick();
  hideAll();
  document.getElementById('main-menu').classList.add('active');
}

function hideAll() {
  document.querySelectorAll('.screen').forEach(el => {
    el.classList.remove('active');
    el.classList.add('hidden');
  });
}

function toggleEye(id) {
  const input = document.getElementById(id);
  input.type = input.type === 'password' ? 'text' : 'password';
}

function login() {
  playClick();
  const user = document.getElementById('login-user').value;
  const pass = document.getElementById('login-pass').value;
  if (user && pass) {
    alert('Welcome, ' + user + '! Login successful.');
    backToMenu();
  } else {
    alert('Fill all fields!');
  }
}

function register() {
  playClick();
  const user = document.getElementById('register-user').value;
  const pass = document.getElementById('register-pass').value;
  if (user && pass) {
    alert('Welcome, ' + user + '! Registered.');
    backToMenu();
  } else {
    alert('Fill all fields!');
  }
}

function playClick() {
  const sound = document.getElementById('click-sound');
  const masterVol = parseFloat(document.getElementById('master-volume').value || 1);
  sound.volume = masterVol;
  sound.currentTime = 0;
  sound.play();
}

// Volume control
document.getElementById('master-volume').addEventListener('input', (e) => {
  document.getElementById('click-sound').volume = parseFloat(e.target.value);
});

document.getElementById('music-volume').addEventListener('input', (e) => {
  document.getElementById('bg-music').volume = parseFloat(e.target.value);
});
