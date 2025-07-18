let currentUser = null;
let partyPlayersData = [];
let currentTurn = 0;
let playerErrors = [];
let partyCode = null;
let duelCards = [];
let duelFirstCard = null;
let duelSecondCard = null;
let duelLockBoard = false;
let duelMatchedPairs = 0;

const emojiSets = {
  easy: ["🍎", "🍌", "🍇", "🍉"],
  medium: ["🍎", "🍌", "🍇", "🍉", "🥝", "🍒"],
  hard: ["🍎", "🍌", "🍇", "🍉", "🥝", "🍒", "🍓", "🍍"],
  extreme: ["🍎", "🍌", "🍇", "🍉", "🥝", "🍒", "🍓", "🍍", "🥥", "🥑"],
  impossible: ["🍎", "🍌", "🍇", "🍉", "🥝", "🍒", "🍓", "🍍", "🥥", "🥑", "🍔", "🍟"]
};

const bgMusic = document.getElementById("background-music");
const masterVolumeControl = document.getElementById("master-volume");
const musicVolumeControl = document.getElementById("music-volume");

window.onload = () => {
  setTimeout(() => {
    const welcome = document.getElementById('welcome-screen');
    welcome.classList.add('fadeout');
    setTimeout(() => {
      welcome.style.display = 'none';
      document.getElementById('main-container').style.display = 'block';
      showAuthScreen();
    }, 1000);
  }, 2500);

  setVolumes();
  masterVolumeControl?.addEventListener('input', setVolumes);
  musicVolumeControl?.addEventListener('input', setVolumes);

  bgMusic.play().catch(() => {});

  document.getElementById('login-eye').onclick = () => togglePassword('login-password');
  document.getElementById('register-eye').onclick = () => togglePassword('register-password');

  document.getElementById('to-register').onclick = () => switchAuthScreens('register');
  document.getElementById('to-login').onclick = () => switchAuthScreens('login');

  document.getElementById('register-btn').onclick = register;
  document.getElementById('login-btn').onclick = login;

  document.getElementById('btn-duel').onclick = () => {
    hideAllScreens();
    document.getElementById('duel-screen').style.display = 'block';
  };
  document.getElementById('btn-party').onclick = () => {
    hideAllScreens();
    document.getElementById('party-screen').style.display = 'block';
  };
  document.getElementById('btn-settings').onclick = () => {
    hideAllScreens();
    document.getElementById('settings-screen').style.display = 'block';
  };
  document.getElementById('btn-logout').onclick = logout;

  document.querySelectorAll('.btn-back').forEach(btn => {
    btn.onclick = () => {
      hideAllScreens();
      document.getElementById('menu-screen').style.display = 'block';
    };
  });

  document.getElementById('start-duel-btn').onclick = startDuel;

  document.getElementById('create-party-btn').onclick = createParty;
  document.getElementById('join-party-btn').onclick = joinParty;
  document.getElementById('party-end-turn').onclick = endPartyTurn;
  document.getElementById('party-leave-btn').onclick = leaveParty;
};

function setVolumes() {
  let masterVol = parseFloat(masterVolumeControl.value);
  let musicVol = parseFloat(musicVolumeControl.value);
  bgMusic.volume = masterVol * musicVol;
}

function togglePassword(id) {
  const input = document.getElementById(id);
  input.type = input.type === 'password' ? 'text' : 'password';
}

function switchAuthScreens(screen) {
  if(screen === 'login'){
    document.getElementById('login-screen').style.display = 'block';
    document.getElementById('register-screen').style.display = 'none';
  } else {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('register-screen').style.display = 'block';
  }
}

function showAuthScreen() {
  document.getElementById('auth-container').style.display = 'block';
  switchAuthScreens('login');
  document.getElementById('menu-screen').style.display = 'none';
  hidePartyControls();
}

function register() {
  const user = document.getElementById('register-username').value.trim();
  const pass = document.getElementById('register-password').value.trim();
  if (!user || !pass) return alert("Please fill in all fields.");
  if (user.toLowerCase() === 'owner') return alert("Username 'Owner' is reserved.");
  if (localStorage.getItem(`user_${user}`)) return alert("User already exists.");
  localStorage.setItem(`user_${user}`, pass);
  alert("Registered! You can now log in.");
  switchAuthScreens('login');
}

function login() {
  const user = document.getElementById('login-username').value.trim();
  const pass = document.getElementById('login-password').value.trim();
  if (!user || !pass) return alert("Please fill in all fields.");
  if ((user === 'Owner' && pass === 'ownerpass') || localStorage.getItem(`user_${user}`) === pass) {
    currentUser = user;
    alert(`Welcome, ${user}! Login successful.`);
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('menu-screen').style.display = 'block';
  } else {
    alert("Wrong username or password.");
  }
}

