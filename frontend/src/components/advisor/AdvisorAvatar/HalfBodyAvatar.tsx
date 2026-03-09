import { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Group } from 'three';

interface HalfBodyModelProps {
  url: string;
}

function AvatarModel({ url }: HalfBodyModelProps) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<Group>(null);

  useEffect(() => {
    if (groupRef.current) {
      // Center the model and position for half-body view
      groupRef.current.position.set(0, -0.55, 0);
    }
  }, [scene]);

  // Subtle idle breathing animation
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.position.y = -0.55 + Math.sin(t * 0.8) * 0.01;
    groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.05;
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={1.8} />
    </group>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial color="#6c63ff" wireframe />
    </mesh>
  );
}

interface HalfBodyAvatarProps {
  url: string;
}

export default function HalfBodyAvatar({ url }: HalfBodyAvatarProps) {
  return (
    <div className="h-80 w-full rounded-xl overflow-hidden bg-gradient-to-b from-slate-800/50 to-transparent">
      <Canvas camera={{ position: [0, 0.2, 1.5], fov: 35 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 3, 2]} intensity={1.2} />
        <directionalLight position={[-2, 1, 2]} intensity={0.4} color="#a8d8ea" />
        <pointLight position={[0, 1, 3]} intensity={0.3} color="#6c63ff" />
        <Suspense fallback={<LoadingFallback />}>
          <AvatarModel url={url} />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
          target={[0, 0.1, 0]}
        />
      </Canvas>
    </div>
  );
}
