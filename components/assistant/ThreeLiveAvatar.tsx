"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Sparkles, Mic, Radio, Volume2 } from "lucide-react";

export type ThreeAvatarStatus = "idle" | "listening" | "thinking" | "talking";

interface ThreeLiveAvatarProps {
  status?: ThreeAvatarStatus;
  size?: "sm" | "md" | "lg" | "full";
  className?: string;
  showStatusBadge?: boolean;
}

export function ThreeLiveAvatar({
  status = "idle",
  size = "md",
  className = "",
  showStatusBadge = true,
}: ThreeLiveAvatarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  // Dimension presets
  const sizeStyles = {
    sm: "w-20 h-20",
    md: "w-44 h-44 sm:w-52 sm:h-52",
    lg: "w-64 h-64 sm:w-72 sm:h-72",
    full: "w-full h-full min-h-[320px]",
  }[size];

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    let animationFrameId: number;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();

    const width = container.clientWidth || 220;
    const height = container.clientHeight || 220;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 3.8);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x7dd3fc, 2.0); // Soft Cyan Key
    keyLight.position.set(2, 3, 3);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xc084fc, 2.5); // Purple Rim
    rimLight.position.set(-3, 1, -2);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xf472b6, 1.5, 10); // Pink Fill
    fillLight.position.set(0, -1, 2);
    scene.add(fillLight);

    // 3. Avatar Root Group
    const avatarGroup = new THREE.Group();
    scene.add(avatarGroup);

    // --- A. Head Mesh ---
    const headGeo = new THREE.SphereGeometry(0.78, 32, 32);
    headGeo.scale(1, 1.15, 0.95);
    const skinMat = new THREE.MeshToonMaterial({
      color: 0xffedd5, // warm peach skin
    });
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.position.y = 0.35;
    avatarGroup.add(headMesh);

    // --- B. Anime Cheeks (Blush) ---
    const blushGeo = new THREE.CircleGeometry(0.12, 16);
    const blushMat = new THREE.MeshBasicMaterial({
      color: 0xfb7185,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    const leftBlush = new THREE.Mesh(blushGeo, blushMat);
    leftBlush.position.set(-0.35, 0.22, 0.72);
    headMesh.add(leftBlush);

    const rightBlush = leftBlush.clone();
    rightBlush.position.x = 0.35;
    headMesh.add(rightBlush);

    // --- C. Cyber Anime Hair ---
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      roughness: 0.3,
      metalness: 0.2,
    });

    // Hair Top Dome
    const hairTopGeo = new THREE.SphereGeometry(0.85, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const hairTop = new THREE.Mesh(hairTopGeo, hairMat);
    hairTop.position.set(0, 0.45, 0);
    headMesh.add(hairTop);

    // Hair Front Bangs
    const bangsGeo = new THREE.ConeGeometry(0.2, 0.5, 16);
    const bang1 = new THREE.Mesh(bangsGeo, hairMat);
    bang1.rotation.set(0.2, 0, 0.4);
    bang1.position.set(-0.25, 0.48, 0.7);
    headMesh.add(bang1);

    const bang2 = new THREE.Mesh(bangsGeo, hairMat);
    bang2.rotation.set(0.2, 0, -0.4);
    bang2.position.set(0.25, 0.48, 0.7);
    headMesh.add(bang2);

    const bangCenter = new THREE.Mesh(bangsGeo, hairMat);
    bangCenter.rotation.set(0.3, 0, 0);
    bangCenter.position.set(0, 0.52, 0.75);
    headMesh.add(bangCenter);

    // Back Twintails
    const tailGeo = new THREE.CylinderGeometry(0.08, 0.22, 1.3, 16);
    const leftTail = new THREE.Mesh(tailGeo, hairMat);
    leftTail.position.set(-0.85, 0.1, -0.2);
    leftTail.rotation.set(0.2, 0, 0.3);
    headMesh.add(leftTail);

    const rightTail = new THREE.Mesh(tailGeo, hairMat);
    rightTail.position.set(0.85, 0.1, -0.2);
    rightTail.rotation.set(0.2, 0, -0.3);
    headMesh.add(rightTail);

    // --- D. Cyber Headphones with Glowing LEDs ---
    const hpBandGeo = new THREE.TorusGeometry(0.86, 0.05, 16, 32, Math.PI);
    const hpBandMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
    const hpBand = new THREE.Mesh(hpBandGeo, hpBandMat);
    hpBand.position.set(0, 0.35, 0);
    headMesh.add(hpBand);

    const earcupGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.18, 24);
    const earcupMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
    const ledRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 }); // Cyber Blue Neon

    // Left Earcup
    const leftEar = new THREE.Mesh(earcupGeo, earcupMat);
    leftEar.rotation.z = Math.PI / 2;
    leftEar.position.set(-0.82, 0.25, 0);
    headMesh.add(leftEar);

    const leftLedRing = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.03, 16, 24), ledRingMat);
    leftLedRing.rotation.y = Math.PI / 2;
    leftLedRing.position.set(-0.92, 0.25, 0);
    headMesh.add(leftLedRing);

    // Right Earcup
    const rightEar = leftEar.clone();
    rightEar.position.x = 0.82;
    headMesh.add(rightEar);

    const rightLedRing = leftLedRing.clone();
    rightLedRing.position.x = 0.92;
    headMesh.add(rightLedRing);

    // --- E. 3D Anime Eyes (Tracking & Blinking) ---
    const eyeWhiteGeo = new THREE.SphereGeometry(0.16, 24, 24);
    eyeWhiteGeo.scale(1, 1.25, 0.4);
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const leftEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    leftEyeWhite.position.set(-0.28, 0.36, 0.68);
    headMesh.add(leftEyeWhite);

    const rightEyeWhite = leftEyeWhite.clone();
    rightEyeWhite.position.x = 0.28;
    headMesh.add(rightEyeWhite);

    // Iris & Pupil
    const irisGeo = new THREE.CircleGeometry(0.1, 24);
    const irisMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const leftIris = new THREE.Mesh(irisGeo, irisMat);
    leftIris.position.set(0, 0, 0.09);
    leftEyeWhite.add(leftIris);

    const pupilGeo = new THREE.CircleGeometry(0.045, 16);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(0, 0, 0.01);
    leftIris.add(leftPupil);

    const rightIris = leftIris.clone();
    rightEyeWhite.add(rightIris);

    // Eyelid Blinking Masks
    const eyelidGeo = new THREE.SphereGeometry(0.18, 24, 24);
    eyelidGeo.scale(1, 1.3, 0.45);
    const leftEyelid = new THREE.Mesh(eyelidGeo, skinMat);
    leftEyelid.position.set(-0.28, 0.36, 0.69);
    leftEyelid.scale.y = 0; // open by default
    headMesh.add(leftEyelid);

    const rightEyelid = leftEyelid.clone();
    rightEyelid.position.x = 0.28;
    headMesh.add(rightEyelid);

    // --- F. 3D Morphing Mouth (Lip-Sync Talking) ---
    const mouthGeo = new THREE.TorusGeometry(0.09, 0.025, 16, 24, Math.PI);
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0xe11d48 });
    const mouthMesh = new THREE.Mesh(mouthGeo, mouthMat);
    mouthMesh.rotation.z = Math.PI;
    mouthMesh.position.set(0, 0.06, 0.74);
    headMesh.add(mouthMesh);

    // --- G. 3D Floating Torso & Collar ---
    const torsoGeo = new THREE.CylinderGeometry(0.45, 0.6, 0.8, 24);
    const suitMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b, // Deep indigo
      roughness: 0.5,
    });
    const torsoMesh = new THREE.Mesh(torsoGeo, suitMat);
    torsoMesh.position.set(0, -0.65, 0);
    avatarGroup.add(torsoMesh);

    // Neon Tech Neck Ribbon
    const ribbonGeo = new THREE.TorusGeometry(0.35, 0.04, 16, 32);
    const ribbonMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbon.rotation.x = Math.PI / 2;
    ribbon.position.set(0, -0.22, 0);
    avatarGroup.add(ribbon);

    // --- H. 3D Holographic Orbit Rings & Particle Sparkles ---
    const ringGeo1 = new THREE.TorusGeometry(1.6, 0.02, 16, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.6,
    });
    const orbitRing1 = new THREE.Mesh(ringGeo1, ringMat1);
    orbitRing1.rotation.x = Math.PI / 3;
    avatarGroup.add(orbitRing1);

    const ringGeo2 = new THREE.TorusGeometry(1.9, 0.015, 16, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.5,
    });
    const orbitRing2 = new THREE.Mesh(ringGeo2, ringMat2);
    orbitRing2.rotation.y = Math.PI / 4;
    avatarGroup.add(orbitRing2);

    // Particles
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 4;
      particlePos[i + 1] = (Math.random() - 0.5) * 4;
      particlePos[i + 2] = (Math.random() - 0.5) * 3;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x7dd3fc,
      size: 0.06,
      transparent: true,
      opacity: 0.8,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 4. Interaction & Mouse Tracking
    let targetRotY = 0;
    let targetRotX = 0;
    let currentRotY = 0;
    let currentRotX = 0;

    let isMouseDown = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      if (isMouseDown) {
        const deltaX = clientX - prevMouseX;
        const deltaY = clientY - prevMouseY;
        targetRotY += deltaX * 0.015;
        targetRotX += deltaY * 0.01;
        targetRotX = Math.max(-0.5, Math.min(0.5, targetRotX));
      } else {
        const rect = container.getBoundingClientRect();
        const normX = ((clientX - rect.left) / rect.width - 0.5) * 2;
        const normY = ((clientY - rect.top) / rect.height - 0.5) * 2;
        targetRotY = normX * 0.45;
        targetRotX = -normY * 0.35;

        // Pupil eye tracking
        leftIris.position.x = normX * 0.035;
        leftIris.position.y = -normY * 0.035;
        rightIris.position.x = normX * 0.035;
        rightIris.position.y = -normY * 0.035;
      }

      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isMouseDown = true;
      setIsInteracting(true);
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const handlePointerUp = () => {
      isMouseDown = false;
      setIsInteracting(false);
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("mouseup", handlePointerUp);
    container.addEventListener("mousedown", handlePointerDown);
    container.addEventListener("touchstart", handlePointerDown, { passive: true });
    window.addEventListener("touchmove", handlePointerMove, { passive: true });
    window.addEventListener("touchend", handlePointerUp);

    // 5. Animation Loop
    let clock = new THREE.Clock();
    let blinkTimer = 0;
    let nextBlinkInterval = 3.0;
    let isBlinking = false;
    let blinkProgress = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Smooth Head Tracking Interpolation
      currentRotY += (targetRotY - currentRotY) * 0.1;
      currentRotX += (targetRotX - currentRotX) * 0.1;
      avatarGroup.rotation.y = currentRotY;
      headMesh.rotation.x = currentRotX * 0.6;
      headMesh.rotation.y = currentRotY * 0.4;

      // Natural Breathing & Floating Sine Wave
      avatarGroup.position.y = Math.sin(elapsedTime * 2.2) * 0.06;
      torsoMesh.scale.y = 1 + Math.sin(elapsedTime * 2.2) * 0.03;

      // Blinking Logic
      blinkTimer += delta;
      if (blinkTimer > nextBlinkInterval && !isBlinking) {
        isBlinking = true;
        blinkProgress = 0;
        blinkTimer = 0;
        nextBlinkInterval = 2.5 + Math.random() * 3.5;
      }

      if (isBlinking) {
        blinkProgress += delta * 12;
        if (blinkProgress <= Math.PI) {
          const blinkScale = Math.sin(blinkProgress);
          leftEyelid.scale.y = blinkScale;
          rightEyelid.scale.y = blinkScale;
        } else {
          leftEyelid.scale.y = 0;
          rightEyelid.scale.y = 0;
          isBlinking = false;
        }
      }

      // Dynamic 3D Lip-Sync when Talking
      if (status === "talking") {
        // High energy talking mouth flap
        const mouthFlap = 0.5 + Math.abs(Math.sin(elapsedTime * 14)) * 0.8;
        mouthMesh.scale.set(1, mouthFlap, 1);
        ledRingMat.color.setHex(0x38bdf8);
        orbitRing1.rotation.z += delta * 2.5;
        orbitRing2.rotation.z -= delta * 2.0;
      } else if (status === "listening") {
        mouthMesh.scale.set(1, 0.2, 1);
        ledRingMat.color.setHex(0xf59e0b); // Amber LED when listening
        orbitRing1.rotation.z += delta * 1.8;
        orbitRing2.rotation.z -= delta * 1.5;
      } else if (status === "thinking") {
        mouthMesh.scale.set(0.8, 0.2, 1);
        ledRingMat.color.setHex(0xa855f7); // Purple LED when thinking
        headMesh.rotation.z = Math.sin(elapsedTime * 2) * 0.08;
      } else {
        // Idle gentle smile
        mouthMesh.scale.set(1, 0.2, 1);
        headMesh.rotation.z = 0;
        orbitRing1.rotation.z += delta * 0.4;
        orbitRing2.rotation.z -= delta * 0.3;
      }

      // Sparkles slow rotation
      particles.rotation.y = elapsedTime * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    // 6. Responsive Resize Observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      container.removeEventListener("mousedown", handlePointerDown);
      container.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
      renderer.dispose();
    };
  }, [status]);

  const statusInfo = {
    idle: {
      text: "Aiko 3D • Standby",
      color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      icon: Sparkles,
    },
    listening: {
      text: "Aiko 3D • Mendengarkan Suara...",
      color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
      icon: Mic,
    },
    thinking: {
      text: "Aiko 3D • Memproses dengan Gemini...",
      color: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
      icon: Radio,
    },
    talking: {
      text: "Aiko 3D • Berbicara...",
      color: "bg-ios-accent/15 text-ios-accent border-ios-accent/30",
      icon: Volume2,
    },
  }[status];

  const StatusIcon = statusInfo.icon;

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <div
        ref={containerRef}
        className={`relative flex items-center justify-center cursor-grab active:cursor-grabbing ${sizeStyles}`}
        title="Putar atau geser mouse untuk menggerakkan Aiko 3D!"
      >
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {showStatusBadge && (
        <div
          className={`mt-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border flex items-center gap-1.5 transition-all shadow-sm ${statusInfo.color}`}
        >
          <StatusIcon
            className={`w-3.5 h-3.5 ${
              status === "listening" || status === "talking" ? "animate-pulse" : ""
            }`}
          />
          <span>{statusInfo.text}</span>
        </div>
      )}
    </div>
  );
}
