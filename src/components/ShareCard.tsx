import { forwardRef, useCallback } from 'react';
import type { Verdict } from '@/lib/verdict-types';
import { verdictMeta } from '@/lib/verdict-types';
import { toast } from 'sonner';

interface ShareCardProps {
  verdict: Verdict;
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(({ verdict }, ref) => {
  const meta = verdictMeta[verdict.type];

  const shareText = `${meta.emoji} ${verdict.type} — ${meta.label}\n\nAsshole Level: ${verdict.assholePercentage}%\n\n"${verdict.oneLiner}"\n\n— AI Judge ⚖️`;
  const appUrl = window.location.origin;

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(shareText);
    toast.success('Copied to clipboard!', { description: 'Share your verdict with the world 🌍' });
  }, [shareText]);

  const shareToTwitter = useCallback(() => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(appUrl)}`, '_blank');
  }, [shareText, appUrl]);

  const shareToFacebook = useCallback(() => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank');
  }, [shareText, appUrl]);

  const shareToReddit = useCallback(() => {
    window.open(`https://reddit.com/submit?title=${encodeURIComponent(`${meta.emoji} ${verdict.type} — "${verdict.oneLiner}"`)}&url=${encodeURIComponent(appUrl)}`, '_blank');
  }, [meta.emoji, verdict.type, verdict.oneLiner, appUrl]);

  const shareToWhatsApp = useCallback(() => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + appUrl)}`, '_blank');
  }, [shareText, appUrl]);

  const nativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Am I The Asshole? AI Judge', text: shareText, url: appUrl });
      } catch { /* user cancelled */ }
    }
  }, [shareText, appUrl]);

  const glowVar = {
    NTA: '--verdict-nta',
    YTA: '--verdict-yta',
    ESH: '--verdict-esh',
    NAH: '--verdict-nah',
  }[verdict.type];

  return (
    <div className="space-y-4">
      {/* Share preview card */}
      <div
        ref={ref}
        className="share-card-export rounded-2xl p-8 border border-border relative overflow-hidden"
        style={{
          boxShadow: `0 0 40px hsl(var(${glowVar}) / 0.05)`,
        }}
      >
        {/* Top gold line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, hsl(var(--gold) / 0.3), transparent)` }}
        />
        <div className="text-center space-y-4">
          <div className="ornament">
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Am I The Asshole? · AI Judge</span>
          </div>
          <div className="py-3">
            <span className="text-5xl">{meta.emoji}</span>
            <h3 className={`text-4xl font-display font-black ${meta.colorClass} mt-3`}>{verdict.type}</h3>
            <p className="text-sm text-muted-foreground font-display italic">{meta.label}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Asshole Level: <span className="font-mono font-bold gold-text">{verdict.assholePercentage}%</span>
          </p>
          <p className="font-display italic text-foreground text-lg px-4 leading-snug">
            "{verdict.oneLiner}"
          </p>
          <div className="ornament mt-4">
            <span className="text-xs text-muted-foreground">— AI Judge ⚖️</span>
          </div>
        </div>
      </div>

      {/* Share buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <button onClick={shareToTwitter} className="share-btn">𝕏 X / Twitter</button>
        <button onClick={shareToFacebook} className="share-btn">📘 Facebook</button>
        <button onClick={shareToReddit} className="share-btn">🤖 Reddit</button>
        <button onClick={shareToWhatsApp} className="share-btn">💬 WhatsApp</button>
        <button onClick={copyToClipboard} className="share-btn">📋 Copy Text</button>
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button onClick={nativeShare} className="share-btn">📤 More...</button>
        )}
      </div>
    </div>
  );
});

ShareCard.displayName = 'ShareCard';
export default ShareCard;
