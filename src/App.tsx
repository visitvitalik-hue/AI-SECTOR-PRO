// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [loading, setLoading] = useState(0);
  const [show, setShow] = useState(false);
  const [hold, setHold] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const holdSound = useRef(null);
  const accessSound = useRef(null);

  useEffect(() => {
    const checkSize = () => setIsMobile(window.innerWidth < window.innerHeight);
    checkSize();
    window.addEventListener('resize', checkSize);
    
    // Безопасная инициализация звуков
    try {
      holdSound.current = new Audio('/hold.mp3');
      holdSound.current.loop = true;
      accessSound.current = new Audio('/access.mp3');
    } catch (e) {
      console.log("Audio not supported or missing");
    }

    return () => window.removeEventListener('resize', checkSize);
  }, []);

  useEffect(() => {
    let t;
    if (hold && loading < 100) {
      if (holdSound.current) holdSound.current.play().catch(() => {});
      t = setInterval(() => setLoading(p => p + 2), 25);
    } else if (loading >= 100) {
      if (holdSound.current) {
        holdSound.current.pause();
        holdSound.current.currentTime = 0;
      }
      if (accessSound.current) accessSound.current.play().catch(() => {});
      setShow(true);
    } else {
      if (holdSound.current) {
        holdSound.current.pause();
        holdSound.current.currentTime = 0;
      }
      setLoading(0);
    }
    return () => clearInterval(t);
  }, [hold, loading]);

  return (
    <>
      <style>{`
        html, body, #root { 
          margin: 0; padding: 0; width: 100%; height: 100dvh; 
          background-color: #000 !important; overflow: hidden;
          font-family: 'Inter', -apple-system, sans-serif;
        }
      `}</style>

      <div style={{ 
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100dvh', 
        backgroundColor: '#000', display: 'flex', flexDirection: 'column' 
      }}>
        <AnimatePresence mode="wait">
          {!show ? (
            <motion.div 
              key="loader"
              exit={{ opacity: 0, scale: 1.2 }} 
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}
            >
              <motion.div 
                animate={hold ? { scale: 0.95 } : { scale: 1 }}
                onMouseDown={() => setHold(true)} onMouseUp={() => setHold(false)}
                onTouchStart={() => setHold(true)} onTouchEnd={() => setHold(false)}
                style={{ 
                  width: 140, height: 140, border: '1px solid #00f2ff', borderRadius: '50%', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  position: 'relative', cursor: 'pointer',
                  boxShadow: hold ? '0 0 50px #00f2ff' : '0 0 10px rgba(0,242,255,0.2)',
                  transition: 'box-shadow 0.3s'
                }}
              >
                <span style={{ color: '#00f2ff', fontWeight: '900', fontSize: '1.2rem' }}>{loading}%</span>
                <svg style={{ position: 'absolute', top: -2, left: -2, width: 144, height: 144, transform: 'rotate(-90deg)' }}>
                  <circle cx="72" cy="72" r="70" stroke="#00f2ff" strokeWidth="3" fill="none" strokeDasharray="440" strokeDashoffset={440 - (440 * loading) / 100} />
                </svg>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
              style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <motion.img 
                src="/sector88.jpg" 
                onError={(e) => { e.currentTarget.src = "/sector88.JPG" }}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                style={{ 
                  height: '100%', width: '100%', 
                  objectFit: isMobile ? 'cover' : 'contain', 
                  objectPosition: isMobile ? 'center 15%' : 'center center',
                  background: '#000'
                }} 
              />
              
              <div style={{ 
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
                background: 'linear-gradient(to top, rgba(0,0,0,1) 15%, transparent 100%)'
              }} />
              
              <div style={{ 
                position: 'absolute', bottom: '8dvh', left: '0', width: '100%',
                textAlign: 'center', padding: '0 20px', boxSizing: 'border-box'
              }}>
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  style={{ 
                    fontSize: 'clamp(2.5rem, 10vw, 7rem)', 
                    margin: 0, fontWeight: 900, color: '#fff',
                    letterSpacing: '-2px', textTransform: 'uppercase'
                  }}
                >
                  AI SECTOR
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ delay: 1 }}
                  style={{ 
                    margin: '5px 0 0', opacity: 0.5, letterSpacing: '6px', 
                    fontSize: '0.8rem', textTransform: 'uppercase', color: '#fff' 
                  }}
                >
                  System Active // 2026
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}