import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import HumanAvatar from './HumanAvatar';
import type { AvatarConfig } from '../../../types';

interface AvatarSceneProps {
  config: AvatarConfig;
  size?: string;
  interactive?: boolean;
}

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial color="#6c63ff" wireframe />
    </mesh>
  );
}

export default function AvatarScene({ config, size = 'h-64', interactive = false }: AvatarSceneProps) {
  return (
    <div className={`${size} w-full rounded-xl overflow-hidden`}>
      <Canvas camera={{ position: [0, 1, 3], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 3, 2]} intensity={1.2} />
        <directionalLight position={[-1, 1, 3]} intensity={0.4} color="#a8d8ea" />
        <pointLight position={[0, 1, 3]} intensity={0.3} color="#6c63ff" />
        <Suspense fallback={<LoadingFallback />}>
          <HumanAvatar config={config} />
        </Suspense>
        {interactive && (
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            target={[0, 1, 0]}
          />
        )}
      </Canvas>
    </div>
  );
}
