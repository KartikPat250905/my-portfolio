"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { runApp, loadTexture } from "./core-utils";
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";

//TODO : add loading message

// Texture paths
const Albedo = "/textures/Albedo.jpg";
const Bump = "/textures/Bump.jpg";
const Clouds = "/textures/Clouds.png";
const Ocean = "/textures/Ocean.png"; 
const NightLights = "/textures/night_lights_modified.png";

// Convert lat/lon to 3D coords
function latLonToVector3(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

// Create text label
function createLabel(text: string, position: THREE.Vector3, onClick?: () => void) {
  const div = document.createElement("div");
  div.className =
    "text-xs px-2 py-1 bg-black/70 text-white rounded whitespace-nowrap cursor-pointer";
  div.textContent = text;

  if (onClick) div.onclick = onClick;

  const label = new CSS2DObject(div);
  label.element.style.pointerEvents = "auto";
  label.position.copy(position.clone().multiplyScalar(1.05)); // offset slightly
  return label;
}

export default function Globe({selectedLocation, setSelectedLocation}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const params = {
      sunIntensity: 1.8,
      speedFactor: 0.85,
      metalness: 0.1,
    };

    const app = {
      async initScene(
        scene: THREE.Scene,
        camera: THREE.Camera,
        renderer: THREE.WebGLRenderer
      ) {
        try {

          // Camera
          camera.position.set(0, 0, 3);

          // Lighting
          const hemiLight = new THREE.HemisphereLight(0xffffff, 0x222222, 1.5);
          scene.add(hemiLight);

          // Load textures
          const [albedoMap, bumpMap, cloudsMap, oceanMap, lightsMap] =
            await Promise.all([
              loadTexture(Albedo).catch(() => null),
              loadTexture(Bump).catch(() => null),
              loadTexture(Clouds).catch(() => null),
              loadTexture(Ocean).catch(() => null),
              loadTexture(NightLights).catch(() => null),
            ]);

          if (!albedoMap || !bumpMap || !cloudsMap || !oceanMap || !lightsMap) {
            console.error("One or more textures failed to load.");
            return;
          }

          // Earth
          const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
          const earthMaterial = new THREE.MeshStandardMaterial({
            map: albedoMap,
            bumpMap: bumpMap,
            bumpScale: 0.05,
            metalness: params.metalness,
          });
          const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
          scene.add(earthMesh);

          renderer.setClearColor(0x000000, 0);

          // Clouds
          const cloudGeometry = new THREE.SphereGeometry(1.01, 64, 64);
          const cloudMaterial = new THREE.MeshStandardMaterial({
            map: cloudsMap,
            transparent: true,
            opacity: 0.4,
          });
          const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
          scene.add(cloudMesh);

          // CSS2DRenderer for labels
          const labelRenderer = new CSS2DRenderer();
          labelRenderer.setSize(container.clientWidth, container.clientHeight);
          labelRenderer.domElement.style.position = "absolute";
          labelRenderer.domElement.style.top = "0";
          labelRenderer.domElement.style.pointerEvents = "none"; // let mouse interact with WebGL
          container.appendChild(labelRenderer.domElement);

          // Orbit controls
          const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls");
          const controls = new OrbitControls(camera, renderer.domElement);
          controls.enableDamping = true;
          controls.enableZoom = true;
          controls.enableRotate = true;
          controls.enablePan = false;

          // Locations and clickable labels
          const locations = [
            { name: "Helsinki", lat: 60.1699, lon: 24.9384 },
            { name: "Anand", lat: 22.5645, lon: 72.9289 },
            { name: "Toronto", lat: 43.6532, lon: -79.3832 },
          ];

          const labelObjects: CSS2DObject[] = [];

          locations.forEach((loc) => {
            const pos = latLonToVector3(loc.lat, loc.lon, 1);
            const label = createLabel(loc.name, pos, () => {
              setSelectedLocation(loc.name);
            });
            earthMesh.add(label);
            labelObjects.push(label);
          });

          // Animation loop
          const clock = new THREE.Clock();
          function animate() {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();

            earthMesh.rotation.y += 0.05 * delta * params.speedFactor;
            cloudMesh.rotation.y += 0.07 * delta * params.speedFactor;

            controls.update();
            renderer.render(scene, camera);
            labelRenderer.render(scene, camera);

            // Update label visibility
            labelObjects.forEach((label) => {
              const worldPos = new THREE.Vector3();
              label.getWorldPosition(worldPos);

              const normal = worldPos.clone().normalize(); // from earth center
              const camDir = camera.position.clone().normalize();

              const dot = normal.dot(camDir);
              (label.element as HTMLElement).style.display = dot > 0 ? "block" : "none";
            });
          }
          animate();
        } catch (err) {
          console.error("initScene failed", err);
        }
      },
    };

    runApp(container, app, params);
  }, []);

  return (
    <div ref={containerRef} className="relative w-[60%] m-8 h-[500px]"></div>
  );
}
