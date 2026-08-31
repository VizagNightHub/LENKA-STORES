// 3D ORDER SUCCESS OVERLAY CONTROLLER
(function() {
  let scene, camera, renderer, animationFrameId;
  let particles = [];
  let lastFocusedElement = null;

  const HEADLINE_WORDS = [
    { text: 'Congratulations,', highlight: true },
    { text: 'you', highlight: false },
    { text: 'have', highlight: false },
    { text: 'placed', highlight: false },
    { text: 'an', highlight: false },
    { text: 'order', highlight: true }
  ];

  function showOrderSuccess(orderId) {
    lastFocusedElement = document.activeElement;
    
    const overlay = document.getElementById('orderSuccessOverlay');
    const box = document.getElementById('successCardBox');
    const headline = document.getElementById('successHeadline');
    const details = document.getElementById('successDetails');
    const orderIdText = document.getElementById('successOrderIdText');
    const trackBtn = document.getElementById('successTrackBtn');
    const closeBtn = document.getElementById('successCloseBtn');

    if (!overlay || !box) {
      alert("Order #" + orderId + " Confirmed!");
      return;
    }

    if (orderIdText) orderIdText.innerText = '#' + orderId;

    overlay.classList.remove('pointer-events-none', 'opacity-0');
    overlay.classList.add('opacity-100', 'overlay-backdrop-active');

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    requestAnimationFrame(() => {
      box.classList.remove('scale-[0.85]', 'opacity-0');
      box.classList.add('scale-100', 'opacity-100', 'box-overshoot-arrival');
    });

    headline.innerHTML = '';
    if (prefersReducedMotion) {
      headline.innerHTML = HEADLINE_WORDS.map(w => 
        `<span class="${w.highlight ? 'text-bronze-400 font-medium' : 'text-[#F2EFE9]'}">${w.text} </span>`
      ).join('');
      if (details) {
        details.classList.remove('opacity-0');
        details.classList.add('opacity-100');
      }
    } else {
      HEADLINE_WORDS.forEach((item, index) => {
        const span = document.createElement('span');
        span.innerText = item.text + ' ';
        span.className = `inline-block opacity-0 translate-y-3 transition-all duration-300 ease-out ${
          item.highlight ? 'text-bronze-400 font-medium' : 'text-[#F2EFE9]'
        }`;
        headline.appendChild(span);

        setTimeout(() => {
          span.classList.remove('opacity-0', 'translate-y-3');
          span.classList.add('opacity-100', 'translate-y-0');
        }, 400 + (index * 90));
      });

      setTimeout(() => {
        if (details) {
          details.classList.remove('opacity-0');
          details.classList.add('opacity-100');
        }
        if (trackBtn) trackBtn.focus();
      }, 400 + (HEADLINE_WORDS.length * 90) + 150);

      init3DParticles();
    }

    const cleanupAndClose = (openTracker) => {
      destroySuccessOverlay();
      if (openTracker && typeof window.openOrdersPageModal === 'function') {
        window.openOrdersPageModal();
      }
      if (lastFocusedElement) lastFocusedElement.focus();
    };

    if (trackBtn) trackBtn.onclick = () => cleanupAndClose(true);
    if (closeBtn) closeBtn.onclick = () => cleanupAndClose(false);

    overlay.onclick = (e) => {
      if (e.target === overlay) cleanupAndClose(false);
    };

    const keyHandler = (e) => {
      if (e.key === 'Escape') {
        cleanupAndClose(false);
        window.removeEventListener('keydown', keyHandler);
      }
    };
    window.addEventListener('keydown', keyHandler);
  }

  function init3DParticles() {
    const canvas = document.getElementById('orderSuccessCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.z = 8;

    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xE8C997, 2.5);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const geomCylinder = new THREE.CylinderGeometry(0.12, 0.12, 0.025, 8);
    const geomIcosa = new THREE.IcosahedronGeometry(0.1, 0);

    const colors = [0xC5A880, 0xE8C997, 0x8C7355, 0xF5F5F7];
    const materials = colors.map(c => new THREE.MeshPhysicalMaterial({
      color: c,
      metalness: 0.85,
      roughness: 0.25,
      transparent: true,
      opacity: 1
    }));

    const particleCount = width < 640 ? 70 : 120;
    particles = [];

    for (let i = 0; i < particleCount; i++) {
      const geo = Math.random() > 0.4 ? geomCylinder : geomIcosa;
      const mat = materials[Math.floor(Math.random() * materials.length)].clone();
      const mesh = new THREE.Mesh(geo, mat);

      mesh.position.set((Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.5);

      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 7;

      particles.push({
        mesh: mesh,
        mat: mat,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed + 2.5,
        vz: (Math.random() - 0.5) * 4,
        rotX: (Math.random() - 0.5) * 0.2,
        rotY: (Math.random() - 0.5) * 0.2,
        rotZ: (Math.random() - 0.5) * 0.2,
        gravity: -9.8,
        drag: 0.985
      });

      scene.add(mesh);
    }

    let startTime = performance.now();

    function animate(now) {
      const dt = 0.016;
      const elapsed = (now - startTime) / 1000;

      particles.forEach(p => {
        p.vx *= p.drag;
        p.vy = (p.vy + p.gravity * dt) * p.drag;
        p.vz *= p.drag;

        p.mesh.position.x += p.vx * dt;
        p.mesh.position.y += p.vy * dt;
        p.mesh.position.z += p.vz * dt;

        p.mesh.rotation.x += p.rotX;
        p.mesh.rotation.y += p.rotY;
        p.mesh.rotation.z += p.rotZ;

        if (elapsed > 1.8) {
          p.mat.opacity = Math.max(0, 1 - (elapsed - 1.8) / 0.8);
        }
      });

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }

      if (elapsed < 2.8) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        cleanupThreeJS();
      }
    }

    animationFrameId = requestAnimationFrame(animate);
  }

  function cleanupThreeJS() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    if (renderer) {
      renderer.dispose();
      renderer = null;
    }
    if (scene) {
      particles.forEach(p => {
        p.mesh.geometry.dispose();
        p.mat.dispose();
        scene.remove(p.mesh);
      });
      scene = null;
    }
    particles = [];
  }

  function destroySuccessOverlay() {
    cleanupThreeJS();
    const overlay = document.getElementById('orderSuccessOverlay');
    const box = document.getElementById('successCardBox');
    if (box) {
      box.classList.add('scale-[0.85]', 'opacity-0');
      box.classList.remove('scale-100', 'opacity-100');
    }
    if (overlay) {
      overlay.classList.add('opacity-0', 'pointer-events-none');
      overlay.classList.remove('opacity-100', 'overlay-backdrop-active');
    }
  }

  window.showOrderSuccess = showOrderSuccess;
  window.destroySuccessOverlay = destroySuccessOverlay;
})();
