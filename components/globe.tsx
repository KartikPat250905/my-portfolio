"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { runApp, loadTexture } from "./core-utils";

// TODO: Make pins look nice and add names near the pins
const Albedo = "/textures/Albedo.jpg";
const Bump = "/textures/Bump.jpg";
const Clouds = "/textures/Clouds.png";
const Ocean = "/textures/Ocean.png";
const NightLights = "/textures/night_lights_modified.png";

function latLonToVector3(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);   // latitude → polar angle
  const theta = (lon + 180) * (Math.PI / 180); // longitude → azimuthal angle

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

function createPin(lat: number, lon: number, radius: number) {
  const pos = latLonToVector3(lat, lon, radius + 0.02); // +0.02 so it floats a bit above surface
  const geometry = new THREE.SphereGeometry(0.02, 16, 16);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const pin = new THREE.Mesh(geometry, material);
  pin.position.copy(pos);
  return pin;
}


export default function Globe() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const params = {
      sunIntensity: 1.8,
      speedFactor: 0.85,
      metalness: 0.1,
      atmOpacity: { value: 0.7 },
      atmPowFactor: { value: 4.1 },
      atmMultiplier: { value: 9.5 },
    };

    const app = {
      async initScene(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
        try {
          // OrbitControls dynamically imported
          const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls");
          const controls = new OrbitControls(camera, renderer.domElement);
          controls.enableDamping = true;

          // Camera position
          camera.position.set(0, 0, 3);

          // Lighting
          const hemiLight = new THREE.HemisphereLight(0xffffff, 0x222222, 1.5);
          scene.add(hemiLight);

          // Load textures
          const [albedoMap, bumpMap, cloudsMap, oceanMap, lightsMap] = await Promise.all([
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

          // Create Earth
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

          // Optional: clouds
          const cloudGeometry = new THREE.SphereGeometry(1.01, 64, 64);
          const cloudMaterial = new THREE.MeshStandardMaterial({
            map: cloudsMap,
            transparent: true,
            opacity: 0.4,
          });
          const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
          scene.add(cloudMesh);
          const pins = [
            createPin(60.1699, 24.9384, 1),   // Helsinki
            createPin(22.5645, 72.9289, 1),   // Anand
            createPin(43.6532, -79.3832, 1),  // Toronto
          ];

          pins.forEach(pin => earthMesh.add(pin));

          // Animation loop
          const clock = new THREE.Clock();
          function animate() {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();

            earthMesh.rotation.y += 0.05 * delta * params.speedFactor;
            cloudMesh.rotation.y += 0.07 * delta * params.speedFactor;

            controls.update();
            renderer.render(scene, camera);
          }
          animate();
        } catch (err) {
          console.error("initScene failed", err);
        }
      },
    };

    runApp(container, app, params);
  }, []);

  return <div ref={containerRef} className="w-[60%] m-8 h-[500px]"></div>;
}
