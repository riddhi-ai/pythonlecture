import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useLiteMode } from '../context/LiteModeContext';
import { Sticker } from '../stickers/Sticker';

function SpinningHourglass() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.03;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Top and Bottom Caps */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 0.1, 24]} />
        <meshStandardMaterial color="#4A4458" metalness={0.4} />
      </mesh>
      <mesh position={[0, -0.9, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 0.1, 24]} />
        <meshStandardMaterial color="#4A4458" metalness={0.4} />
      </mesh>
      {/* Top Cones */}
      <mesh position={[0, 0.45, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.55, 0.8, 24]} />
        <meshStandardMaterial color="#D6EBFF" transparent opacity={0.65} roughness={0.1} />
      </mesh>
      {/* Bottom Cones */}
      <mesh position={[0, -0.45, 0]}>
        <coneGeometry args={[0.55, 0.8, 24]} />
        <meshStandardMaterial color="#D6EBFF" transparent opacity={0.65} roughness={0.1} />
      </mesh>
      {/* Sand */}
      <mesh position={[0, -0.65, 0]}>
        <coneGeometry args={[0.35, 0.4, 24]} />
        <meshStandardMaterial color="#FFF3B8" roughness={0.6} />
      </mesh>
    </group>
  );
}

export const KpiHourglass3D: React.FC<{ size?: number }> = ({ size = 48 }) => {
  const { isLiteMode } = useLiteMode();

  if (isLiteMode) {
    return <Sticker name="hourglass" size={size} />;
  }

  return (
    <div style={{ width: size, height: size }} className="inline-block pointer-events-none">
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }} gl={{ alpha: true }}>
        <ambientLight intensity={1} />
        <directionalLight position={[2, 3, 2]} intensity={1.5} />
        <SpinningHourglass />
      </Canvas>
    </div>
  );
};
