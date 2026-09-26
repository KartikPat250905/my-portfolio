"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { getAssetPath } from "../utils/paths";

const Albedo = getAssetPath("/assets/globe/Albedo.jpg");
const Bump = getAssetPath("/assets/globe/Bump.jpg");
const Clouds = getAssetPath("/assets/globe/Clouds.png");

type GlobeProps = {
  selectedLocation?: string | null;
  setSelectedLocation: (location: string) => void;
};

type TrackedResources = {
  geometries: THREE.BufferGeometry[];
  materials: THREE.Material[];
  textures: THREE.Texture[];
};

type LocationPoint = {
  name: string;
  lat: number;
  lon: number;
};

/**
 * Theme-consistent flight colors, based on the site's magenta/purple palette
 * (primary accent #f92ceb, secondary accent #983f6c). The brighter variants
 * keep the animated paths visible against both light and dark globe regions.
 */
const FLIGHT_COLORS = ["#f92ceb", "#ff4fd8", "#c026d3"];

// Wraps a time value into a clean [0, 1) fraction of `duration`. A plain
// `%` isn't enough on its own: JS's remainder keeps the sign of the input,
// so a negative value stays negative, and adding `duration` without a
// second modulo (as a previous version of this file did) can leave the
// result at 1 or above. Curve.getPoint() doesn't clamp its input, so any
// fraction outside [0, 1) extrapolates past the curve's endpoint — that's
// what caused the trail sparks to shoot out past Toronto instead of
// looping back to the start of the path.
function loopFraction(value: number, duration: number): number {
  const remainder = value % duration;
  return (remainder < 0 ? remainder + duration : remainder) / duration;
}

function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

async function loadTexture(url: string): Promise<THREE.Texture | null> {
  return new Promise((resolve) => {
    new THREE.TextureLoader().load(url, (texture) => resolve(texture), undefined, () => resolve(null));
  });
}

function createLabel(text: string, position: THREE.Vector3, onClick?: () => void) {
  const div = document.createElement("div");
  div.className =
    "text-xs px-2 py-1 bg-black/70 text-white rounded whitespace-nowrap cursor-pointer transition-opacity duration-200";
  div.textContent = text;

  if (onClick) {
    div.onclick = onClick;
  }

  const label = new CSS2DObject(div);
  label.position.copy(position.clone().multiplyScalar(1.05));
  label.element.style.pointerEvents = "auto";

  return label;
}

/**
 * Soft radial-gradient sprite texture used for the moving flight pulse and
 * its fading trail. The gradient is white because Three.js multiplies the
 * texture by each sprite's own color.
 */
