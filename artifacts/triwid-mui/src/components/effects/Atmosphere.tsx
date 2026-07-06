import React from 'react';

export function Atmosphere() {
  return (
    <>
      <div className="vignette-overlay" />
      <div className="grain-overlay" />
      {/* Fog effect (css based) */}
      <div 
        className="pointer-events-none fixed inset-0 z-30 opacity-20 mix-blend-screen"
        style={{
          backgroundImage: 'radial-gradient(ellipse at center, rgba(138, 3, 3, 0.15) 0%, transparent 70%)',
          animation: 'pulse 10s infinite alternate'
        }}
      />
    </>
  );
}
