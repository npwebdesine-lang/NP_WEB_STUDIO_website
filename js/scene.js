/* ============================================================
   js/scene.js — Three.js WebGL Singleton
   Liquid Chrome Morphing Blob + Particle Field
   ============================================================ */

const SCENE = (() => {
  let renderer, scene, camera, clock;
  let blobMesh, particlesMesh;
  let animFrameId;
  let isInit = false;

  /* Per-page target colors (lerped over time) */
  const PAGE_COLORS = {
    index:  { c1: new THREE.Color('#00f0ff'), c2: new THREE.Color('#7000ff') },
    about:  { c1: new THREE.Color('#7000ff'), c2: new THREE.Color('#ff2d6b') },
    works:  { c1: new THREE.Color('#00f0ff'), c2: new THREE.Color('#c8a96e') },
    prise:  { c1: new THREE.Color('#c8a96e'), c2: new THREE.Color('#7000ff') },
    info:   { c1: new THREE.Color('#ff2d6b'), c2: new THREE.Color('#00f0ff') },
    addons: { c1: new THREE.Color('#7000ff'), c2: new THREE.Color('#00f0ff') },
  };

  /* Tracked state */
  const mouse = new THREE.Vector2(0, 0);
  const targetMouse = new THREE.Vector2(0, 0);
  let morphStrength = 1.0;
  let targetMorphStrength = 1.0;
  let lastScrollY = window.scrollY;
  let scrollVelocity = 0;

  /* Vertex Shader */
  const vertexShader = `
    uniform float uTime;
    uniform float uMorphStrength;
    uniform vec2  uMouse;
    varying vec3  vNormal;
    varying vec3  vViewPos;

    void main() {
      vNormal = normalize(normalMatrix * normal);

      vec3 pos  = position;
      float t   = uTime * 0.55;
      float amp = 0.22 * uMorphStrength;

      // Layered sin-based noise
      float n  = sin(pos.x * 2.1 + t)       * cos(pos.y * 1.9 + t * 0.7)  * sin(pos.z * 2.4 + t * 1.2);
            n += sin(pos.x * 3.8 + t * 1.1) * 0.45;
            n += cos(pos.y * 4.2 + t * 0.8) * 0.28;
            n += sin(pos.z * 3.1 + t * 1.4) * 0.18;

      pos += normalize(pos) * n * amp;

      // Subtle mouse pull
      vec3 toMouse = vec3(uMouse * 0.5, 0.0) - pos;
      float dist   = length(toMouse);
      pos += normalize(toMouse) * (1.0 / (1.0 + dist * dist)) * 0.18;

      vec4 mvPos  = modelViewMatrix * vec4(pos, 1.0);
      vViewPos    = -mvPos.xyz;
      gl_Position = projectionMatrix * mvPos;
    }
  `;

  /* Fragment Shader */
  const fragmentShader = `
    uniform vec3  uColor1;
    uniform vec3  uColor2;
    uniform float uTime;
    varying vec3  vNormal;
    varying vec3  vViewPos;

    void main() {
      vec3 viewDir = normalize(vViewPos);
      vec3 normal  = normalize(vNormal);

      // Fresnel rim
      float fresnel = 1.0 - abs(dot(normal, viewDir));
      fresnel = pow(fresnel, 1.6);

      // Color band driven by normal + time
      float band = sin(vNormal.y * 2.8 + uTime * 0.28) * 0.5 + 0.5;

      vec3 color = mix(uColor1, uColor2, fresnel);
      color      = mix(color, uColor1 * 1.4, band * 0.25);

      // Hot specular highlight on rim
      color += vec3(pow(fresnel, 3.5) * 0.75);

      // Subtle inner glow
      float inner = 1.0 - fresnel;
      color += uColor2 * pow(inner, 4.0) * 0.15;

      float alpha = 0.55 + fresnel * 0.35;

      gl_FragColor = vec4(color, alpha);
    }
  `;

  /* Particle Vertex */
  const particleVert = `
    uniform float uTime;
    uniform float uScatter;
    attribute float aSize;
    attribute vec3  aVelocity;
    varying float   vAlpha;

    void main() {
      vec3 pos = position;

      // Slow orbit
      float angle = uTime * 0.04;
      float ca = cos(angle), sa = sin(angle);
      pos.xz = mat2(ca, -sa, sa, ca) * pos.xz;
      pos.yz = mat2(ca, -sa, sa, ca) * pos.yz * 0.6;

      // Scatter on high velocity
      pos += aVelocity * uScatter;

      vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize  = aSize * (280.0 / -mvPos.z);
      gl_Position   = projectionMatrix * mvPos;
      vAlpha = 0.4 + 0.3 * sin(uTime * 0.5 + pos.x);
    }
  `;

  const particleFrag = `
    varying float vAlpha;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      if (d > 0.5) discard;
      float alpha = (1.0 - d * 2.0) * vAlpha;
      gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
    }
  `;

  function buildBlob() {
    const geo = new THREE.IcosahedronGeometry(1.5, 6);
    const mat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime:         { value: 0 },
        uMorphStrength:{ value: 1.0 },
        uMouse:        { value: new THREE.Vector2(0, 0) },
        uColor1:       { value: new THREE.Color('#00f0ff') },
        uColor2:       { value: new THREE.Color('#7000ff') },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide,
    });
    blobMesh = new THREE.Mesh(geo, mat);
    scene.add(blobMesh);
  }

  function buildParticles() {
    const COUNT = window.matchMedia('(max-width: 768px)').matches ? 800 : 2000;
    const geo   = new THREE.BufferGeometry();
    const positions  = new Float32Array(COUNT * 3);
    const sizes      = new Float32Array(COUNT);
    const velocities = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      const r = 2.2 + Math.random() * 2.8;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      sizes[i] = 0.8 + Math.random() * 1.2;

      // Random radial scatter direction
      velocities[i * 3]     = (Math.random() - 0.5);
      velocities[i * 3 + 1] = (Math.random() - 0.5);
      velocities[i * 3 + 2] = (Math.random() - 0.5);
    }

    geo.setAttribute('position',  new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSize',     new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aVelocity', new THREE.BufferAttribute(velocities, 3));

    const mat = new THREE.ShaderMaterial({
      vertexShader:   particleVert,
      fragmentShader: particleFrag,
      uniforms: {
        uTime:    { value: 0 },
        uScatter: { value: 0 },
      },
      transparent: true,
      depthWrite:  false,
    });

    particlesMesh = new THREE.Points(geo, mat);
    scene.add(particlesMesh);
  }

  function onResize() {
    if (!renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function onMouseMove(e) {
    targetMouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
  }

  function onScroll() {
    const sy = window.scrollY;
    scrollVelocity = Math.abs(sy - lastScrollY);
    lastScrollY = sy;

    // Spike morph strength on fast scroll
    if (scrollVelocity > 12) {
      targetMorphStrength = Math.min(2.8, 1.0 + scrollVelocity * 0.06);
    }
  }

  function tick() {
    animFrameId = requestAnimationFrame(tick);
    const elapsed = clock.getElapsedTime();

    // Lerp mouse
    mouse.x += (targetMouse.x - mouse.x) * 0.06;
    mouse.y += (targetMouse.y - mouse.y) * 0.06;

    // Decay morph strength
    targetMorphStrength += (1.0 - targetMorphStrength) * 0.04;
    morphStrength += (targetMorphStrength - morphStrength) * 0.08;

    // Decay scatter
    const scatter = particlesMesh.material.uniforms.uScatter.value;
    particlesMesh.material.uniforms.uScatter.value += (0 - scatter) * 0.035;
    if (scrollVelocity > 12) {
      particlesMesh.material.uniforms.uScatter.value = Math.min(1.5, scatter + scrollVelocity * 0.04);
    }
    scrollVelocity *= 0.85; // decay velocity

    // Update blob uniforms
    const bu = blobMesh.material.uniforms;
    bu.uTime.value          = elapsed;
    bu.uMorphStrength.value = morphStrength;
    bu.uMouse.value.copy(mouse);

    // Lerp blob colors toward target
    if (SCENE._targetC1) {
      bu.uColor1.value.lerp(SCENE._targetC1, 0.025);
      bu.uColor2.value.lerp(SCENE._targetC2, 0.025);
    }

    // Slow blob rotation
    blobMesh.rotation.y = elapsed * 0.08;
    blobMesh.rotation.x = Math.sin(elapsed * 0.05) * 0.12;

    // Particle time
    particlesMesh.material.uniforms.uTime.value = elapsed;

    renderer.render(scene, camera);
  }

  return {
    _targetC1: null,
    _targetC2: null,

    init() {
      if (isInit) return;
      isInit = true;

      const canvas = document.getElementById('gl-canvas');
      if (!canvas) return;

      // Renderer
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);

      // Scene + Camera
      scene  = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.z = 5;

      clock = new THREE.Clock();

      buildBlob();
      buildParticles();

      // Ambient glow light
      const ambLight = new THREE.AmbientLight(0xffffff, 0.3);
      scene.add(ambLight);

      // Events
      window.addEventListener('resize',    onResize);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('scroll',    onScroll, { passive: true });

      tick();
    },

    setPage(pageName) {
      const colors = PAGE_COLORS[pageName] || PAGE_COLORS.index;
      this._targetC1 = colors.c1;
      this._targetC2 = colors.c2;
    },

    destroy() {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize',    onResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll',    onScroll);
    },
  };
})();
