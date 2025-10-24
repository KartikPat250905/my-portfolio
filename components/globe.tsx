"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";

const Albedo = "/textures/Albedo.jpg";
const Bump = "/textures/Bump.jpg";
const Clouds = "/textures/Clouds.png";

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
      (error) => {
        console.error("Texture load failed:", error);
        resolve(null);
      }
    );
  });
}

function createLabel(text: string, position: THREE.Vector3, onClick?: () => void) {
  const div = document.createElement("div");
  div.className =
    "text-xs px-2 py-1 bg-black/70 text-white rounded whitespace-nowrap cursor-pointer transition-opacity duration-200";
  div.textContent = text;
  if (onClick) div.onclick = onClick;

  const label = new CSS2DObject(div);
  label.position.copy(position.clone().multiplyScalar(1.05));
  label.element.style.pointerEvents = "auto";
  return label;
}

export default function Globe({ selectedLocation, setSelectedLocation }: any) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const labelRendererRef = useRef<CSS2DRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const initializedRef = useRef(false);
  const resourcesRef = useRef<{
    geometries: THREE.BufferGeometry[];
    materials: THREE.Material[];
    textures: THREE.Texture[];
  }>({ geometries: [], materials: [], textures: [] });

  useEffect(() => {
    const container = containerRef.current;
    if (!container || initializedRef.current) return;
    
    // Prevent initialization if WebGL is blocked
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.error('WebGL not available - please restart your browser');
      return;
    }
    
    initializedRef.current = true;

    async function init() {
      if (!container) return;

      try {
        // Check WebGL support before creating renderer
        const testCanvas = document.createElement('canvas');
        const testContext = testCanvas.getContext('webgl', { 
          failIfMajorPerformanceCaveat: true 
        });
        
        if (!testContext) {
          console.error('WebGL context creation failed');
          const errorDiv = document.createElement('div');
          errorDiv.className = 'flex items-center justify-center h-full text-white';
          errorDiv.innerHTML = `
            <div class="text-center p-4 bg-red-900/50 rounded">
              <p class="font-bold">WebGL Unavailable</p>
              <p class="text-sm mt-2">Please restart your browser</p>
            </div>
          `;
          container.appendChild(errorDiv);
          return;
        }
        
        // Dispose test context
        const loseContext = testContext.getExtension('WEBGL_lose_context');
        if (loseContext) loseContext.loseContext();

        // Create renderer with minimal settings (NEW canvas)
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
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Cap at 1.5x
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Scene and camera
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

        // Load textures with smaller size
        const [albedoMap, bumpMap, cloudsMap] = await Promise.all([
          loadTexture(Albedo),
          loadTexture(Bump),
          loadTexture(Clouds),
        ]);

        if (!albedoMap || !bumpMap || !cloudsMap) {
          console.error("Failed to load textures");
          return;
        }

        // Aggressively optimize textures
        [albedoMap, bumpMap, cloudsMap].forEach((tex) => {
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.generateMipmaps = false;
          tex.anisotropy = 1; // Disable anisotropic filtering
        });
        resourcesRef.current.textures.push(albedoMap, bumpMap, cloudsMap);

        // Simple lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
        sunLight.position.set(5, 2, 5);
        scene.add(sunLight);

        // Earth with medium detail
        const earthGeometry = new THREE.SphereGeometry(1, 32, 32); // Increased from 20
        resourcesRef.current.geometries.push(earthGeometry);
        
        const earthMaterial = new THREE.MeshStandardMaterial({
          map: albedoMap,
          bumpMap: bumpMap,
          bumpScale: 0.02,
          roughness: 0.7,
          metalness: 0.1,
        });
        resourcesRef.current.materials.push(earthMaterial);
        
        const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
        scene.add(earthMesh);

        // Clouds with medium detail
        const cloudGeometry = new THREE.SphereGeometry(1.01, 32, 32); // Increased from 16
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

        // CSS2DRenderer
        const labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize(container.clientWidth, container.clientHeight);
        labelRenderer.domElement.style.position = "absolute";
        labelRenderer.domElement.style.top = "0";
        labelRenderer.domElement.style.pointerEvents = "none";
        container.appendChild(labelRenderer.domElement);
        labelRendererRef.current = labelRenderer;

        // OrbitControls
        const { OrbitControls } = await import(
          "three/examples/jsm/controls/OrbitControls"
        );
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.enableZoom = true;
        controls.enableRotate = true;
        controls.enablePan = false;
        controls.minDistance = 1.5;
        controls.maxDistance = 5;

        // Locations
        const locations = [
          { name: "Anand", lat: 22.5645, lon: 72.9289 },
          { name: "Helsinki", lat: 60.1699, lon: 24.9384 },
          { name: "Toronto", lat: 43.6532, lon: -79.3832 },
        ];

        // Labels
        const labelObjects: CSS2DObject[] = [];
        locations.forEach((loc) => {
          const pos = latLonToVector3(loc.lat, loc.lon, 1);
          const label = createLabel(loc.name, pos, () => setSelectedLocation(loc.name));
          earthMesh.add(label);
          labelObjects.push(label);
        });

        // Lines + arrows with minimal geometry
        const lineArrows: {
          curve: THREE.Curve<THREE.Vector3>;
          arrow: THREE.Mesh;
          duration: number;
          offset: number;
        }[] = [];

        for (let i = 0; i < locations.length - 1; i++) {
          const start = latLonToVector3(locations[i].lat, locations[i].lon, 1.01);
          const end = latLonToVector3(locations[i + 1].lat, locations[i + 1].lon, 1.01);
          const mid = start.clone().add(end).normalize().multiplyScalar(1.4);
          const curve = new THREE.QuadraticBezierCurve3(start, mid, end);

          const points = curve.getPoints(50); // Increased from 30
          const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
          resourcesRef.current.geometries.push(lineGeometry);
          
          const lineMaterial = new THREE.LineBasicMaterial({ color: 0x33ccff });
          resourcesRef.current.materials.push(lineMaterial);
          
          const line = new THREE.Line(lineGeometry, lineMaterial);
          earthMesh.add(line);

          const arrowGeometry = new THREE.ConeGeometry(0.02, 0.06, 8); // Increased from 4
          resourcesRef.current.geometries.push(arrowGeometry);
          
          const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc33 });
          resourcesRef.current.materials.push(arrowMaterial);
          
          const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
          arrow.rotation.x = Math.PI;
          earthMesh.add(arrow);

          lineArrows.push({ curve, arrow, duration: 3, offset: i * 0.5 });
        }

        const clock = new THREE.Clock();

        // Cached vectors
        const worldPos = new THREE.Vector3();
        const normal = new THREE.Vector3();
        const camDir = new THREE.Vector3();
        const tangent = new THREE.Vector3();
        const tangentOnSphere = new THREE.Vector3();

        let lastTime = 0;
        const targetFPS = 30; // Limit to 30 FPS
        const frameInterval = 1000 / targetFPS;

        function animate(currentTime: number) {
          animationFrameRef.current = requestAnimationFrame(animate);
          
          // Throttle to 30 FPS
          if (currentTime - lastTime < frameInterval) return;
          lastTime = currentTime;

          const delta = clock.getDelta();

          // Rotate earth & clouds (slower)
          earthMesh.rotation.y += 0.1 * delta;
          cloudMesh.rotation.y += 0.12 * delta;

          // Move arrows
          const elapsed = clock.getElapsedTime();
          lineArrows.forEach((la) => {
            const t = ((elapsed - la.offset) % la.duration) / la.duration;
            const pos = la.curve.getPoint(t);
            la.arrow.position.copy(pos);

            tangent.copy(la.curve.getTangent(t)).normalize();
            normal.copy(pos).normalize();
            const dotProduct = tangent.dot(normal);
            tangentOnSphere.copy(tangent).sub(normal.multiplyScalar(dotProduct)).normalize();

            const axis = new THREE.Vector3(0, 1, 0);
            const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, tangentOnSphere);
            la.arrow.setRotationFromQuaternion(quaternion);
          });

          controls.update();
          renderer.render(scene, camera);
          labelRenderer.render(scene, camera);

          // Update label visibility
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

        // Handle context loss
        renderer.domElement.addEventListener("webglcontextlost", (event) => {
          event.preventDefault();
          console.warn("WebGL context lost - attempting recovery");
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }
        });

        renderer.domElement.addEventListener("webglcontextrestored", () => {
          animate(0);
        });

        // Handle window resize
        const handleResize = () => {
          if (!container) return;
          const width = container.clientWidth;
          const height = container.clientHeight;
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
          labelRenderer.setSize(width, height);
        };
        window.addEventListener("resize", handleResize);

        return () => {
          window.removeEventListener("resize", handleResize);
          controls.dispose();
        };
      } catch (error) {
        console.error("Globe initialization failed:", error);
      }
    }

    init();
  }, [setSelectedLocation]);

  // Aggressive cleanup on unmount
  useEffect(() => {
    // Capture ref values at start of effect
    const resources = resourcesRef.current;
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    const labelRenderer = labelRendererRef.current;
    const container = containerRef.current;

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      // Dispose all tracked resources
      resources.geometries.forEach((geo) => geo.dispose());
      resources.materials.forEach((mat) => mat.dispose());
      resources.textures.forEach((tex) => tex.dispose());
      
      // Clear arrays
      resources.geometries = [];
      resources.materials = [];
      resources.textures = [];

      if (scene) {
        scene.clear();
        sceneRef.current = null;
      }

      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
        rendererRef.current = null;
      }

      if (labelRenderer) {
        labelRenderer.domElement.remove();
        labelRendererRef.current = null;
      }

      if (container) {
        container.innerHTML = "";
      }

      initializedRef.current = false;
    };
  }, []);

  return <div ref={containerRef} className="relative w-[50%] m-8 h-[500px] ml-35"></div>;
}
