/* Abstract concept viewer. Swap in a .glb later via data-model. */
(function () {
  const canvas = document.getElementById("stage");
  if (!canvas || !window.THREE) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0.9, 0.35, 2.4);

  const ambient = new THREE.AmbientLight(0x8899aa, 0.55);
  const key = new THREE.DirectionalLight(0xffffff, 1.15);
  key.position.set(2, 3, 4);
  const rim = new THREE.DirectionalLight(0x88aacc, 0.6);
  rim.position.set(-3, 1, -2);
  scene.add(ambient, key, rim);

  const mat = new THREE.MeshStandardMaterial({
    color: 0xc9c6bf,
    metalness: 0.72,
    roughness: 0.28,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x2a2d33,
    metalness: 0.4,
    roughness: 0.5,
  });

  let group = new THREE.Group();
  scene.add(group);

  function clear() {
    scene.remove(group);
    group = new THREE.Group();
    scene.add(group);
  }

  function body(len, r) {
    const g = new THREE.CapsuleGeometry(r, len, 8, 24);
    const m = new THREE.Mesh(g, mat);
    m.rotation.z = Math.PI / 2;
    return m;
  }

  function fin(w, h, t, x, y) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, t, h), dark);
    m.position.set(x, y, 0);
    return m;
  }

  const builds = {
    fulmen() {
      const g = new THREE.Group();
      g.add(body(1.35, 0.055));
      const wing = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.012, 0.42), dark);
      wing.position.set(-0.1, 0, 0);
      g.add(wing);
      g.add(fin(0.08, 0.16, 0.01, -0.62, 0.08));
      g.add(fin(0.08, 0.16, 0.01, -0.62, -0.08));
      return g;
    },
    pilum() {
      const g = new THREE.Group();
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.05, 24), mat);
      cyl.rotation.z = Math.PI / 2;
      g.add(cyl);
      const nose = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 20), mat);
      nose.rotation.z = -Math.PI / 2;
      nose.position.x = 0.62;
      g.add(nose);
      return g;
    },
    contus() {
      const g = new THREE.Group();
      g.add(body(1.7, 0.07));
      const inlet = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.012, 8, 24), dark);
      inlet.rotation.y = Math.PI / 2;
      inlet.position.x = 0.55;
      g.add(inlet);
      g.add(fin(0.12, 0.22, 0.012, -0.75, 0.1));
      g.add(fin(0.12, 0.22, 0.012, -0.75, -0.1));
      return g;
    },
    aquila() {
      const g = new THREE.Group();
      const fuse = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.7, 8, 16), mat);
      fuse.rotation.z = Math.PI / 2;
      g.add(fuse);
      const wing = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.02, 1.15), dark);
      wing.position.set(-0.05, 0, 0);
      g.add(wing);
      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.02), dark);
      tail.position.set(-0.42, 0.08, 0);
      g.add(tail);
      return g;
    }
  };

  function show(name) {
    clear();
    const make = builds[name] || builds.fulmen;
    group.add(make());
  }

  show("fulmen");

  const state = { dragging: false, lx: 0, ly: 0, ax: 0.35, ay: 0.6 };
  canvas.addEventListener("pointerdown", (e) => {
    state.dragging = true;
    state.lx = e.clientX;
    state.ly = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointerup", () => { state.dragging = false; });
  canvas.addEventListener("pointermove", (e) => {
    if (!state.dragging) return;
    state.ay += (e.clientX - state.lx) * 0.008;
    state.ax += (e.clientY - state.ly) * 0.008;
    state.lx = e.clientX;
    state.ly = e.clientY;
  });

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(h, 1);
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  function tick() {
    if (!state.dragging) state.ay += 0.004;
    group.rotation.y = state.ay;
    group.rotation.x = state.ax * 0.15;
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();

  document.querySelectorAll("[data-model]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-model]").forEach((b) => b.classList.remove("on"));
      btn.classList.add("on");
      show(btn.dataset.model);
      const label = document.getElementById("stage-label");
      if (label) label.textContent = btn.dataset.label || btn.dataset.model;
    });
  });
})();
