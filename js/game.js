// Coin Rush 3D: scene, movement, coins, score, timer, and the HUD.
import * as THREE from 'three';
import { createPlayer } from './player.js';
import { loadPlayer, watchPlayer, signInUrl } from './startng.js';

const GAME_SECONDS = 60, SPEED = 7, HALF = 9.5; // platform is 20 x 20 (HALF keeps the player on it)
const $ = (id) => document.getElementById(id);

// ---------- Scene ----------
const renderer = new THREE.WebGLRenderer({ canvas: $('scene'), antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const scene = new THREE.Scene();
scene.background = new THREE.Color('#1b2338');
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
scene.add(new THREE.AmbientLight('#ffffff', 0.7));
const sun = new THREE.DirectionalLight('#ffffff', 0.9); sun.position.set(6, 12, 8); scene.add(sun);

const platform = new THREE.Mesh(new THREE.BoxGeometry(20, 0.5, 20), new THREE.MeshLambertMaterial({ color: '#3a7d5c' }));
platform.position.y = -0.25; scene.add(platform);
scene.add(new THREE.GridHelper(20, 10, '#2c6149', '#2c6149'));

function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  // On tall phone screens, pull the camera back so the whole platform fits.
  const d = camera.aspect < 1 ? 26 : 19;
  camera.position.set(0, d, d * 0.62); camera.lookAt(0, 0, 1);
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();

// ---------- Player + coin ----------
const player = createPlayer(); scene.add(player);

const coin = new THREE.Group();
const coinMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.12, 24), new THREE.MeshLambertMaterial({ color: '#ffd84d', emissive: '#6b5200' }));
coinMesh.rotation.x = Math.PI / 2; coin.add(coinMesh); coin.position.y = 1.2; scene.add(coin);

function moveCoin() { // random spot, not right on top of the player
  do { coin.position.x = (Math.random() * 2 - 1) * 8.5; coin.position.z = (Math.random() * 2 - 1) * 8.5; }
  while (coin.position.distanceTo(player.position) < 3);
}

// ---------- Input ----------
const held = { up: false, down: false, left: false, right: false };
const keyMap = { KeyW: 'up', ArrowUp: 'up', KeyS: 'down', ArrowDown: 'down', KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right' };
addEventListener('keydown', (e) => { if (keyMap[e.code]) { held[keyMap[e.code]] = true; e.preventDefault(); } });
addEventListener('keyup', (e) => { if (keyMap[e.code]) held[keyMap[e.code]] = false; });
addEventListener('blur', () => Object.keys(held).forEach((k) => (held[k] = false)));
document.querySelectorAll('#dpad button').forEach((b) => {
  const dir = b.dataset.dir;
  b.addEventListener('pointerdown', (e) => { held[dir] = true; e.preventDefault(); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => b.addEventListener(ev, () => (held[dir] = false)));
});

// ---------- Game state ----------
let state = 'ready', score = 0, timeLeft = GAME_SECONDS;

function startGame() {
  score = 0; timeLeft = GAME_SECONDS; state = 'playing';
  player.position.set(0, 0, 0); moveCoin();
  $('score').textContent = 0; $('time').textContent = GAME_SECONDS;
  $('overlay').classList.add('hidden'); $('restartBtn').hidden = false;
}
function endGame() {
  state = 'over'; $('time').textContent = 0;
  $('title').textContent = 'Game Over!'; $('msg').textContent = 'Nice run. Want to beat it?';
  $('final').hidden = false; $('finalScore').textContent = score;
  $('startBtn').textContent = 'Play again';
  $('overlay').classList.remove('hidden'); $('restartBtn').hidden = true;
}
$('startBtn').onclick = startGame;
$('restartBtn').onclick = startGame;

// ---------- Loop ----------
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
  coin.rotation.y += dt * 3; coin.position.y = 1.2 + Math.sin(t * 3) * 0.15;

  let moving = false;
  if (state === 'playing') {
    const x = (held.right ? 1 : 0) - (held.left ? 1 : 0), z = (held.down ? 1 : 0) - (held.up ? 1 : 0);
    if (x || z) {
      const len = Math.hypot(x, z); moving = true;
      player.position.x = THREE.MathUtils.clamp(player.position.x + (x / len) * SPEED * dt, -HALF, HALF);
      player.position.z = THREE.MathUtils.clamp(player.position.z + (z / len) * SPEED * dt, -HALF, HALF);
      player.rotation.y = Math.atan2(x, z);
    }
    if (Math.hypot(player.position.x - coin.position.x, player.position.z - coin.position.z) < 1.1) {
      score += 10; $('score').textContent = score; moveCoin();
    }
    timeLeft -= dt; $('time').textContent = Math.ceil(Math.max(timeLeft, 0));
    if (timeLeft <= 0) endGame();
  }
  player.userData.animate(t, moving);
  renderer.render(scene, camera);
});

// ---------- start.ng player (name + character style) ----------
function showPlayer(p) {
  player.userData.applyStyle(p.style);             // re-dress the character
  $('player').textContent = p.source === 'mock' ? `${p.name} (DEV MOCK, not start.ng)`
    : p.signedIn ? `${p.name}${p.account ? ' @' + p.account : ''}` : 'Guest';
  $('signin').hidden = p.signedIn || p.source === 'mock';
  $('signin').href = signInUrl();
}
watchPlayer(showPlayer);
