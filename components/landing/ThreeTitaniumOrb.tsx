"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface ThreeTitaniumOrbProps {
  className?: string;
  badgeLabel?: string;
}

export function ThreeTitaniumOrb({
  className = "",
  badgeLabel = "Spatial Core 3D",
}: ThreeTitaniumOrbProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    let animationFrameId: number;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.2);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // 2. Lighting (Brushed Titanium & Studio Silver)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xd4d4d8, 2.0); // Silver rim
    rimLight.position.set(-3, -2, -2);
    scene.add(rimLight);

    const specularFill = new THREE.PointLight(0xa1a1aa, 1.8, 10);
    specularFill.position.set(0, -2, 2.5);
    scene.add(specularFill);

    // 3. Root Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // --- A. Central Spatial Titanium Sphere ---
    const sphereGeo = new THREE.SphereGeometry(1.05, 64, 64);
    const sphereMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x18181b),
      metalness: 0.94,
      roughness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      reflectivity: 0.95,
      wireframe: false,
    });
    const coreSphere = new THREE.Mesh(sphereGeo, sphereMat);
    rootGroup.add(coreSphere);

    // --- B. Inner Subtle Wireframe Hologram ---
    const innerWireGeo = new THREE.IcosahedronGeometry(1.07, 2);
    const innerWireMat = new THREE.MeshBasicMaterial({
      color: 0xe4e4e7,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const innerWire = new THREE.Mesh(innerWireGeo, innerWireMat);
    rootGroup.add(innerWire);

    // --- C. Titanium Orbital Rings (VisionOS Gyro) ---
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.98,
      roughness: 0.1,
    });
    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0xa1a1aa,
      metalness: 0.95,
      roughness: 0.2,
    });

    const ring1Geo = new THREE.TorusGeometry(1.48, 0.012, 16, 120);
    const ring1 = new THREE.Mesh(ring1Geo, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    rootGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(1.68, 0.009, 16, 120);
    const ring2 = new THREE.Mesh(ring2Geo, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 6;
    rootGroup.add(ring2);

    // --- D. Floating Platinum Dust Particles ---
    const particleCount = 75;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 1.35 + Math.random() * 0.9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = radius * Math.cos(phi);
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.024,
      transparent: true,
      opacity: 0.65,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    rootGroup.add(particles);

    // 4. Mouse / Touch Tracking & Inertia
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let isDragging = false;
    let prevPointerX = 0;
    let prevPointerY = 0;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      if (isDragging) {
        const deltaX = e.clientX - prevPointerX;
        const deltaY = e.clientY - prevPointerY;
        targetRotY += deltaX * 0.008;
        targetRotX += deltaY * 0.008;
        prevPointerX = e.clientX;
        prevPointerY = e.clientY;
      } else {
        mouseX = x * 0.45;
        mouseY = y * 0.45;
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      setIsInteracting(true);
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
    };

    const handlePointerUp = () => {
      isDragging = false;
      setTimeout(() => setIsInteracting(false), 800);
    };

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);

    // Click pulse trigger
    const handleClick = () => {
      let scale = 1.08;
      const pulseInterval = setInterval(() => {
        scale = THREE.MathUtils.lerp(scale, 1.0, 0.12);
        coreSphere.scale.set(scale, scale, scale);
        if (Math.abs(scale - 1.0) < 0.005) {
          coreSphere.scale.set(1, 1, 1);
          clearInterval(pulseInterval);
        }
      }, 16);
    };
    container.addEventListener("click", handleClick);

    // 5. Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 6. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle continuous floating rotation
      innerWire.rotation.y += 0.004;
      innerWire.rotation.x -= 0.002;

      ring1.rotation.z += 0.005;
      ring1.rotation.y += 0.003;

      ring2.rotation.z -= 0.004;
      ring2.rotation.x += 0.003;

      particles.rotation.y += 0.0015;

      // Dynamic oscillation float
      rootGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.06;

      // Mouse parallax & inertia lerp
      if (!isDragging) {
        targetRotY += 0.003;
      }
      rootGroup.rotation.y = THREE.MathUtils.lerp(rootGroup.rotation.y, targetRotY + mouseX, 0.05);
      rootGroup.rotation.x = THREE.MathUtils.lerp(rootGroup.rotation.x, targetRotX - mouseY, 0.05);

      renderer.render(scene, camera);
    };

    animate();

    // 7. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      container.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);

      sphereGeo.dispose();
      sphereMat.dispose();
      innerWireGeo.dispose();
      innerWireMat.dispose();
      ring1Geo.dispose();
      ringMat1.dispose();
      ring2Geo.dispose();
      ringMat2.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative select-none touch-none flex items-center justify-center cursor-grab active:cursor-grabbing ${className}`}
      title="Sentuh atau geser untuk memutar 3D Spatial Core"
    >
      {/* 3D Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Floating Spatial Badge */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 dark:bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-medium text-white shadow-sm transition-opacity duration-300">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isInteracting ? "bg-white animate-ping" : "bg-zinc-300 animate-pulse"
          }`}
        />
        <span className="font-mono tracking-tight">{badgeLabel}</span>
      </div>
    </div>
  );
}
