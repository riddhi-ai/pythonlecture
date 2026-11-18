import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { useLiteMode } from '../context/LiteModeContext';
import { Sticker } from '../stickers/Sticker';

interface TrophyItem {
  rank: number;
  brandName: string;
  profit: number; // in cents
}

function TrophyMesh({
  position,
  color,
  scale = 1,
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.5 + position[0]) * 0.25;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8} position={position}>
      <group ref={ref} scale={scale}>
        {/* Cup */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.5, 0.25, 0.7, 16]} />
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
        </mesh>
        {/* Stem */}
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.3, 12]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Base */}
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.45, 0.5, 0.2, 16]} />
          <meshStandardMaterial color="#4A4458" metalness={0.3} roughness={0.4} />
        </mesh>
      </group>
    </Float>
  );
}

export const TrophyShelf3D: React.FC<{ items: TrophyItem[] }> = ({ items }) => {
  const { isLiteMode } = useLiteMode();

  const colors = ['#FFE47A', '#E4D9FF', '#FFE0CC']; // Gold, Silver, Bronze

  if (isLiteMode) {
    return (
      <div className="flex justify-around items-end p-4 bg-paper-cream border border-paper-border rounded-2xl">
        {items.slice(0, 3).map((item, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1 text-center">
            <Sticker name="trophy" size={idx === 0 ? 56 : 44} />
            <span className="font-handwritten text-lg font-bold text-ink">#{idx + 1} {item.brandName}</span>
            <span className="text-xs font-mono font-bold text-mint-dark bg-mint px-2 py-0.5 rounded-full">
              +${(item.profit / 100).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full h-44 relative bg-paper-cream/60 rounded-2xl border border-paper-border overflow-hidden">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 42 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[4, 5, 4]} intensity={1.5} />
        {/* Rank 2 (Left) */}
        <TrophyMesh position={[-1.7, -0.2, 0]} color={colors[1]} scale={0.85} />
        {/* Rank 1 (Center, Gold, elevated) */}
        <TrophyMesh position={[0, 0.2, 0]} color={colors[0]} scale={1.15} />
        {/* Rank 3 (Right) */}
        <TrophyMesh position={[1.7, -0.3, 0]} color={colors[2]} scale={0.75} />
      </Canvas>
      <div className="absolute bottom-2 inset-x-0 flex justify-around px-4 pointer-events-none">
        {items.slice(0, 3).map((item, idx) => (
          <div key={idx} className="text-center">
            <p className="font-handwritten text-sm font-bold text-ink truncate max-w-[90px]">
              {item.brandName}
            </p>
            <p className="text-[11px] font-mono text-mint-dark font-bold">
              ${(item.profit / 100).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
