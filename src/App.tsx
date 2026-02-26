import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { hapticFeedback } from '@telegram-apps/sdk';

// --- Types ---
interface IMenuItem {
  id: string;
  label: string;
  content: string;
}

// --- WebGL: Background Core ---
const Scene = ({ isMobile }: { isMobile: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const texture = useLoader(THREE.TextureLoader, '/sector88.jpg');

  const shaderData = useMemo(() => ({
    uniforms: { uTexture: { value: texture }, uTime: { value: 0 } },
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
        vec4 tex = texture2D(uTexture, vUv);
        float edge = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x) *
                     smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.85, vUv.y);
        gl_FragColor = vec4(tex.rgb, tex.a * edge);
      }
    `
  }), [texture]);

  useFrame((state) => {
    const { x, y } = state.mouse;
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, x * 0.1, 0.05);
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -y * 0.1, 0.05);
  });

  return (
    <mesh ref={meshRef}>
      {/* Уменьшенный Plane для мобилок, чтобы не выталкивать кнопки */}
      <planeGeometry args={[isMobile ? 2.5 : 6.5, isMobile ? 4.5 : 3.8]} />
      <shaderMaterial args={[shaderData]} transparent depthWrite={false} />
    </mesh>
  );
};

const Typewriter = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState('');
  useEffect(() => {
    let i = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, 20);
    return () => clearInterval(timer);
  }, [text]);
  return <span>{displayedText}<motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity }}>_</motion.span></span>;
};

// --- Main App ---
export default function App() {
  const [loading, setLoading] = useState(0);
  const [show, setShow] = useState(false);
  const [hold, setHold] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < window.innerHeight);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const menuItems: IMenuItem[] = [
    { id: 'sys', label: 'ACCESS_CORE', content: 'SYSTEM_STABLE. NEURAL_LINK: ACTIVE.' },
    { id: 'prj', label: 'OFF_MARKET', content: 'SCANNING_ASSETS... [PULSAR_V2], [CYBER_SHELL].' },
    { id: 'net', label: 'UPLINK', content: 'SECURE_CHANNEL: @VISITVITALIK_HUE' },
  ];

  useEffect(() => {
    const resizer = () => setIsMobile(window.innerWidth < window.innerHeight);
    window.addEventListener('resize', resizer);
    return () => window.removeEventListener('resize', resizer);
  }, []);

  useEffect(() => {
    let t: any;
    if (hold && loading < 100) {
      t = setInterval(() => setLoading(p => {
        if (p % 20 === 0 && hapticFeedback.impactOccurred.isAvailable()) hapticFeedback.impactOccurred('light');
        return p + 5 > 100 ? 100 : p + 5;
      }), 40);
    } else if (loading === 100) {
      setShow(true);
      if (hapticFeedback.notificationOccurred.isAvailable()) hapticFeedback.notificationOccurred('success');
    } else {
      setLoading(0);
    }
    return () => clearInterval(t);
  }, [hold, loading]);

  return (
    <div style={{ width: '100vw', height: '100dvh', background: '#050505', position: 'relative', overflow: 'hidden', display: