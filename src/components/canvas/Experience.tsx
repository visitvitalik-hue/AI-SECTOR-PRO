// src/components/canvas/Experience.tsx
import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

interface ExperienceProps {
  isMobile: boolean;
}

export const Experience: React.FC<ExperienceProps> = ({ isMobile }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const texture = useLoader(THREE.TextureLoader, '/sector88.jpg');

  // Кастомный шейдер для эффекта SyncGo (мягкие края + виньетка)
  const LuxuryShader = {
    uniforms: {
      uTexture: { value: texture },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D uTexture;
      
      void main() {
        vec4 color = texture2D(uTexture, vUv);
        // Создаем маску двустороннего тумана (плавное затухание по краям)
        float edgeMask = smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x) *
                         smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.8, vUv.y);
        
        gl_FragColor = vec4(color.rgb, color.a * edgeMask);
      }
    `
  };

  useFrame((state) => {
    const { x, y } = state.mouse;
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, x * 0.1, 0.05);
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -y * 0.1, 0.05);
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[isMobile ? 4 : 7, isMobile ? 7 : 4]} />
      <shaderMaterial 
        args={[LuxuryShader]} 
        transparent={true}
        depthWrite={false}
      />
    </mesh>
  );
};