import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stage, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';

function FuturisticCar() {
  const group = useRef<THREE.Group>(null);
  
  // Floating animation
  useFrame((state) => {
    if (group.current) {
      group.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05 - 0.5;
    }
  });

  return (
    <group ref={group}>
      {/* Base Chassis / Main Body */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.8, 1.8]} />
        <meshPhysicalMaterial 
          color="#0b0f19" 
          metalness={1.0} 
          roughness={0.2} 
          clearcoat={1.0}
          clearcoatRoughness={0.1}
        />
      </mesh>
      
      {/* Cabin / Glass Dome */}
      <mesh position={[-0.3, 1.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.6, 1.5]} />
        <meshPhysicalMaterial 
          color="#a78bfa" 
          transmission={0.9} 
          opacity={1} 
          transparent 
          metalness={0.3} 
          roughness={0.1} 
        />
      </mesh>

      {/* Front Hood Angle */}
      <mesh position={[1.5, 0.6, 0]} rotation={[0, 0, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.6, 1.7]} />
        <meshPhysicalMaterial color="#0b0f19" metalness={1.0} roughness={0.2} clearcoat={1.0} />
      </mesh>

      {/* Wheels */}
      {[-1.2, 1.3].map((x, i) => (
        <group key={`wheels-${i}`}>
          <mesh position={[x, 0.2, 1.0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.5, 0.5, 0.3, 32]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.5} />
            {/* Neon Rim */}
            <mesh position={[0, 0.16, 0]}>
               <ringGeometry args={[0.35, 0.45, 32]} />
               <meshBasicMaterial color="#ec4899" side={THREE.DoubleSide} />
            </mesh>
          </mesh>
          <mesh position={[x, 0.2, -1.0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.5, 0.5, 0.3, 32]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.5} />
            {/* Neon Rim */}
            <mesh position={[0, -0.16, 0]}>
               <ringGeometry args={[0.35, 0.45, 32]} />
               <meshBasicMaterial color="#ec4899" side={THREE.DoubleSide} />
            </mesh>
          </mesh>
        </group>
      ))}

      {/* Headlights (Neon Accents) */}
      <mesh position={[2.1, 0.5, 0.6]}>
        <boxGeometry args={[0.1, 0.1, 0.4]} />
        <meshBasicMaterial color="#34d399" />
      </mesh>
      <mesh position={[2.1, 0.5, -0.6]}>
        <boxGeometry args={[0.1, 0.1, 0.4]} />
        <meshBasicMaterial color="#34d399" />
      </mesh>
      
      {/* Taillights */}
      <mesh position={[-2.1, 0.6, 0]}>
        <boxGeometry args={[0.1, 0.1, 1.6]} />
        <meshBasicMaterial color="#f43f5e" />
      </mesh>

      {/* Neon Underglow light */}
      <pointLight
        color="#ec4899"
        intensity={20}
        position={[0, 0.1, 0]}
        distance={5}
      />
    </group>
  );
}

const CarModel: React.FC = () => {
  return (
    <PresentationControls speed={1.5} global zoom={0.6} polar={[-0.1, Math.PI / 4]} azimuth={[-Math.PI / 4, Math.PI / 4]}>
      <Stage environment="city" intensity={0.5} adjustCamera={false}>
        <FuturisticCar />
      </Stage>
    </PresentationControls>
  );
};

export default CarModel;
