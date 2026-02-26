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
      t = setInterval(() => setLoading(p => p + 2), 30);
    } else if (loading >= 100) {
      setShow(true);
    } else {
      setLoading(0);
    }
    return () => clearInterval(t);
  }, [hold, loading]);

  return (
    <div style={{ height: '100vh', background: '#000', color: '#00f2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'fixed', width: '100%' }}>
      <AnimatePresence>
        {!show ? (
          <motion.div exit={{ opacity: 0, scale: 1.2 }} style={{ textAlign: 'center' }}>
            <div 
              onMouseDown={() => setHold(true)} onMouseUp={() => setHold(false)}
              onTouchStart={() => setHold(true)} onTouchEnd={() => setHold(false)}
              style={{ width: 120, height: 120, border: '1px solid #00f2ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
            >
              <span style={{ fontSize: 10 }}>{loading}%</span>
              <svg style={{ position: 'absolute', top: -2, left: -2, width: 124, height: 124, transform: 'rotate(-90deg)' }}>
                <circle cx="62" cy="62" r="60" stroke="#00f2ff" strokeWidth="2" fill="none" strokeDasharray="377" strokeDashoffset={377 - (377 * loading) / 100} />
              </svg>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: '100%', height: '100%' }}>
            <img 
  src="/sector88.jpg" 
  onError={(e) => { e.currentTarget.src = "/sector88.JPG" }} 
  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
/>
            <div style={{ position: 'absolute', bottom: '10%', left: '8%' }}>
              <h1 style={{ fontSize: 42, margin: 0, textShadow: '0 0 20px #00f2ff' }}>AI SECTOR</h1>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}