function logout() {
  currentUser = null;
  hideAllScreens();
  showAuthScreen();
  alert("Logged out.");
}

function hideAllScreens() {
  ['auth-container', 'menu-screen', 'duel-screen', 'party-screen', 'settings-screen'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.style.display = 'none';
  });
  hidePartyControls();
}

function hidePartyControls() {
  document.getElementById('party-end-turn').style.display = 'none';
  document.getElementById('party-leave-btn').style.display = 'none';
  document.getElementById('party-info').textContent = '';
  document.getElementById('party-game-board').innerHTML = '';
  document.getElementById('party-game-message').textContent = '';
  partyPlayersData = [];
  playerErrors = [];
  partyCode = null;
  currentTurn = 0;
  clearTimeout(partyTurnTimer);
}

// Duel mode logic
function startDuel() {
  const diff = document.getElementById('duel-difficulty').value;
  const emojis = emojiSets[diff];
  if(!emojis) return alert("Invalid difficulty");

  duelCards = shuffle([...emojis, ...emojis]);
  duelFirstCard = null;
  duelSecondCard = null;
  duelLockBoard = false;
  duelMatchedPairs = 0;

  const board = document.getElementById('duel-game-board');
  board.innerHTML = '';
  document.getElementById('duel-game-message').textContent = 'Memorize cards...';

  duelCards.forEach((emoji, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.emoji = emoji;
    card.dataset.index = index;
    card.textContent = '';
    card.onclick = () => flipCard(card);
    board.appendChild(card);
  });

  Array.from(board.children).forEach(card => {
    card.textContent = card.dataset.emoji;
    card.classList.add('flip');
  });

  setTimeout(() => {
    Array.from(board.children).forEach(card => {
      card.textContent = '';
      card.classList.remove('flip');
    });
    document.getElementById('duel-game-message').textContent = 'Start matching!';
  }, 1200);
}

function flipCard(card) {
  if(duelLockBoard || card.classList.contains('flip')) return;

  card.classList.add('flip');
  card.textContent = card.dataset.emoji;

  if(!duelFirstCard) {
    duelFirstCard = card;
  } else {
    duelSecondCard = card;
    duelLockBoard = true;

    if(duelFirstCard.dataset.emoji === duelSecondCard.dataset.emoji) {
      duelMatchedPairs++;
      duelFirstCard = null;
      duelSecondCard = null;
      duelLockBoard = false;
      if(duelMatchedPairs === duelCards.length / 2) {
        document.getElementById('duel-game-message').textContent = `You won! 🎉`;
      }
    } else {
      setTimeout(() => {
        duelFirstCard.classList.remove('flip');
        duelFirstCard.textContent = '';
        duelSecondCard.classList.remove('flip');
        duelSecondCard.textContent = '';
        duelFirstCard = null;
        duelSecondCard = null;
        duelLockBoard = false;
      }, 800);
    }
  }
}

// Party mode logic
let partyTurnTimer = null;
let partyFirstCard = null;
let partySecondCard = null;
let partyLockBoard = false;

function createParty() {
  partyPlayersData = [{name: currentUser, errors: 0}];
  partyCode = generatePartyCode();
  currentTurn = 0;
  playerErrors = [0];
  document.getElementById('party-info').textContent = `Party created! Code: ${partyCode}. Waiting for friend to join...`;
  document.getElementById('party-game-board').innerHTML = '';
  document.getElementById('party-game-message').textContent = '';
  document.getElementById('party-end-turn').style.display = 'none';
  document.getElementById('party-leave-btn').style.display = 'inline-block';
}

function joinParty() {
  const code = document.getElementById('join-party-code').value.trim().toUpperCase();
  if(!code || code !== partyCode) {
    alert("Party expired or invalid code.");
    return;
  }
  if(partyPlayersData.find(p => p.name === currentUser)) {
    alert("You are already in the party.");
    return;
  }
  partyPlayersData.push({name: currentUser, errors: 0});
  playerErrors = partyPlayersData.map(p => 0);
  document.getElementById('party-info').textContent = `Joined party: ${partyCode}. Players: ${partyPlayersData.map(p=>p.name).join(', ')}`;
  startPartyGame();
  document.getElementById('party-leave-btn').style.display = 'inline-block';
}

