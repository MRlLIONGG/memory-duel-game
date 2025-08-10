// Mini BuildNow-like prototype (single-player)
// - Three.js scene with a grid ground
// - Click to place a colored cube snapped to grid
// - Right-click to remove, rotate current block, undo, reset, submit (snapshot)
// - Timer + UI

(() => {
  // Basic scene setup
  const canvas = document.getElementById('gameCanvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x071023, 0.0025);

  const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 2000);
  camera.position.set(30, 30, 30);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 10;
  controls.maxDistance = 200;
  controls.maxPolarAngle = Math.PI / 2.1;

  // Lights
  const hemi = new THREE.HemisphereLight(0xbfefff, 0x202040, 0.6);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xa6f7ff, 0.9);
  dir.position.set(40, 60, 10);
  dir.castShadow = true;
  scene.add(dir);

  // Ground grid
  const gridSize = 28;
  const cellSize = 1;
  const ground = new THREE.GridHelper(gridSize, gridSize, 0x2a6b78, 0x16232b);
  ground.position.y = 0;
  scene.add(ground);

  // invisible plane for raycasting
  const planeGeo = new THREE.PlaneGeometry(1000, 1000);
  const planeMat = new THREE.MeshBasicMaterial({ visible: false });
  const plane = new THREE.Mesh(planeGeo, planeMat);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = cellSize / 2;
  scene.add(plane);

  // block container
  const blocks = new Map(); // key = "x,z,y" string -> mesh
  const placedStack = []; // for undo

  // palette colors
  const palette = [
    '#ff6b6b', '#ffd166', '#06d6a0', '#4ec5ff', '#9d7aff', '#ffffff', '#ff9bb3', '#ffa97a'
  ];
  // create UI palette
  const colorsDiv = document.getElementById('colors');
  let currentColor = palette[3];
  palette.forEach((c, idx) => {
    const b = document.createElement('button');
    b.className = 'colorBtn' + (idx === 3 ? ' selected' : '');
    b.style.background = c;
    b.title = c;
    b.onclick = () => {
      document.querySelectorAll('.colorBtn').forEach(x => x.classList.remove('selected'));
      b.classList.add('selected');
      currentColor = c;
    };
    colorsDiv.appendChild(b);
  });

  // helpers
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const pointer = new THREE.Vector2();

  function screenToWorldPointer(evt) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
  }

  function snapToGrid(v) {
    // grid center at origin; cell size 1
    return Math.round(v);
  }

  // base cube geometry and materials
  const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
  function matForColor(c) {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(c),
      metalness: 0.2,
      roughness: 0.3,
      emissive: new THREE.Color(c).multiplyScalar(0.07)
    });
  }

  // preview cube (follows cursor)
  const previewMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(currentColor),
    opacity: 0.75, transparent: true, roughness: 0.6
  });
  const preview = new THREE.Mesh(cubeGeo, previewMat);
  preview.position.y = 0.5;
  preview.visible = true;
  scene.add(preview);

  // UI elements
  const blockCountEl = document.getElementById('blockCount');
  const timerEl = document.getElementById('timer');
  const messageEl = document.getElementById('message');

  // controls from UI
  let rotationY = 0; // rotation in 90° steps
  document.getElementById('rotateBtn').onclick = () => {
    rotationY = (rotationY + 1) % 4;
    preview.rotation.y = rotationY * Math.PI / 2;
    flashMessage('Rotated');
  };
  let eraseMode = false;
  const deleteBtn = document.getElementById('deleteBtn');
  deleteBtn.onclick = () => {
    eraseMode = !eraseMode;
    deleteBtn.classList.toggle('danger', eraseMode);
    deleteBtn.textContent = eraseMode ? 'Erasing' : 'Erase';
  };
  document.getElementById('undoBtn').onclick = () => {
    const last = placedStack.pop();
    if (last) {
      const key = last.key;
      const mesh = blocks.get(key);
      if (mesh) {
        scene.remove(mesh);
        blocks.delete(key);
        updateCount();
        flashMessage('Undo');
      }
    } else flashMessage('Nothing to undo');
  };
  document.getElementById('resetBtn').onclick = () => {
    blocks.forEach(m => scene.remove(m));
    blocks.clear();
    placedStack.length = 0;
    updateCount();
    flashMessage('Reset');
  };
  document.getElementById('submitBtn').onclick = () => {
    // take a snapshot
    renderer.render(scene, camera);
    const data = renderer.domElement.toDataURL('image/png');
    const w = window.open('');
    if (w) {
      w.document.write(`<img src="${data}" style="width:100%"><p style="color:#fff">Saved snapshot</p>`);
    }
  };

  // feedback
  function flashMessage(text, ms = 1100) {
    messageEl.textContent = text;
    messageEl.classList.remove('hidden');
    setTimeout(() => messageEl.classList.add('hidden'), ms);
  }

  // add / remove block functions
  function blockKey(x, y, z) { return `${x}_${y}_${z}` }
  function addBlock(x, y, z, color, rot = 0) {
    const key = blockKey(x, y, z);
    if (blocks.has(key)) return false;
    const mat = matForColor(color);
    const m = new THREE.Mesh(cubeGeo, mat);
    m.position.set(x, y, z);
    m.rotation.y = rot * Math.PI / 2;
    scene.add(m);
    blocks.set(key, m);
    placedStack.push({ key, color, rot });
    updateCount();
    return true;
  }
  function removeBlock(x, y, z) {
    const key = blockKey(x, y, z);
    const mesh = blocks.get(key);
    if (!mesh) return false;
    scene.remove(mesh);
    blocks.delete(key);
    updateCount();
    return true;
  }
  function updateCount() { blockCountEl.textContent = blocks.size }

  // pointer interaction
  let isPointerDown = false;

  function handlePlace(evt, isRightClick = false) {
    screenToWorldPointer(evt);
    const intersects = raycaster.intersectObject(plane);
    if (intersects.length === 0) return;
    const p = intersects[0].point;
    // snap to grid and place cube centered on grid
    const gx = snapToGrid(p.x);
    const gz = snapToGrid(p.z);
    const gy = 0.5; // single-layer prototype

    if (eraseMode || isRightClick) {
      // remove block at gx, gy, gz
      if (removeBlock(gx, gy, gz)) flashMessage('Erased');
      else flashMessage('Nothing to erase');
    } else {
      // place
      if (addBlock(gx, gy, gz, currentColor, rotationY)) {
        // small pop animation via scaling
        const placed = blocks.get(blockKey(gx, gy, gz));
        placed.scale.set(0.1, 0.1, 0.1);
        new TWEEN.Tween(placed.scale).to({ x:1, y:1, z:1 }, 180).easing(TWEEN.Easing.Back.Out).start();
      } else {
        flashMessage('Block already here');
      }
    }
  }

  // integrate a tiny tween lib (we'll provide a tiny local implementation if TWEEN isn't available)
  // minimal Tween fallback:
  window.TWEEN = window.TWEEN || {
    _tweens: [],
    Tween(obj){ this.obj=obj; this.isRunning=false; this.toObj=null; this.duration=400; this.easing=(x)=>x; this.startTime=0;
      this.to=(to, dur)=>{ this.toObj=to; if(dur)this.duration=dur; return this; };
      this.easingFunc=(fn)=>{ this.easing=fn; return this; };
      this.start=function(){ this.startTime=performance.now(); this.orig={}; for(let k in this.toObj) this.orig[k]=this.obj[k]; window.TWEEN._tweens.push(this); this.isRunning=true; return this; };
      this._update=function(t){ const elapsed = (t - this.startTime)/this.duration; const p=Math.min(1,elapsed); const e=this.easing(p); for(let k in this.toObj) this.obj[k]=this.orig[k] + (this.toObj[k]-this.orig[k])*e; if(p>=1) this.isRunning=false; };
    },
    update(now){
      for(let i = this._tweens.length-1; i>=0; i--){
        const tw=this._tweens[i];
        if(tw.isRunning) tw._update(now);
        else this._tweens.splice(i,1);
      }
    },
    Easing:{
      Back:{
        Out:function(k){ return 1 - Math.pow(1-k,3); }
      }
    }
  };

  // mouse events
  renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());
  renderer.domElement.addEventListener('pointermove', e => {
    screenToWorldPointer(e);
    const ints = raycaster.intersectObject(plane);
    if (ints.length) {
      const p = ints[0].point;
      const gx = snapToGrid(p.x);
      const gz = snapToGrid(p.z);
      preview.position.set(gx, 0.5, gz);
      preview.material.color.set(currentColor);
      preview.rotation.y = rotationY * Math.PI / 2;
      preview.visible = true;
    } else preview.visible = false;
  });

  renderer.domElement.addEventListener('pointerdown', e => {
    if (e.button === 2) { // right click -> erase
      handlePlace(e, true);
    } else if (e.button === 0) {
      handlePlace(e, false);
    }
  });

  // touch support: tap to place (single-layer)
  renderer.domElement.addEventListener('touchstart', (ev) => {
    const t = ev.touches[0];
    handlePlace({ clientX: t.clientX, clientY: t.clientY }, false);
  });

  // window resize
  function onResize() {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize);
  onResize();

  // timer
  let totalSec = 120; // 2 minutes
  function tickTimer() {
    const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const ss = String(totalSec % 60).padStart(2, '0');
    timerEl.textContent = `${mm}:${ss}`;
    if (to
