(function () {
  const root = document.querySelector("[data-viewer]");
  if (!root) return;
  const canvas = root.querySelector("canvas");
  const buttons = [...root.querySelectorAll("[data-model]")];
  let current = root.getAttribute("data-model") || "fulmen";

  function setActive(id) {
    current = id;
    buttons.forEach((btn) => btn.classList.toggle("is-on", btn.getAttribute("data-model") === id));
    const label = root.querySelector("[data-viewer-label]");
    const names = { fulmen: "FLM · Fulmen", pilum: "PLM · Pilum", contus: "CTS · Contus", aquila: "AQL · Aquila" };
    if (label) label.textContent = names[id] || id;
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setActive(btn.getAttribute("data-model"));
      if (window.__vespasianApplyModel) window.__vespasianApplyModel(current);
    });
  });
  setActive(current);

  import("https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js").then((THREE) => {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 80);
    camera.position.set(0.95, 0.38, 2.55);
    scene.add(new THREE.AmbientLight(0x8a93a0, 0.55));
    const key = new THREE.DirectionalLight(0xf0eee8, 1.15);
    key.position.set(2.2, 3.1, 4);
    const rim = new THREE.DirectionalLight(0x88a0b8, 0.7);
    rim.position.set(-3.2, 1.1, -2.4);
    scene.add(key, rim, new THREE.HemisphereLight(0xb8c4d0, 0x111111, 0.35));
    const grid = new THREE.GridHelper(6, 24, 0x2a2a2a, 0x1a1a1a);
    grid.position.y = -0.42;
    scene.add(grid);

    const metal = () => new THREE.MeshStandardMaterial({ color: 0xc9c6bf, metalness: 0.82, roughness: 0.28 });
    const dark = () => new THREE.MeshStandardMaterial({ color: 0x2a2d33, metalness: 0.45, roughness: 0.48 });

    function build(id) {
      const g = new THREE.Group();
      const m = metal();
      const d = dark();
      const fuse = (len, r) => {
        const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 8, 28), m);
        mesh.rotation.z = Math.PI / 2;
        return mesh;
      };
      if (id === "fulmen") {
        g.add(fuse(1.35, 0.055));
        const wing = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.012, 0.46), d);
        wing.position.set(-0.08, 0, 0);
        g.add(wing);
        const canard = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.008, 0.18), d);
        canard.position.set(0.48, 0, 0);
        g.add(canard);
        [0.09, -0.09].forEach((y) => {
          const fin = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.01, 0.16), d);
          fin.position.set(-0.64, y, 0);
          g.add(fin);
        });
        const inlet = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.01, 8, 24), d);
        inlet.rotation.y = Math.PI / 2;
        inlet.position.x = 0.22;
        g.add(inlet);
      } else if (id === "pilum") {
        const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 1.08, 28), m);
        cyl.rotation.z = Math.PI / 2;
        g.add(cyl);
        const nose = new THREE.Mesh(new THREE.ConeGeometry(0.068, 0.22, 24), m);
        nose.rotation.z = -Math.PI / 2;
        nose.position.x = 0.65;
        g.add(nose);
        const canard = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.008, 0.2), d);
        canard.position.set(0.28, 0, 0);
        g.add(canard);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.012, 8, 28), d);
        ring.rotation.y = Math.PI / 2;
        ring.position.x = -0.42;
        g.add(ring);
      } else if (id === "contus") {
        g.add(fuse(1.72, 0.072));
        const inlet = new THREE.Mesh(new THREE.TorusGeometry(0.078, 0.014, 8, 28), d);
        inlet.rotation.y = Math.PI / 2;
        inlet.position.x = 0.52;
        g.add(inlet);
        [0.11, -0.11].forEach((y) => {
          const fin = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.012, 0.24), d);
          fin.position.set(-0.78, y, 0);
          g.add(fin);
        });
        const wing = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.012, 0.36), d);
        wing.position.set(-0.18, 0, 0);
        g.add(wing);
      } else {
        const fuseA = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.72, 8, 20), m);
        fuseA.rotation.z = Math.PI / 2;
        g.add(fuseA);
        const wing = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.016, 1.22), d);
        wing.position.set(-0.04, 0, 0);
        g.add(wing);
        const tail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.018), d);
        tail.position.set(-0.44, 0.08, 0);
        g.add(tail);
      }
      return g;
    }

    let group = build(current);
    scene.add(group);

    const state = { dragging: false, lx: 0, ly: 0, ax: 0.28, ay: 0.7 };
    canvas.addEventListener("pointerdown", (e) => {
      state.dragging = true;
      state.lx = e.clientX;
      state.ly = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener("pointerup", () => { state.dragging = false; });
    canvas.addEventListener("pointerleave", () => { state.dragging = false; });
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
    new ResizeObserver(resize).observe(canvas);
    resize();

    window.__vespasianApplyModel = (id) => {
      scene.remove(group);
      group.traverse((obj) => {
        if (obj.isMesh) {
          obj.geometry.dispose();
          obj.material.dispose();
        }
      });
      group = build(id);
      scene.add(group);
    };

    const tick = () => {
      if (!state.dragging) state.ay += 0.004;
      group.rotation.y = state.ay;
      group.rotation.x = state.ax * 0.14;
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    };
    tick();
  });
})();
