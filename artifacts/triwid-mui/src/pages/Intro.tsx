import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { useAppStore } from '@/lib/store';
import { GlitchText } from '@/components/effects/GlitchText';

export function Intro() {
  const [, setLocation] = useLocation();
  const { setHasSeenIntro } = useAppStore();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1500); // Show "Triwid mui"
    const t2 = setTimeout(() => setPhase(2), 3500); // Glitch intensely then hide
    const t3 = setTimeout(() => setPhase(3), 4000); // Show "Entering the archive"
    const t4 = setTimeout(() => {
      setHasSeenIntro(true);
      setLocation('/home');
    }, 6000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [setLocation, setHasSeenIntro]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background overflow-hidden">
      <AnimatePresence mode="wait">
        {phase === 1 && (
          <motion.div
            key="title"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <GlitchText 
              text="Triwid mui" 
              className="text-6xl md:text-8xl font-serif font-bold text-white tracking-widest" 
              active={true}
            />
          </motion.div>
        )}
        
        {phase === 3 && (
          <motion.div
            key="subtitle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 1 }}
            className="text-center"
          >
            <p className="font-mono text-sm md:text-base tracking-[0.3em] text-muted-foreground animate-pulse">
              entering the archive...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
