import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import HumanAvatar from './HumanAvatar';
import type { AvatarConfig } from '../../../types';

interface AvatarSceneProps {
  config: AvatarConfig;
  size?: string;
}

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial color="#6c63ff" wireframe />
    </mesh>
  );
}

export default function AvatarScene({ config, size = 'h-64' }: AvatarSceneProps) {
  return (
    <div className={`${size} w-full rounded-xl`}>
      <Canvas camera={{ position: [0, 0.9, 2.5], fov: 40 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 3, 2]} intensity={1.2} />
        <directionalLight position={[-1, 1, 3]} intensity={0.4} color="#a8d8ea" />
        <pointLight position={[0, 1, 3]} intensity={0.3} color="#6c63ff" />
        <Suspense fallback={<LoadingFallback />}>
          <HumanAvatar config={config} />
        </Suspense>
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          target={[0, 0.9, 0]}
          minDistance={0.5}
          maxDistance={5}
          enableDamping={true}
          zoomToCursor={true}
        />
      </Canvas>
    </div>
  );
}
