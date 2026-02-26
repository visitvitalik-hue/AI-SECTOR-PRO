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

// --- WebGL: SyncGo Style Scene ---
const Scene = ({ isMobile }: { isMobile: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const texture = useLoader(THREE.TextureLoader, '/sector88.jpg');

  // Кастомный шейдер "Двусторонний туман"
  const shaderData = useMemo(() => ({
    uniforms: {
      uTexture: { value: texture },
      uTime: { value: 0 },
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
      uniform float uTime;
      void main() {
        vec4 tex = texture2D(uTexture, vUv);
        // Мягкое затухание по краям (SyncGo Fog)
        float edge = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x) *
                     smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.85, vUv.y);
        
        float pulse = sin(uTime * 1.2) * 0.05 + 0.95;
        gl_FragColor = vec4(tex.rgb * pulse, tex.a * edge);
      }
    `
  }), [texture]);

  useFrame((state) => {
    const { x, y } = state.mouse;
    shaderData.uniforms.uTime.value = state.clock.getElapsedTime();
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, x * 0.12, 0.05);
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -y * 0.12, 0.05);
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[isMobile ? 3.8 : 6.5, isMobile ? 6.5 : 3.8]} />
      <shaderMaterial args={[shaderData]} transparent depthWrite={false} />
    </mesh>
  );
};

// --- UI: Typing Effect ---
const Typewriter = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState('');
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
  }, [text]);
  return (
    <span>
      {displayedText}
      <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}>|</motion.span>
    </span>
  );
};

// --- Main Application ---
export default function App() {
  const [loading, setLoading] = useState(0);
  const [show, setShow] = useState(false);
  const [hold, setHold] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const menuItems: IMenuItem[] = [
    { id: 'sys', label: 'ACCESS_CORE', content: 'STABLE_CONNECTION: NEURAL_LINK_ESTABLISHED. LOGS: ENCRYPTED.' },
    { id: 'prj', label: 'OFF_MARKET_ASSETS', content: 'IDENTIFYING_HIGH_VALUE_OBJECTS... [QUANTUM_MASK_V2], [CYBER_GENESIS].' },
    { id: 'net', label: 'DIRECT_UPLINK', content: 'ESTABLISHING_SECURE_CHANNEL: @VISITVITALIK_HUE // STATUS: TERMINAL_READY.' },
  ];

  useEffect(() => {
    const checkSize = () => setIsMobile(window.innerWidth < window.innerHeight);
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  useEffect(() => {
    let t: ReturnType<typeof setInterval>;
    if (hold && loading < 100) {
      t = setInterval(() => {
        setLoading(p => {
          const next = p + 4;
          // Психологический триггер: вибрация на каждом шаге
          if (next % 20 === 0 && hapticFeedback.impactOccurred.isAvailable()) {
            hapticFeedback.impactOccurred('light');
          }
          return next > 100 ? 100 : next;
        });
      }, 30);
    } else if (loading >= 100) {
      setShow(true);
      if (hapticFeedback.notificationOccurred.isAvailable()) {
        hapticFeedback.notificationOccurred('success');
      }
    } else {
      setLoading(0);
    }
    return () => clearInterval(t);
  }, [hold, loading]);

  return (
    <>
      <style>{`
        html, body, #root { 
          margin: 0; padding: 0; width: 100%; height: 100dvh; 
          background: #050505; overflow: hidden;
          font-family: 'Inter', monospace; color: #fff;
        }
        .luxury-glass {
          background: rgba(5, 5, 5, 0.75);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid rgba(0, 242, 255, 0.1);
        }
      `}</style>

      <div style={{ position: 'fixed', width: '100vw', height: '100dvh', background: '#050505' }}>
        <AnimatePresence mode="wait">
          {!show ? (
            <motion.div key="loader" exit={{ opacity: 0, scale: 1.1 }} style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <motion.div 
                onPointerDown={() => setHold(true)} 
                onPointerUp={() => setHold(false)}
                animate={{ boxShadow: hold ? '0 0 50px #00f2ff' : '0 0 10px rgba(0,242,255,0.1)' }}
                style={{ 
                  width: 140, height: 140, border: '1px solid #00f2ff', borderRadius: '50%', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}
              >
                <span style={{ color: '#00f2ff', fontWeight: '900', fontSize: '1.2rem', letterSpacing: '2px' }}>{loading}%</span>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: '100%', height: '100%', position: 'relative' }}>
              
              <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
                <Suspense fallback={null}><Scene isMobile={isMobile} /></Suspense>
              </Canvas>

              {/* Меню (Adaptive) */}
              <div style={{ 
                position: 'absolute', top: isMobile ? 'auto' : '8dvh', bottom: isMobile ? '22dvh' : 'auto', 
                left: 0, width: '100%', display: 'flex', justifyContent: 'center', gap: isMobile ? '12px' : '30px', zIndex: 100
              }}>
                {menuItems.map((item) => (
                  <motion.button 
                    key={item.id} 
                    whileTap={{ scale: 0.95 }} 
                    onClick={() => {
                      setActiveTab(activeTab === item.id ? null : item.id);
                      if (hapticFeedback.impactOccurred.isAvailable()) hapticFeedback.impactOccurred('medium');
                    }}
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)', padding: '14px 20px',
                      borderRadius: '12px', color: activeTab === item.id ? '#00f2ff' : '#fff', 
                      fontSize: '0.6rem', fontWeight: '900', letterSpacing: '2px', cursor: 'pointer'
                    }}
                  >
                    {item.label}
                  </motion.button>
                ))}
              </div>

              {/* Terminal Glass Overlay */}
              <AnimatePresence>
                {activeTab && (
                  <motion.div 
                    initial={{ opacity: 0, backdropFilter: 'blur(0px)' }} 
                    animate={{ opacity: 1, backdropFilter: 'blur(40px)' }} 
                    exit={{ opacity: 0 }}
                    className="luxury-glass"
                    style={{ position: 'absolute', top: '30%', left: '50%', x: '-50%', width: '85%', maxWidth: '400px', padding: '30px', borderRadius: '24px', zIndex: 101 }}
                  >
                    <div style={{ color: '#00f2ff', fontSize: '0.5rem', marginBottom: '15px', opacity: 0.5, letterSpacing: '3px' }}>{`> DATA_STREAM_SECURE`}</div>
                    <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#fff', margin: 0 }}>
                      <Typewriter key={activeTab} text={menuItems.find(i => i.id === activeTab)?.content || ''} />
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Branding */}
              <div style={{ position: 'absolute', bottom: isMobile ? '5dvh' : '8dvh', width: '100%', textAlign: 'center', pointerEvents: 'none' }}>
                <h1 style={{ fontSize: 'clamp(2.5rem, 12vw, 8rem)', margin: 0, fontWeight: 900, letterSpacing: '-2px', opacity: activeTab ? 0.1 : 1, transition: '0.5s' }}>AI SECTOR</h1>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}