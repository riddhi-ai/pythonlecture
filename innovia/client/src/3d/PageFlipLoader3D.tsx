import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useLiteMode } from '../context/LiteModeContext';
import { Sticker } from '../stickers/Sticker';

function FilmReel() {
  const meshRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.z -= 0.05;
    }
  });

  return (
    <group ref={meshRef}>
      <mesh>
        <torusGeometry args={[1.2, 0.25, 16, 32]} />
        <meshStandardMaterial color="#4A4458" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.4, 0.4, 0.2, 16]} />
        <meshStandardMaterial color="#FFD6E0" />
      </mesh>
      {/* Film spokes */}
      <mesh rotation={[0, 0, 0]}>
        <boxGeometry args={[2.2, 0.1, 0.1]} />
        <meshStandardMaterial color="#4A4458" />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 3]}>
        <boxGeometry args={[2.2, 0.1, 0.1]} />
        <meshStandardMaterial color="#4A4458" />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 3]}>
        <boxGeometry args={[2.2, 0.1, 0.1]} />
        <meshStandardMaterial color="#4A4458" />
      </mesh>
    </group>
  );
}

export const PageFlipLoader3D: React.FC<{ message?: string }> = ({
  message = 'Turning journal pages...',
}) => {
  const { isLiteMode } = useLiteMode();

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-4">
      {isLiteMode ? (
        <div className="animate-bounce">
          <Sticker name="film_strip" size={54} />
        </div>
      ) : (
        <div className="w-28 h-28">
          <Canvas camera={{ position: [0, 0, 3.5], fov: 45 }} gl={{ alpha: true }}>
            <ambientLight intensity={1} />
            <directionalLight position={[2, 3, 2]} intensity={1.5} />
            <FilmReel />
          </Canvas>
        </div>
      )}
      <p className="font-handwritten text-xl font-bold text-ink animate-pulse">{message}</p>
    </div>
  );
};