function startPartyGame() {
  if(partyPlayersData.length < 2) {
    document.getElementById('party-game-message').textContent = 'Waiting for at least 2 players...';
    return;
  }
  document.getElementById('party-game-message').textContent = `Player ${partyPlayersData[currentTurn].name}'s turn! Make a move within 5 seconds.`;
  document.getElementById('party-end-turn').style.display = 'inline-block';
  renderPartyCards();
  startTurnTimer();
}

function renderPartyCards() {
  const emojis = emojiSets.medium;
  let cards = shuffle([...emojis, ...emojis]);
  const board = document.getElementById('party-game-board');
  board.innerHTML = '';
  cards.forEach((emoji, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.emoji = emoji;
    card.dataset.index = i;
    card.textContent = '';
    card.onclick = () => partyFlipCard(card);
    board.appendChild(card);
  });

  partyFirstCard = null;
  partySecondCard = null;
  partyLockBoard = false;
}

function partyFlipCard(card) {
  if(partyLockBoard) return;
  if(card.classList.contains('flip')) return;

  card.classList.add('flip');
  card.textContent = card.dataset.emoji;

  if(!partyFirstCard) {
    partyFirstCard = card;
  } else {
    partySecondCard = card;
    partyLockBoard = true;

    if(partyFirstCard.dataset.emoji === partySecondCard.dataset.emoji) {
      partyFirstCard = null;
      partySecondCard = null;
      partyLockBoard = false;
    } else {
      playerErrors[currentTurn]++;
      updatePartyMessage(`Wrong match! Player ${partyPlayersData[currentTurn].name} has ${playerErrors[currentTurn]} errors.`);
      setTimeout(() => {
        partyFirstCard.classList.remove('flip');
        partyFirstCard.textContent = '';
        partySecondCard.classList.remove('flip');
        partySecondCard.textContent = '';
        partyFirstCard = null;
        partySecondCard = null;
        partyLockBoard = false;
      }, 800);
    }
  }
}

function updatePartyMessage(text) {
  document.getElementById('party-game-message').textContent = text;
}

function startTurnTimer() {
  clearTimeout(partyTurnTimer);
  partyTurnTimer = setTimeout(() => {
    playerErrors[currentTurn]++;
    updatePartyMessage(`Time up! Player ${partyPlayersData[currentTurn].name} gets +1 error. Total errors: ${playerErrors[currentTurn]}`);
    endPartyTurn();
  }, 10000); // 10 seconds to play turn
}

function endPartyTurn() {
  clearTimeout(partyTurnTimer);

  if (partyFirstCard && partySecondCard) {
    // if cards flipped and match not resolved, reset them
    partyFirstCard.classList.remove('flip');
    partyFirstCard.textContent = '';
    partySecondCard.classList.remove('flip');
    partySecondCard.textContent = '';
  }
  partyFirstCard = null;
  partySecondCard = null;
  partyLockBoard = false;

  currentTurn++;
  if(currentTurn >= partyPlayersData.length) currentTurn = 0;

  document.getElementById('party-game-message').textContent = `Player ${partyPlayersData[currentTurn].name}'s turn!`;

  startTurnTimer();
}

function leaveParty() {
  if(!partyPlayersData || partyPlayersData.length === 0) return;

  const leavingIndex = partyPlayersData.findIndex(p => p.name === currentUser);
  if(leavingIndex === -1) return;

  // Remove player
  partyPlayersData.splice(leavingIndex, 1);
  playerErrors.splice(leavingIndex, 1);

  if(partyPlayersData.length === 0) {
    // No players left - reset party state and UI
    partyCode = null;
    currentTurn = 0;
    document.getElementById('party-info').textContent = 'Party ended.';
    document.getElementById('party-game-board').innerHTML = '';
    document.getElementById('party-game-message').textContent = '';
    document.getElementById('party-end-turn').style.display = 'none';
    document.getElementById('party-leave-btn').style.display = 'none';
  } else {
    // Adjust current turn if needed
    if(currentTurn >= partyPlayersData.length) currentTurn = 0;

    document.getElementById('party-info').textContent = `Players: ${partyPlayersData.map(p => p.name).join(', ')}`;
    document.getElementById('party-game-message').textContent = `Player ${partyPlayersData[currentTurn].name}'s turn!`;
    renderPartyCards();
    startTurnTimer();
  }
}

// Utility: shuffle array
function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while(currentIndex !== 0){
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

// Utility: generate random 5 letter uppercase party code
function generatePartyCode(){
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = '';
  for(let i=0; i<5; i++){
    code += chars.charAt(Math.floor(Math.random()*chars.length));
  }
  return code;
}
