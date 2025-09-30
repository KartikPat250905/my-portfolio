// components/core-utils.js
import * as THREE from "three";

/**
 * Safely loads a texture using THREE.TextureLoader
 * @param {string} url - path to texture
 * @returns {Promise<THREE.Texture>}
 */
export function loadTexture(url) {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(
      url,
      texture => resolve(texture),
      undefined,
      err => reject(err)
    );
  });
}

/**
 * Initializes Three.js scene and starts render loop.
 * @param {HTMLElement} container - DOM element to mount renderer
 * @param {object} app - object with async initScene(scene, camera, renderer)
 * @param {object} params - any params you want to pass
 */
export function runApp(container, app, params) {
  if (!container || !(container instanceof HTMLElement)) {
    console.error("runApp requires a valid DOM element as container");
    return;
  }

  // Create scene, camera, renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 25);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Append renderer to container
  container.appendChild(renderer.domElement);

  // Clock for animation
  const clock = new THREE.Clock();

  // Resize handler
  function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }
  window.addEventListener("resize", onWindowResize);

  // Initialize the scene
  app.initScene(scene, camera, renderer).catch(err => {
    console.error("app.initScene failed:", err);
  });

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    if (app.updateScene) {
      app.updateScene(delta, elapsed);
    }

    renderer.render(scene, camera);
  }

  animate();
}
