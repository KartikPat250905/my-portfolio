"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { runApp, loadTexture } from "./core-utils";
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";

const Albedo = "/textures/Albedo.jpg";
const Bump = "/textures/Bump.jpg";
const Clouds = "/textures/Clouds.png";
const Ocean = "/textures/Ocean.png";
const NightLights = "/textures/night_lights_modified.png";

function latLonToVector3(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

function createLabel(text: string, position: THREE.Vector3, onClick?: () => void) {
  const div = document.createElement("div");
  div.className = "text-xs px-2 py-1 bg-black/70 text-white rounded whitespace-nowrap cursor-pointer";
  div.textContent = text;
  if (onClick) div.onclick = onClick;

  const label = new CSS2DObject(div);
  label.element.style.pointerEvents = "auto";
  label.position.copy(position.clone().multiplyScalar(1.05));
  return label;
}

export default function Globe({ selectedLocation, setSelectedLocation }: any) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const params = { sunIntensity: 1.8, speedFactor: 1.5, metalness: 0.1 };

    const app = {
      async initScene(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
        try {
          camera.position.set(0, 0, 3);

          // Load textures
          const [albedoMap, bumpMap, cloudsMap] = await Promise.all([
            loadTexture(Albedo),
            loadTexture(Bump),
            loadTexture(Clouds),
          ]);

          if (!albedoMap || !bumpMap || !cloudsMap) {
            console.error("Textures failed to load");
            return;
          }

          // Lights
          scene.add(new THREE.HemisphereLight(0xffffff, 0x222233, 2.0));
          const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
          sunLight.position.set(5, 2, 5);
          scene.add(sunLight);
          scene.add(new THREE.AmbientLight(0xffffff, 0.4));

          // Earth mesh
          const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
          const earthMaterial = new THREE.MeshStandardMaterial({
            map: albedoMap,
            bumpMap: bumpMap,
            bumpScale: 0.03,
            roughness: 0.6,
            metalness: 0.2,
          });
          const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
          scene.add(earthMesh);

          // Clouds
          const cloudGeometry = new THREE.SphereGeometry(1.01, 64, 64);
          const cloudMaterial = new THREE.MeshStandardMaterial({
            map: cloudsMap,
            transparent: true,
            opacity: 0.4,
          });
          const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
          scene.add(cloudMesh);

          renderer.setClearColor(0x000000, 0);

          // CSS2DRenderer for labels
          const labelRenderer = new CSS2DRenderer();
          labelRenderer.setSize(container.clientWidth, container.clientHeight);
          labelRenderer.domElement.style.position = "absolute";
          labelRenderer.domElement.style.top = "0";
          labelRenderer.domElement.style.pointerEvents = "none";
          container.appendChild(labelRenderer.domElement);

          // OrbitControls
          const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls");
          const controls = new OrbitControls(camera, renderer.domElement);
          controls.enableDamping = true;
          controls.enableZoom = true;
          controls.enableRotate = true;
          controls.enablePan = false;

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

          // --- Lines + Moving Arrows ---
          interface LineArrow {
            curve: THREE.Curve<THREE.Vector3>;
            arrow: THREE.Mesh;
            duration: number;
            offset: number;
          }

          const lineArrows: LineArrow[] = [];

          for (let i = 0; i < locations.length - 1; i++) {
            const start = latLonToVector3(locations[i].lat, locations[i].lon, 1.01);
            const end = latLonToVector3(locations[i + 1].lat, locations[i + 1].lon, 1.01);
            const mid = start.clone().add(end).normalize().multiplyScalar(1.4);

            const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
            const points = curve.getPoints(100);

            // Draw line
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const lineMaterial = new THREE.LineBasicMaterial({ color: 0x33ccff });
            const line = new THREE.Line(lineGeometry, lineMaterial);
            earthMesh.add(line); // add to earth so it rotates

            // Arrow mesh
            const arrowGeometry = new THREE.ConeGeometry(0.02, 0.06, 8);
            const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc33 });
            const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
            arrow.rotation.x = Math.PI; // point along curve
            earthMesh.add(arrow); // add to earth for rotation

            lineArrows.push({ curve, arrow, duration: 3, offset: i * 0.5 });
          }

          const clock = new THREE.Clock();

          function animate() {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();
            const elapsed = clock.getElapsedTime();

            // Rotate globe & clouds
            earthMesh.rotation.y += 0.15 * delta * params.speedFactor;
            cloudMesh.rotation.y += 0.18 * delta * params.speedFactor;

            // Move arrows along lines
            lineArrows.forEach((la) => {
              const t = ((elapsed - la.offset) % la.duration) / la.duration;
              const pos = la.curve.getPoint(t);
              la.arrow.position.copy(pos);

              // Align arrow tangent to globe surface
              const tangent = la.curve.getTangent(t).normalize();
              const normal = pos.clone().normalize();
              const tangentOnSphere = tangent.clone().sub(normal.multiplyScalar(tangent.dot(normal))).normalize();

              const axis = new THREE.Vector3(0, 1, 0); // cone default +Y
              const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, tangentOnSphere);
              la.arrow.setRotationFromQuaternion(quaternion);
            });

            controls.update();
            renderer.render(scene, camera);
            labelRenderer.render(scene, camera);

            // Update label visibility
            labelObjects.forEach((label) => {
              const worldPos = new THREE.Vector3();
              label.getWorldPosition(worldPos);
              const normal = worldPos.clone().normalize();
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
  }, [setSelectedLocation]);

  return <div ref={containerRef} className="relative w-[50%] m-8 h-[500px] ml-35"></div>;
}
