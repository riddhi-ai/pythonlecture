import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useLiteMode } from '../context/LiteModeContext';
import { Sticker } from '../stickers/Sticker';

function FloatingCamera({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = Math.sin(t * 0.8) * 0.3;
    meshRef.current.rotation.x = Math.cos(t * 0.5) * 0.15;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1.5} position={position}>
      <group ref={meshRef}>
        {/* Camera body */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.6, 1.1, 0.9]} />
          <meshStandardMaterial color="#4A4458" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Top prism */}
        <mesh position={[0, 0.7, 0]}>
          <boxGeometry args={[0.7, 0.4, 0.7]} />
          <meshStandardMaterial color="#6B647B" roughness={0.4} />
        </mesh>
        {/* Lens */}
        <mesh position={[0, 0, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.45, 0.6, 32]} />
          <meshStandardMaterial color="#2E2A38" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Lens reflection ring */}
        <mesh position={[0, 0, 0.92]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.35, 0.05, 16, 32]} />
          <meshStandardMaterial color="#D6EBFF" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </Float>
  );
}

function FloatingHeart({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.z = Math.sin(t * 1.5) * 0.2;
    ref.current.scale.setScalar(1 + Math.sin(t * 3) * 0.06);
  });

  return (
    <Float speed={2.5} rotationIntensity={1.2} floatIntensity={2} position={position}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <MeshWobbleMaterial color="#FFD6E0" factor={0.4} speed={2} roughness={0.2} />
      </mesh>
    </Float>
  );
}

function FloatingCoin({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.03;
  });

  return (
    <Float speed={1.8} rotationIntensity={0.8} floatIntensity={1.2} position={position}>
      <mesh ref={ref} rotation={[Math.PI / 4, 0, 0]}>
        <cylinderGeometry args={[0.65, 0.65, 0.15, 32]} />
        <meshStandardMaterial color="#FFF3B8" metalness={0.7} roughness={0.25} />
      </mesh>
    </Float>
  );
}

function FloatingStar({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z += 0.02;
    ref.current.rotation.x += 0.01;
  });

  return (
    <Float speed={3} rotationIntensity={2} floatIntensity={2.5} position={position}>
      <mesh ref={ref}>
        <octahedronGeometry args={[0.35]} />
        <meshStandardMaterial color="#D4F5E4" metalness={0.5} roughness={0.3} />
      </mesh>
    </Float>
  );
}

export const HeroScene: React.FC = () => {
  const { isLiteMode } = useLiteMode();

  if (isLiteMode) {
    return (
      <div className="w-full h-80 sm:h-96 relative flex items-center justify-center">
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 bg-paper-cream border-2 border-paper-border rounded-3xl p-6 shadow-scrapbook flex items-center justify-center rotate-1">
          <div className="absolute -top-3 left-10 washi-tape washi-tape-pink w-28 h-6 rotate-[-4deg]"></div>
          <div className="absolute -bottom-3 right-8 washi-tape washi-tape-mint w-28 h-6 rotate-[3deg]"></div>
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex gap-4 items-center">
              <Sticker name="camera" size={64} interactive />
              <Sticker name="coin" size={56} interactive />
            </div>
            <div className="flex gap-3 items-center">
              <Sticker name="heart" size={48} interactive />
              <Sticker name="trophy" size={54} interactive />
              <Sticker name="rocket" size={48} interactive />
            </div>
            <p className="font-handwritten text-xl text-ink font-bold mt-2">
              ✨ 2D Lite Journal Mode Active
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-80 sm:h-96 relative select-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} />
        <pointLight position={[-4, -3, -2]} intensity={0.5} color="#FFD6E0" />
        <pointLight position={[4, 3, 2]} intensity={0.6} color="#FFF3B8" />

        <FloatingCamera position={[0, 0.2, 0]} />
        <FloatingHeart position={[-2.2, 1.2, -0.5]} />
        <FloatingCoin position={[2.2, -0.8, -0.2]} />
        <FloatingStar position={[-1.8, -1.2, 0.2]} />
        <FloatingStar position={[2.0, 1.4, -0.8]} />
      </Canvas>
    </div>
  );
};
