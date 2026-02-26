// @ts-nocheck
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [loading, setLoading] = useState(0);
  const [show, setShow] = useState(false);
  const [hold, setHold] = useState(false);

  useEffect(() => {
    let t;
    if (hold && loading < 100) {
      t = setInterval(() => setLoading(p => p + 2), 25);
    } else if (loading >= 100) {
      setShow(true);
    } else {
      setLoading(0);
    }
    return () => clearInterval(t);
  }, [hold, loading]);

  return (
    <>
      {/* 1. Глобальный фикс фона и вьюпорта */}
      <style>{`
        :root { --tg-viewport-height: 100dvh; }
        html, body, #root { 
          margin: 0; padding: 0; width: 100%; height: 100dvh; 
          background-color: #000 !important; overflow: hidden;
          font-family: 'Inter', sans-serif;
        }
      `}</style>

      <div style={{ 
        position: 'fixed', top: 0, left: 0, 
        width: '100vw', height: '100dvh', 
        display: 'flex', flexDirection: 'column',
        backgroundColor: '#000'
      }}>
        <AnimatePresence mode="wait">
          {!show ? (
            <motion.div 
              key="loader"
              exit={{ opacity: 0, scale: 1.1 }} 
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <div 
                onMouseDown={() => setHold(true)} onMouseUp={() => setHold(false)}
                onTouchStart={() => setHold(true)} onTouchEnd={() => setHold(false)}
                style={{ 
                  width: 140, height: 140, border: '1px solid #00f2ff', borderRadius: '50%', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  position: 'relative', cursor: 'pointer',
                  boxShadow: hold ? '0 0 50px #00f2ff' : '0 0 10px rgba(0,242,255,0.2)',
                  transition: 'all 0.3s'
                }}
              >
                <span style={{ color: '#00f2ff', fontWeight: '900', fontSize: '1.2rem' }}>{loading}%</span>
                <svg style={{ position: 'absolute', top: -2, left: -2, width: 144, height: 144, transform: 'rotate(-90deg)' }}>
                  <circle cx="72" cy="72" r="70" stroke="#00f2ff" strokeWidth="3" fill="none" strokeDasharray="440" strokeDashoffset={440 - (440 * loading) / 100} />
                </svg>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
              style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', justifyContent: 'center' }}
            >
              {/* 2. Аватар с твоим "Luxury" эффектом */}
              <img 
                src="/sector88.jpg" 
                onError={(e) => { e.currentTarget.src = "/sector88.JPG" }}
                style={{ 
                  height: '100%', width: '100%', objectFit: 'cover',
                  objectPosition: 'center 15%',
                  maskImage: 'linear-gradient(to top, black 90%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to top, black 90%, transparent 100%)'
                }} 
              />
              
              {/* 3. Текстовый блок с адаптивным clamp */}
              <div style={{ 
                position: 'absolute', bottom: '10dvh', left: '0', width: '100%',
                textAlign: 'center', padding: '0 20px', boxSizing: 'border-box',
                background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)'
              }}>
                <h1 style={{ 
                  fontSize: 'clamp(2.8rem, 14vw, 8rem)', 
                  margin: 0, fontWeight: 900, color: '#fff',
                  letterSpacing: '-2px', textTransform: 'uppercase'
                }}>
                  AI SECTOR
                </h1>
                <p style={{ 
                  margin: '5px 0 0', opacity: 0.5, letterSpacing: '6px', 
                  fontSize: '0.8rem', textTransform: 'uppercase', color: '#fff' 
                }}>
                  Established 2026
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}