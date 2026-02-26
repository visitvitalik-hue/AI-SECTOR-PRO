import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { hapticFeedback } from '@telegram-apps/sdk';

// --- NLP КОНТЕНТ: СТРАТЕГИЯ ЗАХВАТА ВНИМАНИЯ ---
const MESSAGES = [
  { id: 1, side: 'bot', text: "Система активна. Вижу, вы ищете способ выделить свой продукт среди шаблонных решений?" },
  { id: 2, side: 'user', text: "Да, рынок перенасыщен. Как ваша технология меняет правила игры?" },
  { id: 3, side: 'bot', text: "Мы внедряем иммерсивный WebGL и нейролингвистические триггеры. Это не просто дизайн, это цифровая архитектура доверия." },
  { id: 4, side: 'user', text: "Звучит масштабно. На какой ROI может рассчитывать мой бизнес?" },
  { id: 5, side: 'bot', text: "В сегменте Luxury мы создаем дефицит и статус. Наши клиенты получают рост вовлеченности на 60% и кратное увеличение LTV." },
  { id: 6, side: 'user', text: "Я готов к трансформации. Какие следующие шаги?" }
];

// --- 3D BACKGROUND: LUXURY AMBIENT ---
const BackgroundScene = ({ isMobile }: { isMobile: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const texture = useLoader(THREE.TextureLoader, '/sector88.jpg');
  
  useFrame((state) => {
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, state.mouse.x * 0.1, 0.05);
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -state.mouse.y * 0.1, 0.05);
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[isMobile ? 3.5 : 7, isMobile ? 6 : 4]} />
      <meshBasicMaterial map={texture} transparent opacity={0.35} color="#222" />
    </mesh>
  );
};

// --- MAIN ENGINE ---
export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < window.innerHeight);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  useEffect(() => {
    const resizer = () => setIsMobile(window.innerWidth < window.innerHeight);
    window.addEventListener('resize', resizer);
    return () => window.removeEventListener('resize', resizer);
  }, []);

  // Haptic Feedback при появлении новых сообщений
  useEffect(() => {
    return scrollYProgress.onChange((v) => {
      const step = 1 / MESSAGES.length;
      if (v > 0 && Math.floor(v / step) > Math.floor((v - 0.005) / step)) {
        if (hapticFeedback.impactOccurred.isAvailable()) hapticFeedback.impactOccurred('light');
      }
    });
  }, [scrollYProgress]);

  return (
    <div ref={containerRef} style={{ background: '#050505', color: '#fff', minHeight: '500vh', position: 'relative', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      
      {/* 3D Слой — Фиксирован на фоне */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        <Canvas camera={{ position: [0, 0, 5] }} dpr={[1, 2]}>
          <Suspense fallback={null}><BackgroundScene isMobile={isMobile} /></Suspense>
        </Canvas>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, transparent 10%, #050505 100%)', opacity: 0.9 }} />
      </div>

      {/* Экран 1: Вход в систему */}
      <section style={{ height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
        <motion.div style={{ opacity: useTransform(scrollYProgress, [0, 0.05], [1, 0]), textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(2.5rem, 12vw, 6rem)', fontWeight: 900, color: '#00f2ff', margin: 0 }}>AI SECTOR</h1>
          <p style={{ opacity: 0.4, letterSpacing: '8px', fontSize: '0.6rem' }}>SCROLL_TO_INITIALIZE</p>
        </motion.div>
      </section>

      {/* Интерактивный чат */}
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: '420px', zIndex: 10, pointerEvents: 'none' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {MESSAGES.map((msg, index) => {
            const step = 0.85 / MESSAGES.length;
            const start = step * index + 0.05;
            const end = start + step;
            
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const opacity = useTransform(scrollYProgress, [start, start + 0.03, end - 0.03, end], [0, 1, 1, 0]);
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const y = useTransform(scrollYProgress, [start, start + 0.03], [30, 0]);

            return (
              <motion.div
                key={msg.id}
                style={{
                  opacity, y,
                  alignSelf: msg.side === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.side === 'user' ? 'rgba(255,255,255,0.04)' : 'rgba(0,242,255,0.08)',
                  border: `1px solid ${msg.side === 'user' ? 'rgba(255,255,255,0.1)' : 'rgba(0,242,255,0.2)'}`,
                  padding: '16px 22px',
                  borderRadius: msg.side === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  maxWidth: '85%',
                  backdropFilter: 'blur(20px)',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  pointerEvents: 'all'
                }}
              >
                {msg.text}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Финальный экран: CTA */}
      <section style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 20 }}>
        <motion.button
          style={{
            opacity: useTransform(scrollYProgress, [0.92, 0.98], [0, 1]),
            scale: useTransform(scrollYProgress, [0.92, 0.98], [0.8, 1]),
            background: '#00f2ff',
            color: '#050505',
            border: 'none',
            padding: '22px 45px',
            borderRadius: '16px',
            fontWeight: 900,
            fontSize: '1.1rem',
            letterSpacing: '2px',
            cursor: 'pointer',
            boxShadow: '0 0 50px rgba(0,242,255,0.5)',
            touchAction: 'manipulation'
          }}
          onPointerDown={() => {
            if (hapticFeedback.notificationOccurred.isAvailable()) hapticFeedback.notificationOccurred('success');
            window.open('https://t.me/your_link', '_blank');
          }}
        >
          ИНИЦИИРОВАТЬ СВЯЗЬ
        </motion.button>
      </section>

      {/* Заглушка для скролла */}
      <div style={{ height: '20dvh' }} />
    </div>
  );
}