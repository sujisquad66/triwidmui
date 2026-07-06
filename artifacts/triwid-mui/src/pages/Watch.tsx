import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useListVideos } from '@workspace/api-client-react';
import { ChevronLeft, ChevronRight, ExternalLink, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export function Watch() {
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const { data, isLoading, isError } = useListVideos({ page, pageSize });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="flex flex-col min-h-screen"
    >
      <header className="mb-12">
        <h1 className="font-serif text-4xl md:text-5xl text-white mb-2 animate-flicker">Visual Records</h1>
        <div className="w-16 h-0.5 bg-primary mt-4" />
      </header>

      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      )}

      {isError && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-white/10 bg-white/5">
          <p className="font-serif text-xl text-white mb-2">The signal is lost.</p>
          <p className="font-mono text-sm text-muted-foreground">Unable to retrieve video records at this time.</p>
        </div>
      )}

      {data && data.videos.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {data.videos.map((video, idx) => (
              <motion.a
                key={video.id}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="group relative flex flex-col bg-white/[0.02] border border-white/10 hover:border-primary/50 transition-all duration-300 overflow-hidden"
              >
                <div className="aspect-video relative overflow-hidden bg-black">
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500 z-10" />
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 filter grayscale group-hover:grayscale-0"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 p-1.5 backdrop-blur-sm text-white">
                    <ExternalLink size={14} />
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-sans font-semibold text-sm md:text-base text-white/90 group-hover:text-primary transition-colors line-clamp-2 mb-3">
                    {video.title}
                  </h3>
                  <div className="mt-auto flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                    <span>{format(new Date(video.publishedAt), 'MMM dd, yyyy')}</span>
                    <span className="text-primary/70">ARCHIVE RECORD</span>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-auto mb-16 font-mono text-sm">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 text-white disabled:text-muted-foreground disabled:opacity-50 hover:text-primary transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                  // Simplified pagination logic showing limited pages
                  let pageNum = page - 2 + i;
                  if (pageNum < 1) pageNum += Math.abs(page - 2) + 1;
                  if (pageNum > data.totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center border transition-all ${
                        page === pageNum 
                          ? 'border-primary text-primary bg-primary/10' 
                          : 'border-white/10 text-muted-foreground hover:border-white/30 hover:text-white'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="p-2 text-white disabled:text-muted-foreground disabled:opacity-50 hover:text-primary transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}

      {data && data.videos.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <p className="font-serif text-xl text-white mb-2">The archives are empty.</p>
          <p className="font-mono text-sm text-muted-foreground">No visual records found.</p>
        </div>
      )}
    </motion.div>
  );
}
