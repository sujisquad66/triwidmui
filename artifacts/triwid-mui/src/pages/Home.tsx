import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';

export function Home() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="mb-16 text-center"
      >
        <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-wider text-white opacity-90 animate-flicker">
          Triwid mui
        </h1>
        <p className="mt-4 font-mono text-xs md:text-sm tracking-[0.2em] text-muted-foreground">
          THE HORROR ARCHIVE
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 w-full max-w-4xl">
        <Link href="/read">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="group cursor-pointer flex flex-col items-center text-center p-8 hover-glow-box border border-white/5 bg-white/[0.02] backdrop-blur-sm transition-all duration-500"
          >
            <h2 className="font-serif text-4xl md:text-5xl mb-4 text-white group-hover:text-primary transition-colors duration-300">
              Read
            </h2>
            <p className="font-mono text-sm text-muted-foreground group-hover:text-white/80 transition-colors duration-300">
              Forbidden stories
            </p>
          </motion.div>
        </Link>

        <Link href="/watch">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="group cursor-pointer flex flex-col items-center text-center p-8 hover-glow-box border border-white/5 bg-white/[0.02] backdrop-blur-sm transition-all duration-500"
          >
            <h2 className="font-serif text-4xl md:text-5xl mb-4 text-white group-hover:text-primary transition-colors duration-300">
              Watch
            </h2>
            <p className="font-mono text-sm text-muted-foreground group-hover:text-white/80 transition-colors duration-300">
              Visual records
            </p>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}
