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

// --- WebGL Core ---
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
      <planeGeometry args={[isMobile ? 3.5 : 6.5, isMobile ? 6 : 3.5]} />
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
    <div style={{ width: '100vw', height: '100dvh', background: '#050505', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <AnimatePresence mode="wait">
        {!show ? (
          <motion.div key="loader" exit={{ opacity: 0 }} style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div 
              onPointerDown={(e) => { e.preventDefault(); setHold(true); }}
              onPointerUp={() => setHold(false)}
              onPointerLeave={() => setHold(false)}
              style={{ width: 120, height: 120, border: '1px solid #00f2ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#00f2ff', fontWeight: 900, touchAction: 'none', userSelect: 'none' }}
            >
              {loading}%
            </div>
          </motion.div>
        ) : (
          <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: '100%', height: '100%', position: 'relative' }}>
            
            {/* Background Layer */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
              <Canvas camera={{ position: [0, 0, 5] }} dpr={[1, 2]}>
                <Suspense fallback={null}><Scene isMobile={isMobile} /></Suspense>
              </Canvas>
            </div>

            {/* UI Layer - Fixed Hierarchy */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 'env(safe-area-inset-top) 20px max(40px, env(safe-area-inset-bottom)) 20px', boxSizing: 'border-box' }}>
              
              {/* TOP: Branding */}
              <div style={{ textAlign: 'center', paddingTop: '20px', opacity: activeTab ? 0.2 : 1, transition: '0.4s' }}>
                <h1 style={{ fontSize: 'clamp(1.8rem, 8vw, 3rem)', margin: 0, fontWeight: 900, color: '#00f2ff' }}>AI SECTOR</h1>
                <p style={{ fontSize: '0.5rem', opacity: 0.3, letterSpacing: '4px' }}>TERMINAL_ACTIVE</p>
              </div>

              {/* CENTER: Terminal Display */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
                <AnimatePresence>
                  {activeTab && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                      style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(0,242,255,0.4)', width: '100%', maxWidth: '340px' }}>
                      <p style={{ fontSize: '0.8rem', lineHeight: '1.6', margin: 0 }}><Typewriter key={activeTab} text={menuItems.find(i => i.id === activeTab)?.content || ''} /></p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* BOTTOM: Buttons (Safe Zone) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', alignItems: 'center', paddingBottom: '20px' }}>
                {menuItems.map(item => (
                  <button 
                    key