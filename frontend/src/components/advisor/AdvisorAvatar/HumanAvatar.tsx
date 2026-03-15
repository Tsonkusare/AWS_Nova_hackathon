import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group, Mesh, SkinnedMesh, MeshStandardMaterial, Color } from 'three';
import type { AvatarConfig } from '../../../types';

const MALE_MODEL = '/models/Male.glb';
const FEMALE_MODEL = '/models/Female.glb';

useGLTF.preload(MALE_MODEL);
useGLTF.preload(FEMALE_MODEL);

interface HumanAvatarProps {
  config: AvatarConfig;
  animate?: boolean;
}

export default function HumanAvatar({ config, animate = true }: HumanAvatarProps) {
  const groupRef = useRef<Group>(null);
  const isFemale = config.gender === 'female';
  const modelUrl = isFemale ? FEMALE_MODEL : MALE_MODEL;
  const { scene } = useGLTF(modelUrl);

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if ((child instanceof SkinnedMesh || child instanceof Mesh) && child.material) {
        if (Array.isArray(child.material)) {
          child.material = child.material.map((m) => m.clone());
        } else {
          child.material = child.material.clone();
        }
      }
      // Hide built-in glasses
      if ((child.name || '').includes('Wolf3D_Glasses')) {
        child.visible = false;
      }
    });
    return clone;
  }, [scene]);

  // Apply color customizations
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (!((child instanceof SkinnedMesh || child instanceof Mesh) && child.material)) return;
      const mat = child.material as MeshStandardMaterial;
      if (!mat.color) return;
      const name = (child.name || '').toLowerCase();
      const matName = (mat.name || '').toLowerCase();

      if (matName.includes('skin') || name.includes('head') || name.includes('body')) {
        mat.color = new Color(config.skinColor);
        mat.map = null;
        mat.needsUpdate = true;
      }
      if (matName.includes('hair') || name.includes('hair')) {
        mat.color = new Color(config.hairColor);
        mat.map = null;
        mat.needsUpdate = true;
      }
      if (matName.includes('outfit_top') || name.includes('outfit_top')) {
        mat.color = new Color(config.shirtColor);
        mat.map = null;
        mat.needsUpdate = true;
      }
      if (matName.includes('outfit_bottom') || name.includes('outfit_bottom')) {
        mat.color = new Color(config.pantsColor);
        mat.map = null;
        mat.needsUpdate = true;
      }
      if (matName.includes('footwear') || name.includes('footwear')) {
        mat.color = new Color('#1a1a1a');
        mat.map = null;
        mat.needsUpdate = true;
      }
      if (matName.includes('teeth') || name.includes('teeth')) {
        mat.color = new Color('#f5f5f0');
        mat.map = null;
        mat.needsUpdate = true;
      }
    });
  }, [clonedScene, config.skinColor, config.shirtColor, config.pantsColor, config.hairColor]);

  useFrame((state) => {
    if (!groupRef.current || !animate) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.08;
  });

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  );
}
