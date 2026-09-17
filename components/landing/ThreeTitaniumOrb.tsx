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

    // 2. Lighting (Pastel Pink & Rose Glow)
    const ambientLight = new THREE.AmbientLight(0xfdf2f8, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xf472b6, 2.6); // Pink-400 key
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xe879a0, 2.2); // Rose rim
    rimLight.position.set(-3, -2, -2);
    scene.add(rimLight);

    const specularFill = new THREE.PointLight(0xd946ef, 2.0, 10); // Fuchsia fill
    specularFill.position.set(0, -2, 2.5);
    scene.add(specularFill);

    // 3. Root Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // --- A. Central Pastel Pink Sphere ---
    const sphereGeo = new THREE.SphereGeometry(1.05, 64, 64);
    const sphereMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xf472b6),   // Pink-400
      emissive: new THREE.Color(0x9d174d), // Pink-800 emissive
      emissiveIntensity: 0.40,
      metalness: 0.85,
      roughness: 0.16,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      reflectivity: 1.0,
      wireframe: false,
    });
    const coreSphere = new THREE.Mesh(sphereGeo, sphereMat);
    rootGroup.add(coreSphere);

    // --- B. Inner Fuchsia Wireframe Hologram ---
    const innerWireGeo = new THREE.IcosahedronGeometry(1.07, 2);
    const innerWireMat = new THREE.MeshBasicMaterial({
      color: 0xfbcfe8,   // Pink-200
      wireframe: true,
      transparent: true,
      opacity: 0.30,
    });
    const innerWire = new THREE.Mesh(innerWireGeo, innerWireMat);
    rootGroup.add(innerWire);

    // --- C. Rose Orbital Rings (VisionOS Gyro) ---
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0xec4899,   // Pink-500
      metalness: 0.98,
      roughness: 0.08,
    });
    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0xd946ef,   // Fuchsia-500
      metalness: 0.95,
      roughness: 0.15,
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

    // --- D. Floating Solar Gold Dust Particles ---
    const particleCount = 85;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 1.35 + Math.random() * 0.95;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = radius * Math.cos(phi);
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xfbcfe8,  // Pink-200 dust
      size: 0.028,
      transparent: true,
      opacity: 0.75,
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

    // 6. Dynamic Theme Palette Adaptation
    const applyOrbTheme = (themeName: string) => {
      if (themeName === "maroon") {
        sphereMat.color.setHex(0x881337);      // Rich deep velvet rose-wine
        sphereMat.emissive.setHex(0x4c0519);   // Deep wine glow
        innerWireMat.color.setHex(0xffffff);   // Pure white holographic wireframe
        innerWireMat.opacity = 0.45;
        ringMat1.color.setHex(0xe11d48);       // Ruby crimson ring
        ringMat2.color.setHex(0xffffff);       // Crisp white ring
        particleMat.color.setHex(0xffd1dc);    // Rose-white stardust
        keyLight.color.setHex(0xffb1c1);
        rimLight.color.setHex(0xe11d48);
        specularFill.color.setHex(0xffffff);
      } else if (themeName === "green") {
        sphereMat.color.setHex(0x22c55e);      // Duolingo fresh emerald green
        sphereMat.emissive.setHex(0x064e3b);   // Deep forest green glow
        innerWireMat.color.setHex(0xbbf7d0);   // Mint lime wireframe
        innerWireMat.opacity = 0.35;
        ringMat1.color.setHex(0x16a34a);       // Leaf green ring
        ringMat2.color.setHex(0x4ade80);       // Spring lime ring
        particleMat.color.setHex(0xdcfce7);    // Mint stardust
        keyLight.color.setHex(0x86efac);
        rimLight.color.setHex(0x16a34a);
        specularFill.color.setHex(0xffffff);
      } else if (themeName === "dark") {
        sphereMat.color.setHex(0x1e293b);      // Titanium obsidian
        sphereMat.emissive.setHex(0x0f172a);
        innerWireMat.color.setHex(0x38bdf8);   // Icy blue
        innerWireMat.opacity = 0.35;
        ringMat1.color.setHex(0x38bdf8);
        ringMat2.color.setHex(0x818cf8);
        particleMat.color.setHex(0xe2e8f0);
        keyLight.color.setHex(0x94a3b8);
        rimLight.color.setHex(0x38bdf8);
        specularFill.color.setHex(0x818cf8);
      } else {
        // Pastel Pink (Default)
        sphereMat.color.setHex(0xf472b6);
        sphereMat.emissive.setHex(0x9d174d);
        innerWireMat.color.setHex(0xfbcfe8);
        innerWireMat.opacity = 0.30;
        ringMat1.color.setHex(0xec4899);
        ringMat2.color.setHex(0xd946ef);
        particleMat.color.setHex(0xfbcfe8);
        keyLight.color.setHex(0xf472b6);
        rimLight.color.setHex(0xe879a0);
        specularFill.color.setHex(0xd946ef);
      }
    };

    // Initial check
    const currentSavedTheme =
      document.documentElement.getAttribute("data-theme") ||
      (document.documentElement.classList.contains("dark") ? "dark" : "pink");
    applyOrbTheme(currentSavedTheme);

    const handleThemeEvent = (e: Event) => {
      const customDetail = (e as CustomEvent).detail;
      applyOrbTheme(customDetail);
    };
    window.addEventListener("semestr-theme-change", handleThemeEvent);

    animate();

    // 7. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("semestr-theme-change", handleThemeEvent);
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
    </div>
  );
}
