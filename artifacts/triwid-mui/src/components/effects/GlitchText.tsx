import React from 'react';
import { cn } from '@/lib/utils';

interface GlitchTextProps {
  text: string;
  className?: string;
  active?: boolean;
}

export function GlitchText({ text, className, active = true }: GlitchTextProps) {
  if (!active) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span 
      className={cn("glitch-text font-serif", className)} 
      data-text={text}
    >
      {text}
    </span>
  );
}
