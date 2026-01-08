import React from 'react';

interface ChatLoadingAnimationProps {
  /** Primary color for the dots animation (defaults to Polaris blue) */
  primaryColor?: string;
  /** Accessible label for screen readers */
  ariaLabel?: string;
  /** Size of the dots in pixels */
  dotSize?: number;
  /** Gap between dots in pixels */
  gap?: number;
}

/**
 * ChatLoadingAnimation - A modern 3-dot bouncing animation for chatbot loading states
 *
 * Features:
 * - Smooth, professional bouncing animation
 * - Customizable primary color
 * - Fully accessible with aria-label
 * - Responsive and lightweight
 * - Works on mobile and desktop
 */
export function ChatLoadingAnimation({
  primaryColor = '#006fbb',
  ariaLabel = 'Loading response',
  dotSize = 8,
  gap = 8,
}: ChatLoadingAnimationProps) {
  return (
    <div
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${gap}px`,
        padding: '4px',
      }}
    >
      <style>{`
        @keyframes chatDotBounce {
          0%, 60%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.7;
          }
          30% {
            transform: translateY(-12px) scale(1.2);
            opacity: 1;
          }
        }

        .chat-loading-dot {
          width: ${dotSize}px;
          height: ${dotSize}px;
          border-radius: 50%;
          background-color: ${primaryColor};
          animation: chatDotBounce 1.4s ease-in-out infinite;
        }

        .chat-loading-dot:nth-child(1) {
          animation-delay: 0s;
        }

        .chat-loading-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .chat-loading-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @media (prefers-reduced-motion: reduce) {
          .chat-loading-dot {
            animation: none;
            opacity: 0.7;
          }
        }
      `}</style>
      <div className="chat-loading-dot" />
      <div className="chat-loading-dot" />
      <div className="chat-loading-dot" />
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
}

// CSS for screen reader only text (if not already defined in your CSS)
const srOnlyStyles = `
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`;