function createGlowTexture(): THREE.Texture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.35, "rgba(255,255,255,0.7)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export default function Globe({ selectedLocation, setSelectedLocation }: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const labelRendererRef = useRef<CSS2DRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<{ dispose: () => void } | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const initializedRef = useRef(false);
  const mountedRef = useRef(false);
  const cleanupInitRef = useRef<(() => void) | null>(null);

  // Whether the globe is visible in the viewport (pauses rotation when not).
  const isVisibleRef = useRef<boolean>(true);

  const resourcesRef = useRef<TrackedResources>({
    geometries: [],
    materials: [],
    textures: [],
  });

  // Trigger the scroll-reveal fade-in once when the globe's wrapper scrolls
  // into view. Runs independently of the WebGL init below so the wrapper
  // still reveals even while textures are loading.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      el.classList.add("in-view");
      return;
    }

    const reveal = (target: Element) => {
      // Double rAF guarantees the browser has painted the opacity:0 /
      // translateY(12px) starting state at least once before flipping to
      // in-view, so a globe that's already in view on mount (e.g. a direct
      // #history anchor jump) still gets a real fade instead of snapping in.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          target.classList.add("in-view");
        });
      });
    };

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target);
            revealObserver.unobserve(entry.target); // one-time reveal only
          }
        });
      },
      { threshold: 0.15 }
    );

    revealObserver.observe(el);
    return () => revealObserver.disconnect();
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const container = containerRef.current;

    if (!container || initializedRef.current) return;
    initializedRef.current = true;

    // Location order controls the travel sequence. Anand is first because
    // it's the starting point of the animation.
    const locations: LocationPoint[] = [
      { name: "Anand", lat: 22.5645, lon: 72.9289 },
      { name: "Helsinki", lat: 60.1699, lon: 24.9384 },
      { name: "Toronto", lat: 43.6532, lon: -79.3832 },
    ];

    const webglTestCanvas = document.createElement("canvas");
    const webglContext = webglTestCanvas.getContext("webgl") || webglTestCanvas.getContext("experimental-webgl");

    if (!webglContext) {
      initializedRef.current = false;
      return;
    }

    async function init() {
      if (!container || !mountedRef.current) return;

      let removeResizeListener: (() => void) | null = null;
      let removeContextLostListener: (() => void) | null = null;
      let removeContextRestoredListener: (() => void) | null = null;

      try {
        const testCanvas = document.createElement("canvas");
        const testContext = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");

        if (!testContext) {
          const errorDiv = document.createElement("div");
          errorDiv.className = "flex items-center justify-center h-full text-white";
          errorDiv.innerHTML = `
            <div class="text-center p-4 bg-red-900/50 rounded">
              <p class="font-bold">WebGL Unavailable</p>
              <p class="text-sm mt-2">Please restart your browser or enable WebGL in your browser settings</p>
            </div>
          `;
          container.appendChild(errorDiv);
          return;
        }

        // Renderer
        const renderer = new THREE.WebGLRenderer({
          antialias: false,
          alpha: true,
          powerPreference: "low-power",
          precision: "lowp",
          stencil: false,
          depth: true,
          preserveDrawingBuffer: false,
        });

        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Scene & camera
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.set(0, 0, 3);
        cameraRef.current = camera;

        // Textures
        const [albedoMap, bumpMap, cloudsMap] = await Promise.all([
          loadTexture(Albedo),
          loadTexture(Bump),
          loadTexture(Clouds),
        ]);

        if (!mountedRef.current) return;
        if (!albedoMap || !bumpMap || !cloudsMap) return;

        [albedoMap, bumpMap, cloudsMap].forEach((texture) => {
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.generateMipmaps = false;
          texture.anisotropy = 1;
        });

        resourcesRef.current.textures.push(albedoMap, bumpMap, cloudsMap);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
        sunLight.position.set(5, 2, 5);
        scene.add(sunLight);

        // Earth
        const earthGeometry = new THREE.SphereGeometry(0.7, 32, 32);
        resourcesRef.current.geometries.push(earthGeometry);

        const earthMaterial = new THREE.MeshStandardMaterial({
          map: albedoMap,
          bumpMap,
          bumpScale: 0.02,
          roughness: 0.7,
          metalness: 0.1,
        });
        resourcesRef.current.materials.push(earthMaterial);

        const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
        scene.add(earthMesh);

        // Face Anand toward the camera on the initial render instead of
        // relying on the default longitude. latLonToVector3() puts Anand's
        // front-facing rotation at roughly 162.93°; this only sets the
        // starting orientation — the animation below takes over from there.
        const anand = locations[0];
        const anandPosition = latLonToVector3(anand.lat, anand.lon, 0.7);
        const initialRotation = Math.atan2(anandPosition.x, anandPosition.z);
        earthMesh.rotation.y = initialRotation;

        // Clouds
        const cloudGeometry = new THREE.SphereGeometry(0.71, 32, 32);
        resourcesRef.current.geometries.push(cloudGeometry);

        const cloudMaterial = new THREE.MeshStandardMaterial({
          map: cloudsMap,
          transparent: true,
          opacity: 0.3,
          depthWrite: false,
        });
        resourcesRef.current.materials.push(cloudMaterial);

        const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
        cloudMesh.rotation.y = initialRotation; // match Earth's initial facing
        scene.add(cloudMesh);

        // CSS2D labels
        const labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize(container.clientWidth, container.clientHeight);
        labelRenderer.domElement.style.position = "absolute";
        labelRenderer.domElement.style.top = "0";
        labelRenderer.domElement.style.left = "0";
        labelRenderer.domElement.style.pointerEvents = "none";
        container.appendChild(labelRenderer.domElement);
        labelRendererRef.current = labelRenderer;

        const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
        if (!mountedRef.current) return;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.enableZoom = true;
        controls.enableRotate = true;
        controls.enablePan = false;
        controls.minDistance = 1.2;
        controls.maxDistance = 4;
        controlsRef.current = controls;

        // Location labels
        const labelObjects: CSS2DObject[] = [];

        locations.forEach((loc) => {
          const pos = latLonToVector3(loc.lat, loc.lon, 0.7);
          const label = createLabel(loc.name, pos, () => setSelectedLocation(loc.name));
          earthMesh.add(label);
          labelObjects.push(label);
        });

        // Shared glow texture for every pulse + trail sprite on every path.
        const glowTexture = createGlowTexture();
        resourcesRef.current.textures.push(glowTexture);

        const TRAIL_LENGTH = 5;
        const TRAIL_SPACING = 0.035; // fraction of a path's duration between trail dots

        const lineArrows: {
          curve: THREE.QuadraticBezierCurve3;
          pulse: THREE.Sprite;
          trail: THREE.Sprite[];
          duration: number;
          offset: number;
        }[] = [];

        for (let i = 0; i < locations.length - 1; i++) {
          const start = latLonToVector3(locations[i].lat, locations[i].lon, 0.71);
          const end = latLonToVector3(locations[i + 1].lat, locations[i + 1].lon, 0.71);
          const mid = start.clone().add(end).normalize().multiplyScalar(0.98);
          const curve = new THREE.QuadraticBezierCurve3(start, mid, end);

          const points = curve.getPoints(50);
          const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
          resourcesRef.current.geometries.push(lineGeometry);

          const pathColor = new THREE.Color(FLIGHT_COLORS[i % FLIGHT_COLORS.length]);

          const lineMaterial = new THREE.LineBasicMaterial({
            color: pathColor,
            transparent: true,
            opacity: 0.8,
          });
          resourcesRef.current.materials.push(lineMaterial);

          const line = new THREE.Line(lineGeometry, lineMaterial);
          earthMesh.add(line);

          // Head of the flight path: a bright glowing pulse. Sprites always
          // face the camera and need no per-frame rotation math.
          const pulseMaterial = new THREE.SpriteMaterial({
            map: glowTexture,
            color: pathColor,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          });
          resourcesRef.current.materials.push(pulseMaterial);

          const pulse = new THREE.Sprite(pulseMaterial);
          pulse.scale.set(0.065, 0.065, 1);
          earthMesh.add(pulse);

          // A short fading trail behind the pulse implies direction of travel.
          const trail: THREE.Sprite[] = [];

          for (let t = 1; t <= TRAIL_LENGTH; t++) {
            const trailMaterial = new THREE.SpriteMaterial({
              map: glowTexture,
              color: pathColor,
              transparent: true,
              depthWrite: false,
              blending: THREE.AdditiveBlending,
              opacity: 0.7 * (1 - t / (TRAIL_LENGTH + 1)),
            });
            resourcesRef.current.materials.push(trailMaterial);

            const trailSprite = new THREE.Sprite(trailMaterial);
            const trailScale = 0.06 * (1 - (0.5 * t) / TRAIL_LENGTH);
            trailSprite.scale.set(trailScale, trailScale, 1);
            earthMesh.add(trailSprite);
            trail.push(trailSprite);
          }

          lineArrows.push({ curve, pulse, trail, duration: 3, offset: i * 0.5 });
        }

        // Animation loop
        const clock = new THREE.Clock();
        const worldPos = new THREE.Vector3();
        const normal = new THREE.Vector3();
        const camDir = new THREE.Vector3();

        let lastTime = 0;
        const targetFPS = 30;
        const frameInterval = 1000 / targetFPS;

        function animate(currentTime: number) {
          if (!mountedRef.current) return;

          animationFrameRef.current = requestAnimationFrame(animate);
          if (currentTime - lastTime < frameInterval) return;
          lastTime = currentTime;

          const delta = clock.getDelta();
          const elapsed = clock.getElapsedTime();

          // Faster, snappier rotation while visible; pause when not visible.
          earthMesh.rotation.y += (isVisibleRef.current ? 0.5 : 0) * delta;
          cloudMesh.rotation.y += (isVisibleRef.current ? 0.6 : 0) * delta;

          lineArrows.forEach((lineArrow) => {
            const headT = loopFraction(elapsed - lineArrow.offset, lineArrow.duration);
            lineArrow.pulse.position.copy(lineArrow.curve.getPoint(headT));

            // Gentle pulse/breathe so the head reads as "live" rather than static.
            const breathe = 1 + 0.15 * Math.sin(elapsed * 4 + lineArrow.offset * 10);
            lineArrow.pulse.scale.set(0.065 * breathe, 0.065 * breathe, 1);

            lineArrow.trail.forEach((trailSprite, idx) => {
              const trailT = loopFraction(
                elapsed - lineArrow.offset - (idx + 1) * TRAIL_SPACING,
                lineArrow.duration
              );

              trailSprite.position.copy(lineArrow.curve.getPoint(trailT));
            });
          });

          controls.update();
          renderer.render(scene, camera);
          labelRenderer.render(scene, camera);

          camDir.copy(camera.position).normalize();

          labelObjects.forEach((label) => {
            label.getWorldPosition(worldPos);
            normal.copy(worldPos).normalize();

            const dot = normal.dot(camDir);
            const element = label.element as HTMLElement;

            if (dot > 0.1) {
              element.style.opacity = "1";
              element.style.pointerEvents = "auto";
            } else {
              element.style.opacity = "0";
              element.style.pointerEvents = "none";
            }
          });
        }

        animate(0);

        // Quick fade & pause when not in viewport.
        (function setupVisibilityObserver() {
          const el = containerRef.current;
          if (!el) return;

          const obs = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                isVisibleRef.current = entry.isIntersecting && entry.intersectionRatio > 0.08;
              });
            },
            { threshold: [0, 0.08, 0.2] }
          );

          obs.observe(el);

          const oldCleanup = cleanupInitRef.current;
          cleanupInitRef.current = () => {
            obs.disconnect();
            oldCleanup?.();
          };
        })();

        const handleContextLost = (event: Event) => {
          event.preventDefault();
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
        };

        const handleContextRestored = () => animate(0);

        renderer.domElement.addEventListener("webglcontextlost", handleContextLost);
        renderer.domElement.addEventListener("webglcontextrestored", handleContextRestored);

        removeContextLostListener = () =>
          renderer.domElement.removeEventListener("webglcontextlost", handleContextLost);
        removeContextRestoredListener = () =>
          renderer.domElement.removeEventListener("webglcontextrestored", handleContextRestored);

        const handleResize = () => {
          if (!containerRef.current || !cameraRef.current || !rendererRef.current || !labelRendererRef.current) {
            return;
          }

          const width = containerRef.current.clientWidth;
          const height = containerRef.current.clientHeight;

          cameraRef.current.aspect = width / height;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(width, height);
          labelRendererRef.current.setSize(width, height);
        };

        window.addEventListener("resize", handleResize);
        removeResizeListener = () => window.removeEventListener("resize", handleResize);

        cleanupInitRef.current = () => {
          removeResizeListener?.();
          removeContextLostListener?.();
          removeContextRestoredListener?.();
          controls.dispose();
        };
      } catch {
        cleanupInitRef.current = null;
      }
    }

    init();

    return () => {
      mountedRef.current = false;
      cleanupInitRef.current?.();
      cleanupInitRef.current = null;
    };
  }, [setSelectedLocation]);

  useEffect(() => {
    const resources = resourcesRef.current;

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      controlsRef.current?.dispose();
      controlsRef.current = null;

      resources.geometries.forEach((geometry) => geometry.dispose());
      resources.materials.forEach((material) => material.dispose());
      resources.textures.forEach((texture) => texture.dispose());

      resources.geometries = [];
      resources.materials = [];
      resources.textures = [];

      if (sceneRef.current) {
        sceneRef.current.clear();
        sceneRef.current = null;
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.forceContextLoss();
        rendererRef.current.domElement.remove();
        rendererRef.current = null;
      }

      if (labelRendererRef.current) {
        labelRendererRef.current.domElement.remove();
        labelRendererRef.current = null;
      }

      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }

      cameraRef.current = null;
      initializedRef.current = false;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] m-2 sm:m-4 lg:m-8 animate-wrapper globe-fade"
    />
  );
}