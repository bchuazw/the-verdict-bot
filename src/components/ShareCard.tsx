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

  return (
    <div className="space-y-4">
      {/* Preview card */}
      <div ref={ref} className="share-card-export rounded-xl p-6 border border-border">
        <div className="text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Am I The Asshole? · AI Judge</p>
          <div className="py-2">
            <span className="text-4xl">{meta.emoji}</span>
            <h3 className={`text-3xl font-display font-black ${meta.colorClass} mt-2`}>{verdict.type}</h3>
            <p className="text-sm text-muted-foreground">{meta.label}</p>
          </div>
          <p className="text-xs text-muted-foreground">Asshole Level: <span className="font-mono font-bold gold-text">{verdict.assholePercentage}%</span></p>
          <p className="font-display italic text-foreground text-base px-4">"{verdict.oneLiner}"</p>
          <p className="text-xs text-muted-foreground mt-3">— AI Judge ⚖️</p>
        </div>
      </div>

      {/* Share buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <button onClick={shareToTwitter} className="rounded-lg border border-border bg-secondary px-4 py-3 text-sm font-medium text-secondary-foreground hover:bg-muted transition-colors">
          𝕏 X / Twitter
        </button>
        <button onClick={shareToFacebook} className="rounded-lg border border-border bg-secondary px-4 py-3 text-sm font-medium text-secondary-foreground hover:bg-muted transition-colors">
          📘 Facebook
        </button>
        <button onClick={shareToReddit} className="rounded-lg border border-border bg-secondary px-4 py-3 text-sm font-medium text-secondary-foreground hover:bg-muted transition-colors">
          🤖 Reddit
        </button>
        <button onClick={shareToWhatsApp} className="rounded-lg border border-border bg-secondary px-4 py-3 text-sm font-medium text-secondary-foreground hover:bg-muted transition-colors">
          💬 WhatsApp
        </button>
        <button onClick={copyToClipboard} className="rounded-lg border border-border bg-secondary px-4 py-3 text-sm font-medium text-secondary-foreground hover:bg-muted transition-colors">
          📋 Copy Text
        </button>
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button onClick={nativeShare} className="rounded-lg border border-border bg-secondary px-4 py-3 text-sm font-medium text-secondary-foreground hover:bg-muted transition-colors">
            📤 More...
          </button>
        )}
      </div>
    </div>
  );
});

ShareCard.displayName = 'ShareCard';
export default ShareCard;
