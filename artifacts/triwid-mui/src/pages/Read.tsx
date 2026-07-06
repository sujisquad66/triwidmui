import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useListStories, getListStoriesQueryKey, type StoryLanguage } from '@workspace/api-client-react';
import { useAppStore } from '@/lib/store';
import { Loader2, ExternalLink, Book } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  { code: 'id', label: 'Indonesia' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
] as const;

export function Read() {
  const { language, setLanguage } = useAppStore();
  const [selectedLang, setSelectedLang] = useState<StoryLanguage | null>(null);

  const { data, isLoading, isError } = useListStories(
    { lang: selectedLang as StoryLanguage },
    { query: { enabled: !!selectedLang, queryKey: getListStoriesQueryKey({ lang: selectedLang as StoryLanguage }) } }
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="flex flex-col min-h-screen"
    >
      <header className="mb-12">
        <h1 className="font-serif text-4xl md:text-5xl text-white mb-2 animate-flicker">Forbidden Stories</h1>
        <div className="w-16 h-0.5 bg-primary mt-4" />
      </header>

      <AnimatePresence mode="wait">
        {!selectedLang ? (
          <motion.div
            key="lang-select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <p className="font-mono text-sm text-muted-foreground mb-8 tracking-[0.2em] uppercase">
              Choose your tongue
            </p>
            <div className="flex flex-col gap-6">
              {LANGUAGES.map((lang, idx) => (
                <motion.button
                  key={lang.code}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.2, duration: 0.8 }}
                  onClick={() => {
                    setSelectedLang(lang.code as StoryLanguage);
                    setLanguage(lang.code as 'en'|'id'|'ja'); // sync global lang
                  }}
                  className="group relative px-8 py-4 bg-transparent border border-white/10 hover:border-primary/50 transition-colors"
                >
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors" />
                  <span className="relative font-serif text-2xl md:text-3xl text-white/70 group-hover:text-white transition-colors drop-shadow-[0_0_8px_rgba(255,255,255,0)] group-hover:drop-shadow-[0_0_8px_rgba(204,0,0,0.8)]">
                    {lang.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="story-list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1"
          >
            <button 
              onClick={() => setSelectedLang(null)}
              className="mb-8 font-mono text-xs text-muted-foreground hover:text-white flex items-center gap-2 transition-colors uppercase tracking-widest"
            >
              ← Change Language
            </button>

            {isLoading && (
              <div className="flex-1 flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            )}

            {isError && (
              <div className="flex flex-col items-center justify-center py-20 text-center border border-white/10 bg-white/[0.02]">
                <p className="font-serif text-xl text-white mb-2">The archive is corrupted.</p>
                <p className="font-mono text-sm text-muted-foreground">Unable to read these stories right now.</p>
              </div>
            )}

            {data && !data.available && (
              <div className="flex flex-col items-center justify-center py-20 text-center border border-white/10 bg-white/[0.02]">
                <Book className="w-12 h-12 text-muted-foreground/30 mb-6" strokeWidth={1} />
                <p className="font-serif text-xl md:text-2xl text-white/90 mb-4 animate-pulse">
                  The archive is silent in this tongue for now.
                </p>
                <p className="font-mono text-sm text-muted-foreground">
                  Perhaps return when the shadows grow longer.
                </p>
              </div>
            )}

            {data && data.available && data.stories.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                {data.stories.map((story, idx) => (
                  <motion.div
                    key={story.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.6 }}
                    className="group flex flex-col bg-white/[0.02] border border-white/10 overflow-hidden hover:border-primary/40 transition-colors"
                  >
                    <div className="aspect-[4/3] relative overflow-hidden bg-black border-b border-white/10">
                      <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-colors duration-700 z-10" />
                      <img 
                        src={story.coverImage} 
                        alt={story.title} 
                        className="w-full h-full object-cover filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                        loading="lazy"
                      />
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-4 font-mono text-[10px] text-primary/80 uppercase tracking-widest">
                        <span>{story.source}</span>
                        <span>•</span>
                        <span>{format(new Date(story.publishedAt), 'MMM dd, yyyy')}</span>
                      </div>
                      
                      <h2 className="font-serif text-2xl text-white/90 mb-4 group-hover:text-primary transition-colors">
                        {story.title}
                      </h2>
                      
                      <p className="font-sans text-sm text-muted-foreground/80 leading-relaxed mb-8 flex-1 line-clamp-4">
                        {story.excerpt}
                      </p>
                      
                      <a 
                        href={story.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 font-mono text-xs text-white uppercase tracking-widest border-b border-primary/30 pb-1 self-start hover:border-primary hover:text-primary transition-all group/btn"
                      >
                        <span>Read Entry</span>
                        <ExternalLink size={12} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
