// skript.js — simple BuildNow-like prototype (2D top-down)
// Drop index.html, style.css, skript.js in same folder and open index.html
(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const uiYou = document.getElementById('youScore');
  const uiBots = document.getElementById('botsScore');
  const startBtn = document.getElementById('start');
  const modeSelect = document.getElementById('mode');

  // --- Game constants
  const PLAYER_RADIUS = 14;
  const PLAYER_SPEED = 2.4;
  const BULLET_SPEED = 8;
  const BULLET_LIFE = 60; // frames
  const BUILD_SIZE = 34;
  const RESPAWN_TIME = 60; // frames
  const BOT_COUNT_FFA = 3;

  // Input
  const keys = {};
  let mouse = { x: W/2, y: H/2, down: false, rightDown: false };

  window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
  window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener('mousedown', e => {
    if (e.button === 0) mouse.down = true;
    if (e.button === 2) mouse.rightDown = true;
  });
  canvas.addEventListener('mouseup', e => {
    if (e.button === 0) mouse.down = false;
    if (e.button === 2) mouse.rightDown = false;
  });
  canvas.addEventListener('contextmenu', e => e.preventDefault());

  // Game state
  let players = []; // {id, x,y, vx,vy, angle, hp, name, isBot, score, spawnTimer}
  let bullets = []; // {x,y,vx,vy,owner,life}
  let blocks = [];  // {x,y,w,h,owner} placed blocks
  let mode = '1v1';
  let editMode = false;

  // Helpers
  let idCounter = 1;
  const rand = (a,b) => Math.random()*(b-a)+a;
  const dist2 = (a,b,c,d) => (a-c)*(a-c)+(b-d)*(b-d);

  function spawnPlayer(isBot=false, name='Bot') {
    const id = idCounter++;
    const x = rand(120, W-120);
    const y = rand(120, H-120);
    const p = { id, x, y, vx:0, vy:0, angle:0, hp:100, name: isBot? (name+(id%100)) : 'You', isBot, score:0, spawnTimer:0 };
    players.push(p);
    return p;
  }

  function resetGame() {
    players = [];
    bullets = [];
    blocks = [];
    idCounter = 1;
    // spawn player (user)
    spawnPlayer(false, 'You');
    // bots
    if (mode === '1v1') spawnPlayer(true, 'Bot');
    else for (let i=0;i<BOT_COUNT_FFA;i++) spawnPlayer(true, 'Bot');
    updateUI();
  }

  function updateUI() {
    const you = players.find(p => !p.isBot);
    const botsScore = players.filter(p => p.isBot).reduce((a,b)=>a+b.score,0);
    uiYou.textContent = `You: ${you?you.score:0}`;
    uiBots.textContent = `Bots: ${botsScore}`;
  }

  // Input -> player control
  function playerTick(player) {
    if (player.spawnTimer > 0) {
      player.spawnTimer--;
      return;
    }
    if (!player.isBot) {
      // Movement
      let mvx = 0, mvy = 0;
      if (keys['w']) mvy -= 1;
      if (keys['s']) mvy += 1;
      if (keys['a']) mvx -= 1;
      if (keys['d']) mvx += 1;
      const len = Math.hypot(mvx, mvy) || 1;
      player.vx = (mvx/len)*PLAYER_SPEED;
      player.vy = (mvy/len)*PLAYER_SPEED;
      player.x += player.vx;
      player.y += player.vy;
      // Aim
      player.angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
      // Shooting
      if (mouse.down) {
        tryShoot(player);
      }
      // Building / editing
      if (mouse.rightDown) {
        handleBuildOrRemove(player);
        // small cooldown so it doesn't spam a million blocks
        mouse.rightDown = false;
      }
      // Respawn
      if (keys['r'] && player.hp <= 0) doRespawn(player);
    } else {
      // very simple bot AI
      simpleBotAI(player);
    }
    // confine to bounds
    player.x = Math.max(16, Math.min(W-16, player.x));
    player.y = Math.max(16, Math.min(H-16, player.y));
  }

  function doRespawn(p) {
    p.hp = 100;
    p.x = rand(120, W-120);
    p.y = rand(120, H-120);
    p.spawnTimer = 0;
  }

  // Build/remove
  let lastBuildTick = 0;
  function handleBuildOrRemove(player) {
    // place block centered on cursor grid aligned
    const bx = Math.floor(mouse.x / BUILD_SIZE) * BUILD_SIZE + BUILD_SIZE/2;
    const by = Math.floor(mouse.y / BUILD_SIZE) * BUILD_SIZE + BUILD_SIZE/2;
    // editMode true => remove block
    if (editMode) {
      // remove block if clicked near center
      for (let i = blocks.length-1; i>=0; i--) {
        const b = blocks[i];
        if (Math.hypot(b.x - bx, b.y - by) < BUILD_SIZE/1.5) {
          blocks.splice(i,1);
          return;
        }
      }
    } else {
      // avoid piling on same spot
      const exists = blocks.some(b => Math.hypot(b.x - bx, b.y - by) < 6);
      if (!exists) {
        blocks.push({ x: bx, y: by, w: BUILD_SIZE, h: BUILD_SIZE, owner: player.id });
      }
    }
  }

  // Shooting
  let lastShoot = 0;
  function tryShoot(p) {
    if (p.hp <= 0) return;
    const now = performance.now();
    // simple fire rate limit
    if (p._lastShot && now - p._lastShot < 160) return;
    p._lastShot = now;
    const angle = p.angle;
    bullets.push({
      x: p.x + Math.cos(angle)*(PLAYER_RADIUS+6),
      y: p.y + Math.sin(angle)*(PLAYER_RADIUS+6),
      vx: Math.cos(angle)*BULLET_SPEED,
      vy: Math.sin(angle)*BULLET_SPEED,
      owner: p.id,
      life: BULLET_LIFE
    });
  }

  // Collisions: bullets -> players/blocks
  function bulletTick(b) {
    b.x += b.vx; b.y += b.vy; b.life--;
    // hit block?
    for (let i = blocks.length-1; i >= 0; i--) {
      const bl = blocks[i];
      if (b.x > bl.x - bl.w/2 && b.x < bl.x + bl.w/2 && b.y > bl.y - bl.h/2 && b.y < bl.y + bl.h/2) {
        // bullet destroyed, weaken or destroy block (simple)
        // remove block occasionally
        if (Math.random() < 0.6) blocks.splice(i,1);
        b.life = 0;
        return;
      }
    }
    // hit player
    for (let p of players) {
      if (p.id === b.owner) continue; // no self-hit
      if (p.hp <= 0) continue;
      const d2 = dist2(b.x,b.y,p.x,p.y);
      if (d2 < (PLAYER_RADIUS+4)*(PLAYER_RADIUS+4)) {
        // damage
        p.hp -= 22;
        b.life = 0;
        if (p.hp <= 0) {
          // award score to owner
          const owner = players.find(x => x.id === b.owner);
          if (owner) owner.score++;
          p.spawnTimer = RESPAWN_TIME;
          p.hp = 0;
        }
        updateUI();
        return;
      }
    }
    // out of bounds
    if (b.x < -10 || b.y < -10 || b.x > W+10 || b.y > H+10 || b.life <= 0) {
      b.life = 0;
      return;
    }
  }

  // VERY simple bot AI (move toward nearest enemy, shoot)
  function simpleBotAI(bot) {
    if (bot.spawnTimer > 0) return;
    // find nearest enemy
    const enemies = players.filter(p => p.id !== bot.id && p.hp > 0);
    if (enemies.length === 0) { bot.vx = bot.vy = 0; return; }
    const target = enemies.reduce((acc,p) => {
      const d = dist2(bot.x,bot.y,p.x,p.y);
      return (!acc || d < acc.d) ? {p,d} : acc;
    }, null).p;
    // aim
    bot.angle = Math.atan2(target.y - bot.y, target.x - bot.x);
    // move toward but keep some distance
    const dx = target.x - bot.x, dy = target.y - bot.y;
    const d = Math.hypot(dx,dy);
    if (d > 140) {
      bot.vx = (dx/d)*PLAYER_SPEED*0.9;
      bot.vy = (dy/d)*PLAYER_SPEED*0.9;
    } else {
      // strafe a bit
      bot.vx = Math.cos(bot.angle + Math.PI/2)*PLAYER_SPEED*0.7;
      bot.vy = Math.sin(bot.angle + Math.PI/2)*PLAYER_SPEED*0.7;
    }
    bot.x += bot.vx;
    bot.y += bot.vy;
    // shoot occasionally if in range and roughly aimed
    if (d < 420 && Math.random() < 0.06) {
      tryShoot(bot);
    }
    // occasionally build a block near itself for cover
    if (Math.random() < 0.01) {
      const bx = Math.floor((bot.x + rand(-60,60)) / BUILD_SIZE) * BUILD_SIZE + BUILD_SIZE/2;
      const by = Math.floor((bot.y + rand(-60,60)) / BUILD_SIZE) * BUILD_SIZE + BUILD_SIZE/2;
      const exists = blocks.some(b => Math.hypot(b.x - bx, b.y - by) < 6);
      if (!exists) blocks.push({x:bx,y:by,w:BUILD_SIZE,h:BUILD_SIZE, owner: bot.id});
    }
  }

  // main loop
  let frame = 0;
  function tick() {
    frame++;
    // update players
    for (let p of players) {
      playerTick(p);
    }
    // update bullets
    for (let i = bullets.length-1; i>=0; i--) {
      bulletTick(bullets[i]);
      if (bullets[i].life <= 0) bullets.splice(i,1);
    }
    // respawn logic
    for (let p of players) {
      if (p.spawnTimer > 0) {
        p.spawnTimer--;
        if (p.spawnTimer <= 0) doRespawn(p);
      }
    }
    render();
    requestAnimationFrame(tick);
  }

  // rendering
  function render() {
    // clear
    ctx.clearRect(0,0,W,H);
    // draw grid lightly
    ctx.save();
    ctx.globalAlpha = 0.06;
    for (let gx=0; gx<W; gx+=BUILD_SIZE) {
      ctx.fillRect(gx,0,1,H);
    }
    for (let gy=0; gy<H; gy+=BUILD_SIZE) {
      ctx.fillRect(0,gy,W,1);
    }
    ctx.restore();

    // draw blocks
    for (let b of blocks) {
      ctx.fillStyle = '#8e6b3a';
      ctx.fillRect(b.x - b.w/2, b.y - b.h/2, b.w, b.h);
      ctx.strokeStyle = '#5a3f21';
      ctx.strokeRect(b.x - b.w/2, b.y - b.h/2, b.w, b.h);
    }

    // draw bullets
    for (let bl of bullets) {
      ctx.beginPath();
      ctx.arc(bl.x, bl.y, 4, 0, Math.PI*2);
      ctx.fillStyle = '#ffd966';
      ctx.fill();
    }

    // draw players
    for (let p of players) {
      // dead ghost
      if (p.hp <= 0) {
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.arc(p.x, p.y, PLAYER_RADIUS, 0, Math.PI*2);
        ctx.fillStyle = '#bbbbbb';
        ctx.fill();
        ctx.restore();
        continue;
      }
      // body
      ctx.beginPath();
      ctx.arc(p.x, p.y, PLAYER_RADIUS, 0, Math.PI*2);
      ctx.fillStyle = p.isBot ? '#ff7a7a' : '#7ad1ff';
      ctx.fill();
      // barrel/aim
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = '#222';
      ctx.fillRect(8, -4, 18, 8);
      ctx.restore();
      // name
      ctx.fillStyle = '#eaf7ff';
      ctx.font = '12px Inter, Arial';
      ctx.textAlign = 'center';
      ctx.fillText(p.name, p.x, p.y - PLAYER_RADIUS - 8);
      // hp bar
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(p.x - 20, p.y + PLAYER_RADIUS + 6, 40, 6);
      ctx.fillStyle = '#4ad36a';
      ctx.fillRect(p.x - 20, p.y + PLAYER_RADIUS + 6, 40 * (p.hp/100), 6);
    }

    // HUD: player hp
    const you = players.find(p => !p.isBot);
    if (you) {
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(10, H-60, 260, 44);
      ctx.fillStyle = '#fff';
      ctx.font = '14px Inter, Arial';
      ctx.fillText(`HP: ${Math.max(0,Math.round(you.hp))}`, 30, H-34);
      ctx.fillText(`Score: ${you.score}`, 140, H-34);
      ctx.fillText(`Mode: ${editMode ? 'EDIT' : 'PLAY'}`, 220, H-34);
    }
  }

  // start handler
  startBtn.addEventListener('click', () => {
    mode = modeSelect.value;
    resetGame();
  });
  // toggle edit mode
  window.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'e') editMode = !editMode;
  });

  // init default
  resetGame();
  tick();

  // expose small API for console tinkering
  window._game = { players, bullets, blocks, spawnPlayer, resetGame, get mode() { return mode; } };

})();
