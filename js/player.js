// A simple humanoid built from boxes and spheres.
// Call player.applyStyle(style) any time to re-dress it. Nothing else rebuilds.
import * as THREE from 'three';

const mat = (c) => new THREE.MeshLambertMaterial({ color: c });
// Use the value if it is a valid #rrggbb colour, else a fallback.
const color = (v, fb) => (/^#[0-9a-f]{6}$/i.test(v || '') ? v : fb);
const pick = (v, list, fb) => (list.includes(v) ? v : fb);

export function createPlayer() {
  const root = new THREE.Group();
  const skin = mat('#c68642'), top = mat('#4b7bec'), pants = mat('#2b2f4a'), hairM = mat('#17120f');
  const add = (geo, m, x, y, z, parent = root) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); parent.add(o); return o; };

  // Body parts (limbs pivot from the hip/shoulder so they can swing)
  const body = new THREE.Group(); body.position.y = 1.5; root.add(body);
  add(new THREE.BoxGeometry(0.9, 1, 0.5), top, 0, 0, 0, body);
  const head = new THREE.Group(); head.position.y = 2.3; root.add(head);
  add(new THREE.SphereGeometry(0.35, 16, 12), skin, 0, 0, 0, head);
  const limb = (m, w, h, x, y) => { const g = new THREE.Group(); g.position.set(x, y, 0); add(new THREE.BoxGeometry(w, h, w), m, 0, -h / 2, 0, g); root.add(g); return g; };
  const armL = limb(top, 0.25, 0.9, -0.6, 1.95), armR = limb(top, 0.25, 0.9, 0.6, 1.95);
  const legL = limb(pants, 0.32, 1, -0.22, 1), legR = limb(pants, 0.32, 1, 0.22, 1);
  // Hands in skin colour
  add(new THREE.BoxGeometry(0.26, 0.2, 0.26), skin, 0, -0.85, 0, armL);
  add(new THREE.BoxGeometry(0.26, 0.2, 0.26), skin, 0, -0.85, 0, armR);

  const headDecor = new THREE.Group(); head.add(headDecor);
  const bodyDecor = new THREE.Group(); body.add(bodyDecor);
  const clear = (g) => g.children.slice().forEach((c) => { c.geometry?.dispose(); c.material?.dispose?.(); g.remove(c); });

  function applyStyle(style = {}) {
    const primary = color(style.primaryColor, '#4b7bec'), secondary = color(style.secondaryColor, '#2b2f4a');
    skin.color.set(color(style.skinColor, '#c68642'));
    top.color.set(primary); pants.color.set(secondary);
    hairM.color.set(color(style.hairColor, '#17120f'));
    body.scale.x = pick(style.body, ['female', 'male'], 'male') === 'female' ? 0.85 : 1.05;

    clear(headDecor); clear(bodyDecor);
    const hair = pick(style.hair, ['short', 'afro', 'braids', 'bun', 'ponytail', 'dreads', 'bald'], 'short');
    const hat = pick(style.hat, ['none', 'cap', 'beanie', 'tophat', 'crown'], 'none');
    const acc = pick(style.accessory, ['none', 'glasses', 'earrings', 'beard', 'scarf', 'backpack'], 'none');
    const H = (g, m, x, y, z) => add(g, m, x, y, z, headDecor);
    const cap = () => H(new THREE.SphereGeometry(0.38, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), hairM, 0, 0.03, 0);

    // Hair
    if (hair === 'afro') H(new THREE.SphereGeometry(0.55, 14, 12), hairM, 0, 0.1, -0.03);
    else if (hair !== 'bald') cap();
    if (hair === 'braids') [-0.3, 0.3].forEach((x) => H(new THREE.CylinderGeometry(0.07, 0.07, 0.8, 8), hairM, x, -0.3, -0.05));
    if (hair === 'bun') H(new THREE.SphereGeometry(0.16, 10, 8), hairM, 0, 0.5, -0.05);
    if (hair === 'ponytail') { const p = H(new THREE.CylinderGeometry(0.1, 0.05, 0.7, 8), hairM, 0, -0.1, -0.4); p.rotation.x = 0.6; }
    if (hair === 'dreads') for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2;
      H(new THREE.CylinderGeometry(0.05, 0.05, 0.6, 6), hairM, Math.sin(a) * 0.33, -0.2, Math.cos(a) * 0.33 - 0.05); }

    // Hat (sits on top of the hair)
    const hatM = mat(secondary);
    if (hat === 'cap') { H(new THREE.SphereGeometry(0.4, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), hatM, 0, 0.08, 0); H(new THREE.BoxGeometry(0.5, 0.04, 0.3), hatM, 0, 0.1, 0.45); }
    if (hat === 'beanie') H(new THREE.SphereGeometry(0.42, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), hatM, 0, 0.1, 0);
    if (hat === 'tophat') { H(new THREE.CylinderGeometry(0.5, 0.5, 0.05, 16), mat('#222'), 0, 0.32, 0); H(new THREE.CylinderGeometry(0.28, 0.28, 0.5, 16), mat('#222'), 0, 0.58, 0); }
    if (hat === 'crown') H(new THREE.CylinderGeometry(0.34, 0.26, 0.28, 8), mat('#ffd84d'), 0, 0.45, 0);

    // Accessory
    if (acc === 'glasses') [-0.12, 0.12].forEach((x) => H(new THREE.BoxGeometry(0.2, 0.12, 0.05), mat('#111'), x, 0.04, 0.34));
    if (acc === 'earrings') [-0.36, 0.36].forEach((x) => H(new THREE.SphereGeometry(0.06, 8, 8), mat('#ffd84d'), x, -0.12, 0));
    if (acc === 'beard') H(new THREE.BoxGeometry(0.4, 0.2, 0.12), hairM, 0, -0.25, 0.27);
    if (acc === 'scarf') H(new THREE.CylinderGeometry(0.33, 0.33, 0.15, 14), hatM, 0, -0.38, 0);
    if (acc === 'backpack') add(new THREE.BoxGeometry(0.6, 0.7, 0.25), mat(secondary), 0, 0, -0.4, bodyDecor);
  }

  // Swing arms and legs while walking
  let swing = 0;
  function animate(t, moving) {
    swing += ((moving ? Math.sin(t * 10) * 0.8 : 0) - swing) * 0.3;
    legL.rotation.x = swing; legR.rotation.x = -swing;
    armL.rotation.x = -swing; armR.rotation.x = swing;
  }

  applyStyle();
  root.userData = { applyStyle, animate };
  return root;
}
