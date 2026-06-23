/**
 * Globe component.
 * Renders an interactive 3D globe using Three.js, with animated location markers and connecting arrows.
 * Handles WebGL context loss, resource cleanup, and performance optimizations for smooth rendering.
 * Accepts selectedLocation and setSelectedLocation props for interactivity.
 */
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

function latLonToVector3(lat: number, lon: number, radius: number) {
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
    new THREE.TextureLoader().load(
      url,
      (texture) => resolve(texture),
      undefined,
      () => resolve(null)
    );
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
  // track whether globe is visible in viewport (for quick fade & pause)
  const isVisibleRef = useRef<boolean>(true);

  const resourcesRef = useRef<TrackedResources>({
    geometries: [],
    materials: [],
    textures: [],
  });

  useEffect(() => {
    mountedRef.current = true;
    const container = containerRef.current;

    if (!container || initializedRef.current) return;
    initializedRef.current = true;

    const locations: LocationPoint[] = [
      { name: "Anand", lat: 22.5645, lon: 72.9289 },
      { name: "Helsinki", lat: 60.1699, lon: 24.9384 },
      { name: "Toronto", lat: 43.6532, lon: -79.3832 },
    ];

    const webglTestCanvas = document.createElement("canvas");
    const webglContext =
      webglTestCanvas.getContext("webgl") ||
      webglTestCanvas.getContext("experimental-webgl");

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
        // Try standard WebGL contexts first; avoid strict performance caveat checks
        const testContext =
          testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");

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

        // Proceed without forcing context loss; continue to renderer creation

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

        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(
          45,
          container.clientWidth / container.clientHeight,
          0.1,
          1000
        );
        camera.position.set(0, 0, 3);
        cameraRef.current = camera;

        const [albedoMap, bumpMap, cloudsMap] = await Promise.all([
          loadTexture(Albedo),
          loadTexture(Bump),
          loadTexture(Clouds),
        ]);

        if (!mountedRef.current) return;

        if (!albedoMap || !bumpMap || !cloudsMap) {
          return;
        }

        [albedoMap, bumpMap, cloudsMap].forEach((texture) => {
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.generateMipmaps = false;
          texture.anisotropy = 1;
        });

        resourcesRef.current.textures.push(albedoMap, bumpMap, cloudsMap);

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
        sunLight.position.set(5, 2, 5);
        scene.add(sunLight);

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
        scene.add(cloudMesh);

        const labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize(container.clientWidth, container.clientHeight);
        labelRenderer.domElement.style.position = "absolute";
        labelRenderer.domElement.style.top = "0";
        labelRenderer.domElement.style.left = "0";
        labelRenderer.domElement.style.pointerEvents = "none";
        container.appendChild(labelRenderer.domElement);
        labelRendererRef.current = labelRenderer;

        const { OrbitControls } = await import(
          "three/examples/jsm/controls/OrbitControls.js"
        );

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

        const labelObjects: CSS2DObject[] = [];

        locations.forEach((loc) => {
          const pos = latLonToVector3(loc.lat, loc.lon, 0.7);
          const label = createLabel(loc.name, pos, () => setSelectedLocation(loc.name));
          earthMesh.add(label);
          labelObjects.push(label);
        });

        const lineArrows: {
          curve: THREE.QuadraticBezierCurve3;
          arrow: THREE.Mesh;
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

          const lineMaterial = new THREE.LineBasicMaterial({ color: 0x33ccff });
          resourcesRef.current.materials.push(lineMaterial);

          const line = new THREE.Line(lineGeometry, lineMaterial);
          earthMesh.add(line);

          const arrowGeometry = new THREE.ConeGeometry(0.02, 0.06, 8);
          resourcesRef.current.geometries.push(arrowGeometry);

          const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc33 });
          resourcesRef.current.materials.push(arrowMaterial);

          const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
          arrow.rotation.x = Math.PI;
          earthMesh.add(arrow);

          lineArrows.push({
            curve,
            arrow,
            duration: 3,
            offset: i * 0.5,
          });
        }

        const clock = new THREE.Clock();
        const worldPos = new THREE.Vector3();
        const normal = new THREE.Vector3();
        const camDir = new THREE.Vector3();
        const tangent = new THREE.Vector3();
        const tangentOnSphere = new THREE.Vector3();
        const axis = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion();

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

          // faster, snappier rotation while visible; pause when not visible
          earthMesh.rotation.y += (isVisibleRef.current ? 0.5 : 0) * delta;
          cloudMesh.rotation.y += (isVisibleRef.current ? 0.6 : 0) * delta;

          lineArrows.forEach((lineArrow) => {
            const t =
              ((elapsed - lineArrow.offset) % lineArrow.duration) / lineArrow.duration;

            const pos = lineArrow.curve.getPoint(t);
            lineArrow.arrow.position.copy(pos);

            tangent.copy(lineArrow.curve.getTangent(t)).normalize();
            normal.copy(pos).normalize();

            const dotProduct = tangent.dot(normal);
            tangentOnSphere
              .copy(tangent)
              .sub(normal.clone().multiplyScalar(dotProduct))
              .normalize();

            quaternion.setFromUnitVectors(axis, tangentOnSphere);
            lineArrow.arrow.setRotationFromQuaternion(quaternion);
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
 
         // quick fade & pause when not in viewport: use IntersectionObserver on container
         (function setupVisibilityObserver() {
           const el = containerRef.current;
           if (!el) return;
 
           const obs = new IntersectionObserver(
             (entries) => {
               entries.forEach((entry) => {
                 const visible = entry.isIntersecting && entry.intersectionRatio > 0.08;
                 isVisibleRef.current = visible;
 
                 // renderer canvas
                 if (rendererRef.current) {
                   const canvasEl = rendererRef.current.domElement;
                   canvasEl.style.transition = "opacity 150ms ease";
                   canvasEl.style.opacity = visible ? "1" : "0";
                 }
 
                 // label renderer
                 if (labelRendererRef.current) {
                   const labelEl = labelRendererRef.current.domElement;
                   labelEl.style.transition = "opacity 150ms ease";
                   labelEl.style.opacity = visible ? "1" : "0";
                 }
               });
             },
             { threshold: [0, 0.08, 0.2] }
           );
 
           obs.observe(el);
 
           // disconnect when component unmounts / cleanup
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

        const handleContextRestored = () => {
          animate(0);
        };

        renderer.domElement.addEventListener("webglcontextlost", handleContextLost);
        renderer.domElement.addEventListener("webglcontextrestored", handleContextRestored);

        removeContextLostListener = () => {
          renderer.domElement.removeEventListener("webglcontextlost", handleContextLost);
        };

        removeContextRestoredListener = () => {
          renderer.domElement.removeEventListener(
            "webglcontextrestored",
            handleContextRestored
          );
        };

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
      className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] m-2 sm:m-4 lg:m-8"
    />
  );
}