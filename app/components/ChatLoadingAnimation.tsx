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
 */
export function ChatLoadingAnimation({
  primaryColor = '#006fbb',
  ariaLabel = 'Loading response',
  dotSize = 10,
  gap = 8,
}: ChatLoadingAnimationProps) {
  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${gap}px`,
    padding: '4px',
  };

  const dotStyle: React.CSSProperties = {
    width: `${dotSize}px`,
    height: `${dotSize}px`,
    borderRadius: '50%',
    backgroundColor: primaryColor,
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
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
      `}} />
      <div
        role="status"
        aria-label={ariaLabel}
        aria-live="polite"
        style={containerStyle}
      >
        <div className="chat-loading-dot" style={dotStyle} />
        <div className="chat-loading-dot" style={dotStyle} />
        <div className="chat-loading-dot" style={dotStyle} />
      </div>
    </>
  );
}
