import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Verdict } from '@/lib/verdict-types';
import { verdictMeta } from '@/lib/verdict-types';
import { toast } from 'sonner';

interface TwitterVideoButtonProps {
  verdict: Verdict;
}

export default function TwitterVideoButton({ verdict }: TwitterVideoButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const meta = verdictMeta[verdict.type];

  const handleGenerate = () => {
    setIsGenerating(true);
    setProgress(0);

    // Simulate video generation progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          setIsDone(true);
          toast.success('Video ready! 🎬', { description: 'Your viral verdict video is ready to post' });
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 300);
  };

  const handlePostToTwitter = () => {
    const tweetText = `${meta.emoji} VERDICT: ${verdict.type} — ${meta.label}\n\n"${verdict.oneLiner}"\n\nAsshole Level: ${verdict.assholePercentage}% 💀\n\n#AmITheAsshole #AITA #AIJudge`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
  };

  return (
    <div className="space-y-3">
      <AnimatePresence mode="wait">
        {!isGenerating && !isDone && (
          <motion.button
            key="generate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleGenerate}
            className="w-full rounded-xl border-2 border-dashed px-6 py-4 text-base font-display font-bold transition-all duration-300 relative overflow-hidden group"
            style={{
              borderColor: 'hsl(var(--gold) / 0.3)',
              background: 'linear-gradient(135deg, hsl(var(--gold) / 0.05), hsl(var(--secondary)))',
            }}
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-2xl"
              >
                🎬
              </motion.span>
              <span className="gold-text">Generate Viral Video & Post to 𝕏</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </motion.button>
        )}

        {isGenerating && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="verdict-card p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-display font-bold gold-text">
                🎬 Rendering your viral moment...
              </span>
              <span className="font-mono text-sm text-muted-foreground">
                {Math.min(100, Math.round(progress))}%
              </span>
            </div>
            <div className="meter-track">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-gold-dim to-gold"
                style={{ width: `${Math.min(100, progress)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {progress < 30 && '📐 Composing dramatic intro...'}
                {progress >= 30 && progress < 60 && '🎭 Adding agent reactions...'}
                {progress >= 60 && progress < 85 && '🔥 Sprinkling meme effects...'}
                {progress >= 85 && '✨ Final polish...'}
              </motion.span>
            </div>
          </motion.div>
        )}

        {isDone && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-3"
          >
            {/* Video preview mockup */}
            <div
              className="verdict-card p-4 relative overflow-hidden"
              style={{
                aspectRatio: '16/9',
                background: `linear-gradient(135deg, hsl(var(--background)), hsl(var(--card)))`,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-6xl mb-2"
                  >
                    {meta.emoji}
                  </motion.div>
                  <p className={`text-3xl font-display font-black ${meta.colorClass}`}>
                    {verdict.type}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    Video preview
                  </p>
                </div>
              </div>
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="w-16 h-16 rounded-full bg-background/80 flex items-center justify-center text-2xl"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ▶️
                </motion.div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handlePostToTwitter}
              className="gavel-button w-full text-base flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #1a1a2e, #0f0f1a)',
                boxShadow: '0 4px 20px hsl(var(--gold) / 0.2)',
              }}
            >
              <span className="text-xl">𝕏</span>
              <span>Post to Twitter / X</span>
              <span className="text-lg">🚀</span>
            </motion.button>

            <button
              onClick={() => { setIsDone(false); setProgress(0); }}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
            >
              🔄 Regenerate video
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
