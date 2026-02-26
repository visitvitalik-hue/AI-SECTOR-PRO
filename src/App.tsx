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
      uniform float uTime;
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
    shaderData.uniforms.uTime.value = state.clock.getElapsedTime();
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, x * 0.1, 0.05);
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -y * 0.1, 0.05);
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[isMobile ? 3.5 : 6.5, isMobile ? 6.5 : 3.5]} />
      <shaderMaterial args={[shaderData]} transparent depthWrite={false} />
    </mesh>
  );
};

const Typewriter = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState('');
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, 20);
    return () => clearInterval(timer);
  }, [text]);
  return <span>{displayedText}<motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity }}>|</motion.span></span>;
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
    <div style={{ width: '100vw', height: '100dvh', background: '#050505', position: 'relative', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        {!show ? (
          <motion.div key="loader" exit={{ opacity: 0 }} style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div 
              onPointerDown={(e) => { e.preventDefault(); setHold(true); }} 
              onPointerUp={() => setHold(false)}
              onPointerLeave={() => setHold(false)}
              style={{ 
                width: 130, height: 130, border: '1px solid #00f2ff', borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', 
                color: '#00f2ff', fontWeight: 900, fontSize: '1.2rem',
                touchAction: 'none', userSelect: 'none', WebkitTapHighlightColor: 'transparent' 
              }}
            >
              {loading}%
            </div>
          </motion.div>
        ) : (
          <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: '100%', height: '100%' }}>
            
            <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
              <Canvas camera={{ position: [0, 0, 5] }} dpr={[1, 2]}>
                <Suspense fallback={null}><Scene isMobile={isMobile} /></Suspense>
              </Canvas>
            </div>

            <div style={{ 
              position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none', 
              display: 'flex', flexDirection: 'column', padding: 'min(40px, 5dvh) 20px' 
            }}>
              
              <div style={{ textAlign: 'center', opacity: activeTab ? 0.15 : 1, transition: '0.4s' }}>
                <h1 style={{ fontSize: 'clamp(2.5rem, 12vw, 7rem)', margin: 0, fontWeight: 900 }}>AI SECTOR</h1>
                <p style={{ fontSize: '0.6rem', opacity: 0.3, letterSpacing: '8px' }}>CORE_INIT_2026</p>
              </div>

              <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AnimatePresence>
                  {activeTab && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      style={{ background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(30px)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(0,242,255,0.15)', width: '100%', maxWidth: '380px', pointerEvents: 'all' }}>
                      <p style={{ fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}><Typewriter key={activeTab} text={menuItems.find(i => i.id === activeTab)?.content || ''} /></p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div style={{ display: 'flex', flexDirection