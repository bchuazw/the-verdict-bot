import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RedditLinkInputProps {
  onPaste: (url: string) => void;
  onSwitchToManual: () => void;
}

export default function RedditLinkInput({ onPaste, onSwitchToManual }: RedditLinkInputProps) {
  const [url, setUrl] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const validateUrl = (input: string) => {
    const redditPattern = /^https?:\/\/(www\.|old\.|new\.)?reddit\.com\/r\/\w+\/comments\//;
    setIsValid(input.length > 0 ? redditPattern.test(input) : null);
  };

  const handleChange = (val: string) => {
    setUrl(val);
    validateUrl(val);
  };

  const handleSubmit = () => {
    if (isValid) {
      onPaste(url);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">🔗</div>
        <input
          type="url"
          className="input-court pl-12 pr-4 py-5 text-base"
          placeholder="https://reddit.com/r/AmItheAsshole/comments/..."
          value={url}
          onChange={(e) => handleChange(e.target.value)}
        />
        {/* Validation indicator */}
        <AnimatePresence>
          {isValid !== null && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xl"
            >
              {isValid ? '✅' : '❌'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status text */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-muted-foreground font-mono">
          {isValid === null && 'Paste a Reddit AITA link'}
          {isValid === true && <span className="text-verdict-nta">✓ Valid Reddit link detected</span>}
          {isValid === false && <span className="text-verdict-yta">✗ Not a valid Reddit AITA link</span>}
        </span>
      </div>

      {/* Submit if valid */}
      {isValid && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          className="gavel-button w-full text-lg"
        >
          🔍 Fetch & Judge This Post
        </motion.button>
      )}

      {/* Switch to manual */}
      <button
        onClick={onSwitchToManual}
        className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors font-mono"
      >
        ✍️ Or type your own story instead
      </button>
    </div>
  );
}
