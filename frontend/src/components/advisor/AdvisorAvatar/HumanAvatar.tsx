import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import type { AvatarConfig } from '../../../types';

interface HumanAvatarProps {
  config: AvatarConfig;
  animate?: boolean;
}

export default function HumanAvatar({ config, animate = true }: HumanAvatarProps) {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (!groupRef.current || !animate) return;
    const t = state.clock.elapsedTime;
    groupRef.current.position.y = Math.sin(t * 0.8) * 0.03;
    groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.08;
  });

  const isFemale = config.gender === 'female';
  const headSize = isFemale ? 0.3 : 0.32;
  const neckWidth = isFemale ? 0.1 : 0.12;
  const jawWidth = isFemale ? 0.12 : 0.14;
  const browThickness = isFemale ? 0.012 : 0.025;
  const browWidth = isFemale ? 0.08 : 0.1;
  const noseSize = isFemale ? 0.028 : 0.035;
  const lipColor = isFemale ? '#e74c6f' : '#c0392b';
  const lipSize = isFemale ? 0.06 : 0.055;

  return (
    <group ref={groupRef}>
      {/* Neck */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[neckWidth, jawWidth, 0.2, 16]} />
        <meshStandardMaterial color={config.skinColor} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[headSize, 32, 32]} />
        <meshStandardMaterial color={config.skinColor} />
      </mesh>

      {/* Jaw - more angular for male, softer for female */}
      {!isFemale && (
        <mesh position={[0, 0.38, 0.08]}>
          <boxGeometry args={[0.22, 0.1, 0.2]} />
          <meshStandardMaterial color={config.skinColor} />
        </mesh>
      )}

      {/* Cheeks - rounder for female */}
      {isFemale && (
        <>
          <mesh position={[-0.18, 0.48, 0.15]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color={config.skinColor} />
          </mesh>
          <mesh position={[0.18, 0.48, 0.15]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color={config.skinColor} />
          </mesh>
        </>
      )}

      {/* Ears */}
      <mesh position={[-(headSize + 0.02), 0.52, 0]}>
        <sphereGeometry args={[isFemale ? 0.05 : 0.06, 16, 16]} />
        <meshStandardMaterial color={config.skinColor} />
      </mesh>
      <mesh position={[(headSize + 0.02), 0.52, 0]}>
        <sphereGeometry args={[isFemale ? 0.05 : 0.06, 16, 16]} />
        <meshStandardMaterial color={config.skinColor} />
      </mesh>

      {/* Eyes - whites */}
      <mesh position={[-0.11, 0.6, 0.27]}>
        <sphereGeometry args={[isFemale ? 0.058 : 0.055, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.11, 0.6, 0.27]}>
        <sphereGeometry args={[isFemale ? 0.058 : 0.055, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Eyes - iris */}
      <mesh position={[-0.11, 0.6, 0.315]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial color="#4a3728" />
      </mesh>
      <mesh position={[0.11, 0.6, 0.315]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial color="#4a3728" />
      </mesh>

      {/* Eyes - pupils */}
      <mesh position={[-0.11, 0.6, 0.34]}>
        <sphereGeometry args={[0.018, 16, 16]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh position={[0.11, 0.6, 0.34]}>
        <sphereGeometry args={[0.018, 16, 16]} />
        <meshStandardMaterial color="#111111" />
      </mesh>

      {/* Eyelashes - female only */}
      {isFemale && (
        <>
          <mesh position={[-0.11, 0.635, 0.3]} rotation={[0.3, 0, 0.1]}>
            <boxGeometry args={[0.1, 0.008, 0.02]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
          <mesh position={[0.11, 0.635, 0.3]} rotation={[0.3, 0, -0.1]}>
            <boxGeometry args={[0.1, 0.008, 0.02]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
        </>
      )}

      {/* Eyebrows */}
      <mesh position={[-0.11, 0.68, 0.28]} rotation={[0.1, 0, 0.1]}>
        <boxGeometry args={[browWidth, browThickness, 0.03]} />
        <meshStandardMaterial color={config.hairColor} />
      </mesh>
      <mesh position={[0.11, 0.68, 0.28]} rotation={[0.1, 0, -0.1]}>
        <boxGeometry args={[browWidth, browThickness, 0.03]} />
        <meshStandardMaterial color={config.hairColor} />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 0.52, 0.32]}>
        <coneGeometry args={[noseSize, isFemale ? 0.06 : 0.08, 8]} />
        <meshStandardMaterial color={config.skinColor} />
      </mesh>

      {/* Mouth - smile */}
      <mesh position={[0, 0.43, 0.3]} rotation={[Math.PI + 0.15, 0, 0]}>
        <torusGeometry args={[lipSize, isFemale ? 0.015 : 0.012, 8, 16, Math.PI]} />
        <meshStandardMaterial color={lipColor} />
      </mesh>

      {/* Hair */}
      <Hair style={config.hairStyle} color={config.hairColor} />

      {/* Glasses */}
      {config.glasses && <Glasses />}

      {/* === BODY === */}
      <Body gender={config.gender} shirtColor={config.shirtColor} pantsColor={config.pantsColor} skinColor={config.skinColor} />
    </group>
  );
}

function Body({ gender, shirtColor, pantsColor, skinColor }: { gender: string; shirtColor: string; pantsColor: string; skinColor: string }) {
  const isFemale = gender === 'female';
  const shoulderWidth = isFemale ? 0.36 : 0.42;
  const torsoWidth = isFemale ? 0.28 : 0.32;
  const hipWidth = isFemale ? 0.3 : 0.28;

  return (
    <group>
      {/* === SHIRT / TORSO === */}
      {/* Main torso */}
      <mesh position={[0, -0.3, 0]}>
        <capsuleGeometry args={[torsoWidth, 0.45, 8, 16]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>

      {/* Chest shape - differs by gender */}
      {isFemale && (
        <>
          <mesh position={[-0.12, -0.15, 0.22]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color={shirtColor} />
          </mesh>
          <mesh position={[0.12, -0.15, 0.22]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color={shirtColor} />
          </mesh>
        </>
      )}

      {/* Collar / neckline */}
      <mesh position={[0, 0.02, 0.14]} rotation={[0.4, 0, 0]}>
        <torusGeometry args={[isFemale ? 0.12 : 0.14, 0.02, 8, 16, Math.PI]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>

      {/* Shoulders */}
      <mesh position={[-shoulderWidth, -0.12, 0]}>
        <sphereGeometry args={[isFemale ? 0.11 : 0.14, 16, 16]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>
      <mesh position={[shoulderWidth, -0.12, 0]}>
        <sphereGeometry args={[isFemale ? 0.11 : 0.14, 16, 16]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>

      {/* Sleeves / upper arms */}
      <mesh position={[-(shoulderWidth + 0.08), -0.35, 0]} rotation={[0, 0, 0.15]}>
        <capsuleGeometry args={[isFemale ? 0.065 : 0.08, 0.35, 8, 16]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>
      <mesh position={[(shoulderWidth + 0.08), -0.35, 0]} rotation={[0, 0, -0.15]}>
        <capsuleGeometry args={[isFemale ? 0.065 : 0.08, 0.35, 8, 16]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>

      {/* Forearms (skin) */}
      <mesh position={[-(shoulderWidth + 0.12), -0.62, 0]} rotation={[0, 0, 0.08]}>
        <capsuleGeometry args={[isFemale ? 0.05 : 0.06, 0.18, 8, 16]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      <mesh position={[(shoulderWidth + 0.12), -0.62, 0]} rotation={[0, 0, -0.08]}>
        <capsuleGeometry args={[isFemale ? 0.05 : 0.06, 0.18, 8, 16]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>

      {/* Hands */}
      <mesh position={[-(shoulderWidth + 0.14), -0.78, 0]}>
        <sphereGeometry args={[isFemale ? 0.055 : 0.065, 16, 16]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      <mesh position={[(shoulderWidth + 0.14), -0.78, 0]}>
        <sphereGeometry args={[isFemale ? 0.055 : 0.065, 16, 16]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>

      {/* === WAIST / BELT LINE === */}
      <mesh position={[0, -0.58, 0]}>
        <cylinderGeometry args={[hipWidth, hipWidth, 0.04, 16]} />
        <meshStandardMaterial color="#222222" />
      </mesh>

      {/* === PANTS === */}
      {/* Hips */}
      <mesh position={[0, -0.68, 0]}>
        <capsuleGeometry args={[hipWidth, 0.12, 8, 16]} />
        <meshStandardMaterial color={pantsColor} />
      </mesh>

      {/* Left leg */}
      <mesh position={[-0.14, -0.95, 0]}>
        <capsuleGeometry args={[isFemale ? 0.1 : 0.11, 0.35, 8, 16]} />
        <meshStandardMaterial color={pantsColor} />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.14, -0.95, 0]}>
        <capsuleGeometry args={[isFemale ? 0.1 : 0.11, 0.35, 8, 16]} />
        <meshStandardMaterial color={pantsColor} />
      </mesh>
    </group>
  );
}

function Hair({ style, color }: { style: string; color: string }) {
  switch (style) {
    case 'short':
      return (
        <group>
          {/* Main hair volume - sits close to scalp */}
          <mesh position={[0, 0.72, -0.02]}>
            <sphereGeometry args={[0.335, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.48]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* Fringe / front texture - slight forward sweep */}
          <mesh position={[0, 0.73, 0.12]} rotation={[0.3, 0, 0]}>
            <sphereGeometry args={[0.28, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.3]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* Side taper left */}
          <mesh position={[-0.22, 0.6, 0.05]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* Side taper right */}
          <mesh position={[0.22, 0.6, 0.05]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* Back blend */}
          <mesh position={[0, 0.62, -0.18]}>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      );
    case 'long':
      return (
        <group>
          {/* Top volume */}
          <mesh position={[0, 0.73, -0.02]}>
            <sphereGeometry args={[0.35, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* Left side - flows down */}
          <mesh position={[-0.28, 0.45, -0.02]}>
            <capsuleGeometry args={[0.09, 0.35, 8, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[-0.24, 0.2, 0.02]}>
            <capsuleGeometry args={[0.07, 0.2, 8, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* Right side - flows down */}
          <mesh position={[0.28, 0.45, -0.02]}>
            <capsuleGeometry args={[0.09, 0.35, 8, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0.24, 0.2, 0.02]}>
            <capsuleGeometry args={[0.07, 0.2, 8, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* Back curtain */}
          <mesh position={[0, 0.38, -0.2]}>
            <capsuleGeometry args={[0.2, 0.45, 8, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0, 0.15, -0.18]}>
            <capsuleGeometry args={[0.16, 0.15, 8, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* Fringe */}
          <mesh position={[0, 0.72, 0.15]} rotation={[0.4, 0, 0]}>
            <sphereGeometry args={[0.28, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.25]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      );
    case 'bun':
      return (
        <group>
          {/* Base hair close to head */}
          <mesh position={[0, 0.72, -0.02]}>
            <sphereGeometry args={[0.335, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.48]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* Pulled-back sides */}
          <mesh position={[-0.2, 0.58, -0.05]}>
            <sphereGeometry args={[0.14, 16, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0.2, 0.58, -0.05]}>
            <sphereGeometry args={[0.14, 16, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* Bun */}
          <mesh position={[0, 0.88, -0.15]}>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* Bun wrap detail */}
          <mesh position={[0, 0.88, -0.15]} rotation={[0.3, 0, 0]}>
            <torusGeometry args={[0.08, 0.025, 8, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      );
    case 'mohawk':
      return (
        <group>
          {/* Shaved sides - very thin layer */}
          <mesh position={[0, 0.7, 0]}>
            <sphereGeometry args={[0.33, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
            <meshStandardMaterial color={color} opacity={0.6} transparent />
          </mesh>
          {/* Mohawk ridge - front to back */}
          <mesh position={[0, 0.85, 0.08]} rotation={[0.2, 0, 0]}>
            <capsuleGeometry args={[0.04, 0.12, 8, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0, 0.87, -0.02]}>
            <capsuleGeometry args={[0.045, 0.1, 8, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0, 0.85, -0.12]} rotation={[-0.2, 0, 0]}>
            <capsuleGeometry args={[0.035, 0.1, 8, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* Spiky top details */}
          <mesh position={[0, 0.92, 0.02]} rotation={[0.1, 0, 0.1]}>
            <coneGeometry args={[0.03, 0.08, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0, 0.93, -0.05]} rotation={[-0.1, 0, -0.05]}>
            <coneGeometry args={[0.025, 0.07, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      );
    case 'buzz':
      return (
        <group>
          {/* Very close to scalp - thin even layer */}
          <mesh position={[0, 0.68, -0.01]}>
            <sphereGeometry args={[0.33, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.48]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>
          {/* Subtle hairline at forehead */}
          <mesh position={[0, 0.71, 0.15]} rotation={[0.5, 0, 0]}>
            <sphereGeometry args={[0.22, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.2]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>
        </group>
      );
    default:
      return null;
  }
}

function Glasses() {
  return (
    <group>
      {/* Left lens */}
      <mesh position={[-0.11, 0.6, 0.32]}>
        <torusGeometry args={[0.065, 0.008, 8, 16]} />
        <meshStandardMaterial color="#333333" metalness={0.8} />
      </mesh>
      {/* Right lens */}
      <mesh position={[0.11, 0.6, 0.32]}>
        <torusGeometry args={[0.065, 0.008, 8, 16]} />
        <meshStandardMaterial color="#333333" metalness={0.8} />
      </mesh>
      {/* Bridge */}
      <mesh position={[0, 0.6, 0.35]}>
        <boxGeometry args={[0.06, 0.008, 0.008]} />
        <meshStandardMaterial color="#333333" metalness={0.8} />
      </mesh>
      {/* Temples */}
      <mesh position={[-0.25, 0.6, 0.2]} rotation={[0, 0.5, 0]}>
        <boxGeometry args={[0.2, 0.008, 0.008]} />
        <meshStandardMaterial color="#333333" metalness={0.8} />
      </mesh>
      <mesh position={[0.25, 0.6, 0.2]} rotation={[0, -0.5, 0]}>
        <boxGeometry args={[0.2, 0.008, 0.008]} />
        <meshStandardMaterial color="#333333" metalness={0.8} />
      </mesh>
    </group>
  );
}
