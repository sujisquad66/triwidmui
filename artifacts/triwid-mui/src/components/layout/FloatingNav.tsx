import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { useAppStore } from '@/lib/store';
import { Volume2, VolumeX, Home, BookOpen, Film } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function FloatingNav() {
  const [location] = useLocation();
  const { language, setLanguage, audioEnabled, setAudioEnabled } = useAppStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Hidden audio element for ambient sound
  useEffect(() => {
    // In a real app, this would be a real ambient track URL.
    // For now we just create a valid empty Audio object to prevent errors.
    audioRef.current = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.2;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (audioEnabled) {
        audioRef.current.play().catch(e => {
          console.error("Audio play failed:", e);
          setAudioEnabled(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [audioEnabled, setAudioEnabled]);

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Read', path: '/read', icon: BookOpen },
    { name: 'Watch', path: '/watch', icon: Film },
  ];

  const langs = ['en', 'id', 'ja'] as const;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 1 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 px-6 py-3 bg-black/80 backdrop-blur-md border border-white/10"
    >
      <div className="flex items-center gap-4">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <span className={cn(
                "cursor-pointer flex items-center justify-center p-2 transition-all duration-300",
                isActive ? "text-primary scale-110 drop-shadow-[0_0_8px_rgba(204,0,0,0.8)]" : "text-muted-foreground hover:text-white"
              )} title={item.name}>
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              </span>
            </Link>
          );
        })}
      </div>

      <div className="w-px h-6 bg-white/10" />

      <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-mono text-muted-foreground">
        {langs.map((l) => (
          <button
            key={l}
            onClick={() => setLanguage(l)}
            className={cn(
              "transition-colors duration-300",
              language === l ? "text-white" : "hover:text-white"
            )}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-white/10" />

      <button
        onClick={() => setAudioEnabled(!audioEnabled)}
        className={cn(
          "p-2 transition-all duration-300",
          audioEnabled ? "text-primary drop-shadow-[0_0_8px_rgba(204,0,0,0.8)]" : "text-muted-foreground hover:text-white"
        )}
        title={audioEnabled ? "Mute Ambient Audio" : "Play Ambient Audio"}
      >
        {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>
    </motion.div>
  );
}
