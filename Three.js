<!DOCTYPE html>
<html>
<head>
  <title>3D BuildNow GG Prototype</title>
  <style>body { margin: 0; overflow: hidden; }</style>
</head>
<body>
<script src="https://cdn.jsdelivr.net/npm/three@0.153.0/build/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.153.0/examples/js/controls/PointerLockControls.js"></script>
<script>
// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Player cube
const geometry = new THREE.BoxGeometry(1, 2, 1);
const material = new THREE.MeshStandardMaterial({color: 0x0077ff});
const player = new THREE.Mesh(geometry, material);
scene.add(player);

// Floor
const floorGeometry = new THREE.PlaneGeometry(100, 100);
const floorMaterial = new THREE.MeshStandardMaterial({color: 0x228822});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI/2;
scene.add(floor);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7);
scene.add(light);
const ambient = new THREE.AmbientLight(0x404040);
scene.add(ambient);

camera.position.set(0, 1.6, 5);

// Controls (PointerLock for FPS style)
const controls = new THREE.PointerLockControls(camera, document.body);
document.body.addEventListener('click', () => {
  controls.lock();
});

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const move = { forward: false, backward: false, left: false, right: false };

document.addEventListener('keydown', (e) => {
  switch(e.code) {
    case 'KeyW': move.forward = true; break;
    case 'KeyS': move.backward = true; break;
    case 'KeyA': move.left = true; break;
    case 'KeyD': move.right = true; break;
  }
});
document.addEventListener('keyup', (e) => {
  switch(e.code) {
    case 'KeyW': move.forward = false; break;
    case 'KeyS': move.backward = false; break;
    case 'KeyA': move.left = false; break;
    case 'KeyD': move.right = false; break;
  }
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  
  velocity.x -= velocity.x * 10.0 * delta;
  velocity.z -= velocity.z * 10.0 * delta;
  
  direction.z = Number(move.forward) - Number(move.backward);
  direction.x = Number(move.right) - Number(move.left);
  direction.normalize();
  
  if (move.forward || move.backward) velocity.z -= direction.z * 50.0 * delta;
  if (move.left || move.right) velocity.x -= direction.x * 50.0 * delta;
  
  controls.moveRight(-velocity.x * delta);
  controls.moveForward(-velocity.z * delta);
  
  renderer.render(scene, camera);
}

animate();
</script>
</body>
</html>
