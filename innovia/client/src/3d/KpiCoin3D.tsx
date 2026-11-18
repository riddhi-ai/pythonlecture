import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useLiteMode } from '../context/LiteModeContext';
import { Sticker } from '../stickers/Sticker';

function SpinningCoin() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.04;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[0.2, 0, 0]}>
      <cylinderGeometry args={[1, 1, 0.22, 32]} />
      <meshStandardMaterial color="#FFE47A" metalness={0.75} roughness={0.2} />
    </mesh>
  );
}

export const KpiCoin3D: React.FC<{ size?: number }> = ({ size = 48 }) => {
  const { isLiteMode } = useLiteMode();

  if (isLiteMode) {
    return <Sticker name="coin" size={size} />;
  }

  return (
    <div style={{ width: size, height: size }} className="inline-block pointer-events-none">
      <Canvas camera={{ position: [0, 0, 2.8], fov: 45 }} gl={{ alpha: true }}>
        <ambientLight intensity={1} />
        <directionalLight position={[2, 3, 2]} intensity={1.5} />
        <SpinningCoin />
      </Canvas>
    </div>
  );
};
