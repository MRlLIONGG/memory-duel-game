// Welcome transition logic
window.addEventListener('load', () => {
  setTimeout(() => {
    const welcome = document.getElementById('welcome-screen');
    const main = document.getElementById('main-content');
    welcome.style.transition = 'opacity 1s';
    welcome.style.opacity = 0;

    setTimeout(() => {
      welcome.style.display = 'none';
      main.style.display = 'block';
      main.style.opacity = 0;
      setTimeout(() => {
        main.style.transition = 'opacity 1s';
        main.style.opacity = 1;
      }, 50);
    }, 1000);
  }, 3000); // wait 3 seconds before fade
});

// Dummy button actions
function startDuel() {
  alert("Duel started!");
}

function openSettings() {
  alert("Settings window here!");
}

function chooseDifficulty() {
  alert("Choose your difficulty!");
}
