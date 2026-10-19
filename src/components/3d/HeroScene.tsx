import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { WorkloadState } from '../../types';

interface SceneProps {
  status: WorkloadState;
}

// Floating EC2 Glass Cube inside Shield
function EC2GlassCube({ status }: { status: WorkloadState }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const innerRef = useRef<THREE.Mesh>(null!);
  const shieldRef = useRef<THREE.Mesh>(null!);
  const shockwaveRef = useRef<THREE.Mesh>(null!);
  const evidenceOrbRef = useRef<THREE.Mesh>(null!);

  // Determine dynamic colors based on status
  const isAttack = status === 'UNDER_ATTACK';
  const isQuarantine = status === 'QUARANTINED';

  const cubeColor = isAttack ? '#FF4D5E' : isQuarantine ? '#2EF2C0' : '#7CC4FF';
  const shieldColor = isQuarantine ? '#2EF2C0' : isAttack ? '#FF4D5E' : '#2EF2C0';

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.35;
      meshRef.current.rotation.y += delta * 0.45;
    }
    if (innerRef.current) {
      innerRef.current.rotation.x -= delta * 0.5;
      innerRef.current.rotation.y -= delta * 0.6;
    }
    if (shieldRef.current) {
      shieldRef.current.rotation.y += delta * (isQuarantine ? 0.8 : 0.2);
      shieldRef.current.rotation.z += delta * 0.15;
      const targetScale = isQuarantine ? 1.45 : isAttack ? 1.6 : 1.35;
      shieldRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);
    }
    if (shockwaveRef.current && isQuarantine) {
      shockwaveRef.current.rotation.x += delta * 1.5;
      const t = (state.clock.getElapsedTime() * 2) % 3;
      shockwaveRef.current.scale.set(1 + t * 0.8, 1 + t * 0.8, 1 + t * 0.8);
      const mat = shockwaveRef.current.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = Math.max(0, 1 - t / 3);
    }
    if (evidenceOrbRef.current && isQuarantine) {
      const angle = state.clock.getElapsedTime() * 2.2;
      evidenceOrbRef.current.position.x = Math.cos(angle) * 2.1;
      evidenceOrbRef.current.position.z = Math.sin(angle) * 2.1;
      evidenceOrbRef.current.position.y = Math.sin(angle * 2) * 0.6;
    }
  });

  return (
    <group>
      {/* Outer Glass Cube */}
      <mesh ref={meshRef}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshPhysicalMaterial
          color={cubeColor}
          roughness={0.15}
          transmission={0.85}
          thickness={1.2}
          transparent
          opacity={0.85}
          ior={1.5}
        />
      </mesh>

      {/* Glowing Inner Core (The CPU/RAM Engine) */}
      <mesh ref={innerRef}>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshStandardMaterial
          color={isAttack ? '#FF8A5B' : isQuarantine ? '#8B6CFF' : '#2EF2C0'}
          emissive={isAttack ? '#FF4D5E' : isQuarantine ? '#8B6CFF' : '#2EF2C0'}
          emissiveIntensity={isAttack ? 3.0 : 1.8}
          wireframe
        />
      </mesh>

      {/* Hexagonal Shield Lattice */}
      <mesh ref={shieldRef}>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshStandardMaterial
          color={shieldColor}
          emissive={shieldColor}
          emissiveIntensity={isQuarantine ? 2.5 : isAttack ? 1.5 : 0.6}
          wireframe
          transparent
          opacity={isQuarantine ? 0.95 : isAttack ? 0.4 : 0.35}
        />
      </mesh>

      {/* Expanding Teal Shockwave Ring when quarantined */}
      {isQuarantine && (
        <mesh ref={shockwaveRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.6, 1.75, 64]} />
          <meshBasicMaterial
            color="#2EF2C0"
            side={THREE.DoubleSide}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}

      {/* Orbiting Violet Evidence Seal Orb */}
      {isQuarantine && (
        <mesh ref={evidenceOrbRef}>
          <sphereGeometry args={[0.22, 32, 32]} />
          <meshStandardMaterial
            color="#C4A8FF"
            emissive="#8B6CFF"
            emissiveIntensity={3}
          />
        </mesh>
      )}
    </group>
  );
}

// Particle Swarm (Ambient Aurora Dust + Attack Particles)
function ParticleDust({ status }: { status: WorkloadState }) {
  const count = 180;
  const isAttack = status === 'UNDER_ATTACK';

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const colorTeal = new THREE.Color('#2EF2C0');
    const colorViolet = new THREE.Color('#8B6CFF');
    const colorCoral = new THREE.Color('#FF4D5E');

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;

      const chosenColor = isAttack ? colorCoral : (i % 2 === 0 ? colorTeal : colorViolet);
      col[i * 3] = chosenColor.r;
      col[i * 3 + 1] = chosenColor.g;
      col[i * 3 + 2] = chosenColor.b;
    }
    return [pos, col];
  }, [isAttack]);

  const pointsRef = useRef<THREE.Points>(null!);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * (isAttack ? 0.35 : 0.08);
      pointsRef.current.rotation.x += delta * 0.04;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={isAttack ? 0.12 : 0.08}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export const HeroScene: React.FC<SceneProps> = ({ status }) => {
  return (
    <div className="relative w-full h-full min-h-[460px] md:min-h-[560px] flex items-center justify-center">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#2EF2C0" />
        <pointLight position={[-10, -10, -10]} intensity={1.2} color="#8B6CFF" />
        <directionalLight position={[0, 5, 5]} intensity={0.8} color="#FFFFFF" />

        <Float speed={1.8} rotationIntensity={0.6} floatIntensity={0.8}>
          <EC2GlassCube status={status} />
        </Float>

        <ParticleDust status={status} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 2.3}
          autoRotate
          autoRotateSpeed={status === 'UNDER_ATTACK' ? 3.0 : 0.6}
        />
      </Canvas>

      {/* Floating State Badge HUD with terminal string */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full glass-panel flex items-center gap-3 border border-white/10 shadow-2xl backdrop-blur-xl pointer-events-none">
        <span className={`w-2.5 h-2.5 rounded-full ${
          status === 'HEALTHY' ? 'bg-aurora-teal animate-pulse' :
          status === 'UNDER_ATTACK' ? 'bg-ember-coral animate-ping' :
          'bg-aurora-violet shadow-[0_0_10px_#8B6CFF]'
        }`} />
        <span className="text-xs font-mono font-bold tracking-wider text-text-primary">
          {status === 'HEALTHY' && '[ STATUS: NORMAL WORKLOAD ]'}
          {status === 'UNDER_ATTACK' && '[ ALERT: MITRE C2 BREACH DETECTED ]'}
          {status === 'QUARANTINED' && '[ STATUS: ZERO-TRUST QUARANTINED ]'}
        </span>
      </div>
    </div>
  );
};
