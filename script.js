document.addEventListener('DOMContentLoaded', () => {
  // Welcome screen fadeout
  setTimeout(() => {
    document.getElementById('welcome-screen').style.display = 'none';
    showMainMenu();
  }, 2500);

  // Elements
  const mainMenu = document.getElementById('main-menu');
  const loginScreen = document.getElementById('login-screen');
  const registerScreen = document.getElementById('register-screen');
  const toRegister = document.getElementById('to-register');
  const toLogin = document.getElementById('to-login');
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  const loginEye = document.getElementById('login-eye');
  const registerEye = document.getElementById('register-eye');
  const gameScreen = document.getElementById('game-screen');
  const userDisplay = document.getElementById('user-display');
  const logoutBtn = document.getElementById('logout-btn');
  const toggleDarkBtn = document.getElementById('toggle-dark-btn');
  const backMainBtnGame = document.getElementById('back-main-btn-game');
  const startDuelBtn = document.getElementById('start-duel-btn');
  const levelSelect = document.getElementById('level');
  const gameBoard = document.getElementById('game-board');
  const gameMessage = document.getElementById('game-message');

  const partyScreen = document.getElementById('party-screen');
  const backMainBtnParty = document.getElementById('back-main-btn-party');
  const partyCodeInput = document.getElementById('party-code-input');
  const joinPartyCodeInput = document.getElementById('join-party-code');
  const joinPartyBtn = document.getElementById('join-party-btn');
  const partyInfo = document.getElementById('party-info');
  const turnIndicator = document.getElementById('turn-indicator');
  const partyMoveBtn = document.getElementById('party-move-btn');
  const partyGameBoard = document.getElementById('party-game-board');
  const partyMessage = document.getElementById('party-message');

  const winnerScreen = document.getElementById('winner-screen');
  const winnerText = document.getElementById('winner-text');
  const winnerBackBtn = document.getElementById('winner-back-btn');

  // Sounds
  const sounds = {
    bgMusic: new Audio('https://cdn.pixabay.com/download/audio/2021/10/22/audio_6b418bb504.mp3?filename=happy-upbeat-instrumental-12755.mp3'),
    flip: new Audio('https://cdn.pixabay.com/download/audio/2021/08/04/audio_d9826e30f3.mp3?filename=wood-plank-flick-6062.mp3'),
    match: new Audio('https://cdn.pixabay.com/download/audio/2021/08/04/audio_77f74712d8.mp3?filename=cartoon-clang-wobble-6072.mp3'),
    fail: new Audio('https://cdn.pixabay.com/download/audio/2021/08/04/audio_1022c8925e.mp3?filename=boing-6061.mp3'),
  };
  sounds.bgMusic.loop = true;
  sounds.bgMusic.volume = 0.15;

  // Game variables
  let currentUser = null;
  let darkMode = false;

  // Duel mode variables
  const emojiSets = {
    easy: ["🍎", "🍌", "🍇", "🍉"],
    medium: ["🍎", "🍌", "🍇", "🍉", "🥝", "🍒"],
    hard: ["🍎", "🍌", "🍇", "🍉", "🥝", "🍒", "🍓", "🍍"],
    extreme: ["🍎", "🍌", "🍇", "🍉", "🥝", "🍒", "🍓", "🍍", "🥥", "🥑"],
    impossible: ["🍎","🍌","🍇","🍉","🥝","🍒","🍓","🍍","🥥","🥑","🥭","🍋"]
  };
  const revealTimes = {
    easy: 1200,
    medium: 1400,
    hard: 1600,
    extreme: 1800,
    impossible: 2000
  };
  let firstCard = null;
  let secondCard = null;
  let lockBoard = false;
  let matchedPairs = 0;
  let totalPairs = 0;

  // Party mode variables (not fully implemented here for brevity)

  // Owner reserved
  const ownerUser = 'Owner';
  const ownerPass = 'ownerpass';

  // --- FUNCTIONS ---

  function showMainMenu() {
    hideAll();
    mainMenu.style.display = 'flex';
    sounds.bgMusic.play().catch(() => {});
  }
  function hideAll() {
    [mainMenu, gameScreen, partyScreen, winnerScreen].forEach(el => el.style.display = 'none');
  }
  function togglePassword(id) {
    const input = document.getElementById(id);
    input.type = (input.type === 'password') ? 'text' : 'password';
  }

  // Switch login/register screens
  toRegister.onclick = () => {
    loginScreen.style.display = 'none';
    registerScreen.style.display = 'block';
  };
  toLogin.onclick = () => {
    registerScreen.style.display = 'none';
    loginScreen.style.display = 'block';
  };

  // Register logic
  registerBtn.onclick = () => {
    const u = document.getElementById('register-username').value.trim();
    const p = document.getElementById('register-password').value.trim();
    if (!u || !p) return alert('Please enter username and password.');
    if (u === ownerUser) return alert('Username "Owner" is reserved.');
    if (localStorage.getItem('user_' + u) !== null) return alert('Username already taken.');
    localStorage.setItem('user_' + u, p);
    alert('Registered successfully! Please login.');
    toLogin.onclick();
  };

  // Login logic
  loginBtn.onclick = () => {
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value.trim();
    if (!u || !p) return alert('Please enter username and password.');

    if ((u === ownerUser && p === ownerPass) || localStorage.getItem('user_' + u) === p) {
      currentUser = u;
      userDisplay.textContent = currentUser;
      showGameScreen();
      alert(`Welcome, ${currentUser}! Login successful.`);
    } else {
      alert('Wrong username or password.');
    }
  };

  logoutBtn.onclick = () => {
    currentUser = null;
    hideAll();
    showMainMenu();
  };

  toggleDarkBtn.onclick = () => {
    darkMode = !darkMode;
    document.body.classList.toggle('dark-mode', darkMode);
  };

  backMainBtnGame.onclick = () => {
    if(confirm("Quit current game and go back to menu?")) {
      hideAll();
      showMainMenu();
    }
  };

  loginEye.onclick = () => togglePassword('login-password');
  registerEye.onclick = () => togglePassword('register-password');

  // Duel game functions

  function resetDuelBoard() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    matchedPairs = 0;
    gameMessage.textContent = '';
    gameBoard.innerHTML = '';
  }

  function startDuel() {
    resetDuelBoard();
    const level = levelSelect.value;
    const emojis = emojiSets[level];
    totalPairs = emojis.length;
    const deck = [...emojis, ...emojis];
    deck.sort(() => Math.random() - 0.5);

    gameBoard.style.gridTemplateColumns = `repeat(${Math.min(totalPairs, 6)}, 1fr)`;

    deck.forEach(emoji => {
      const card = document.createElement('div');
      card.className = 'card';
      card.dataset.value = emoji;
      card.textContent = '';
      card.onclick = () => duelReveal(card);
      gameBoard.appendChild(card);
    });

    // Show all cards face up briefly
    gameBoard.querySelectorAll('.card').forEach(card => {
      card.textContent = card.dataset.value;
    });

    setTimeout(() => {
      gameBoard.querySelectorAll('.card').forEach(card => {
        card.textContent = '';
      });
      gameMessage.textContent = "Game started! Find pairs.";
    }, revealTimes[level]);
  }

  function duelReveal(card) {
    if (lockBoard) return;
    if (card === firstCard) return;

    card.textContent = card.dataset.value;
    sounds.flip.play().catch(() => {});

    if (!firstCard) {
      firstCard = card;
      return;
    }
    secondCard = card;
    lockBoard = true;

    if (firstCard.dataset.value === secondCard.dataset.value) {
      sounds.match.play().catch(() => {});
      matchedPairs++;
      firstCard.style.backgroundColor = '#27ae60';
      secondCard.style.backgroundColor = '#27ae60';

      firstCard.onclick = null;
      secondCard.onclick = null;
      resetSelection();

      if (matchedPairs === totalPairs) {
        gameMessage.textContent = "You won! 🎉";
        setTimeout(() => {
          showWinnerScreen(`${currentUser} won the duel!`);
        }, 1500);
      }
    } else {
      sounds.fail.play().catch(() => {});
      setTimeout(() => {
        firstCard.textContent = '';
        secondCard.textContent = '';
        resetSelection();
      }, 1000);
    }
  }

  function resetSelection() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
  }

  function showGameScreen() {
    hideAll();
    gameScreen.style.display = 'block';
    resetDuelBoard();
  }

  function showWinnerScreen(text) {
    hideAll();
    winnerText.textContent = text;
    winnerScreen.style.display = 'block';
  }

  winnerBackBtn.onclick = () => {
    hideAll();
    showMainMenu();
  };

  startDuelBtn.onclick = startDuel;

});
