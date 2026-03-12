import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import HumanAvatar from './HumanAvatar';
import type { AvatarConfig } from '../../../types';

interface AvatarSceneProps {
  config: AvatarConfig;
  size?: string;
  interactive?: boolean;
}

export default function AvatarScene({ config, size = 'h-64', interactive = false }: AvatarSceneProps) {
  return (
    <div className={`${size} w-full rounded-xl overflow-hidden`}>
      <Canvas camera={{ position: [0, 0.2, 2.2], fov: 40 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 3, 2]} intensity={1} />
        <directionalLight position={[-1, 1, 3]} intensity={0.3} color="#a8d8ea" />
        <pointLight position={[0, 1, 3]} intensity={0.3} color="#6c63ff" />
        <HumanAvatar config={config} />
        {interactive && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.8}
            target={[0, 0.2, 0]}
          />
        )}
      </Canvas>
    </div>
  );
}
