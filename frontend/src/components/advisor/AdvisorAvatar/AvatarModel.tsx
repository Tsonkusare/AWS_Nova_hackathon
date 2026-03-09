import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group } from 'three';
import type { AvatarType } from '../../../types';

interface AvatarModelProps {
  avatarType: AvatarType;
  animate?: boolean;
}

const avatarColors: Record<AvatarType, { head: string; body: string; accent: string }> = {
  lawyer: { head: '#f4c587', body: '#1a1a2e', accent: '#c9a227' },
  auditor: { head: '#f4c587', body: '#2d3a4a', accent: '#4ade80' },
  assistant: { head: '#a8d8ea', body: '#3b3b98', accent: '#6c63ff' },
};

export default function AvatarModel({ avatarType, animate = true }: AvatarModelProps) {
  const groupRef = useRef<Group>(null);
  const colors = avatarColors[avatarType];

  useFrame((state) => {
    if (!groupRef.current || !animate) return;
    // Gentle floating and breathing animation
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.08;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
  });

  return (
    <group ref={groupRef}>
      {/* Body / Torso */}
      <mesh position={[0, -0.5, 0]}>
        <capsuleGeometry args={[0.4, 0.8, 8, 16]} />
        <meshStandardMaterial color={colors.body} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color={colors.head} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.12, 0.6, 0.3]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.12, 0.6, 0.3]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Pupils */}
      <mesh position={[-0.12, 0.6, 0.34]}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[0.12, 0.6, 0.34]}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Mouth - slight smile */}
      <mesh position={[0, 0.45, 0.32]} rotation={[0.2, 0, 0]}>
        <torusGeometry args={[0.08, 0.015, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#c0392b" />
      </mesh>

      {/* Avatar-specific accessories */}
      {avatarType === 'lawyer' && <LawyerAccessories accent={colors.accent} />}
      {avatarType === 'auditor' && <AuditorAccessories accent={colors.accent} />}
      {avatarType === 'assistant' && <AssistantAccessories accent={colors.accent} />}

      {/* Arms */}
      <mesh position={[-0.55, -0.4, 0]} rotation={[0, 0, 0.3]}>
        <capsuleGeometry args={[0.1, 0.5, 8, 16]} />
        <meshStandardMaterial color={colors.body} />
      </mesh>
      <mesh position={[0.55, -0.4, 0]} rotation={[0, 0, -0.3]}>
        <capsuleGeometry args={[0.1, 0.5, 8, 16]} />
        <meshStandardMaterial color={colors.body} />
      </mesh>
    </group>
  );
}

function LawyerAccessories({ accent }: { accent: string }) {
  return (
    <>
      {/* Tie */}
      <mesh position={[0, -0.05, 0.38]}>
        <boxGeometry args={[0.08, 0.35, 0.02]} />
        <meshStandardMaterial color={accent} />
      </mesh>
      {/* Collar points */}
      <mesh position={[-0.1, 0.05, 0.37]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.12, 0.06, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.1, 0.05, 0.37]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.12, 0.06, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </>
  );
}

function AuditorAccessories({ accent }: { accent: string }) {
  return (
    <>
      {/* Glasses */}
      <mesh position={[-0.12, 0.62, 0.33]}>
        <torusGeometry args={[0.07, 0.01, 8, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[0.12, 0.62, 0.33]}>
        <torusGeometry args={[0.07, 0.01, 8, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      {/* Glasses bridge */}
      <mesh position={[0, 0.62, 0.35]}>
        <boxGeometry args={[0.06, 0.01, 0.01]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      {/* Clipboard */}
      <mesh position={[0.6, -0.3, 0.2]} rotation={[0.1, -0.3, 0]}>
        <boxGeometry args={[0.25, 0.35, 0.02]} />
        <meshStandardMaterial color={accent} />
      </mesh>
    </>
  );
}

function AssistantAccessories({ accent }: { accent: string }) {
  return (
    <>
      {/* Antenna */}
      <mesh position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.15, 8]} />
        <meshStandardMaterial color="#666666" />
      </mesh>
      {/* Glowing chest piece */}
      <mesh position={[0, -0.2, 0.4]}>
        <circleGeometry args={[0.08, 16]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.8} />
      </mesh>
    </>
  );
}
