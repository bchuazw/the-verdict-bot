import confetti from 'canvas-confetti';
import type { VerdictType } from './verdict-types';

export function triggerVerdictEffect(type: VerdictType) {
  if (type === 'NTA') {
    // 🎉 Gold & green confetti burst
    const end = Date.now() + 2500;
    const colors = ['#22c55e', '#d4a843', '#ffffff', '#16a34a'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }
}

/** Creates rain drops as DOM elements, returns cleanup fn */
export function triggerRainEffect(): () => void {
  const container = document.createElement('div');
  Object.assign(container.style, {
    position: 'fixed',
    inset: '0',
    pointerEvents: 'none',
    zIndex: '50',
    overflow: 'hidden',
  });
  document.body.appendChild(container);

  const drops: HTMLDivElement[] = [];
  const COUNT = 60;

  for (let i = 0; i < COUNT; i++) {
    const drop = document.createElement('div');
    const x = Math.random() * 100;
    const delay = Math.random() * 2;
    const duration = 0.6 + Math.random() * 0.4;
    const opacity = 0.15 + Math.random() * 0.25;

    Object.assign(drop.style, {
      position: 'absolute',
      left: `${x}%`,
      top: '-20px',
      width: '2px',
      height: `${14 + Math.random() * 16}px`,
      background: `linear-gradient(to bottom, transparent, rgba(239,68,68,${opacity}))`,
      borderRadius: '2px',
      animation: `rain-fall ${duration}s ${delay}s linear infinite`,
    });

    drops.push(drop);
    container.appendChild(drop);
  }

  // Inject keyframes if not present
  if (!document.getElementById('rain-keyframes')) {
    const style = document.createElement('style');
    style.id = 'rain-keyframes';
    style.textContent = `
      @keyframes rain-fall {
        0% { transform: translateY(-20px); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateY(105vh); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  // Auto cleanup after 4s
  const timeout = setTimeout(() => {
    container.style.transition = 'opacity 1s';
    container.style.opacity = '0';
    setTimeout(() => container.remove(), 1000);
  }, 4000);

  return () => {
    clearTimeout(timeout);
    container.remove();
  };
}
