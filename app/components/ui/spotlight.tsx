
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useSpring, useTransform, SpringOptions } from 'framer-motion';
import { cn } from '../../lib/utils';

type SpotlightProps = {
  className?: string;
  fill?: string;
  size?: number;
  springOptions?: SpringOptions;
};

export function Spotlight({
  className,
  fill = 'white',
  size = 200,
  springOptions = { bounce: 0 },
}: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [parentElement, setParentElement] = useState<HTMLElement | null>(null);
  
  const mouseX = useSpring(0, springOptions);
  const mouseY = useSpring(0, springOptions);
  
  const spotlightLeft = useTransform(mouseX, (x) => `${x - size / 2}px`);
  const spotlightTop = useTransform(mouseY, (y) => `${y - size / 2}px`);

  useEffect(() => {
    if (containerRef.current) {
      const parent = containerRef.current.parentElement;
      if (parent) {
        parent.style.position = 'relative';
        parent.style.overflow = 'hidden';
        setParentElement(parent);
      }
    }
  }, []);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!parentElement) return;
      const { left, top } = parentElement.getBoundingClientRect();
      mouseX.set(event.clientX - left);
      mouseY.set(event.clientY - top);
    },
    [mouseX, mouseY, parentElement]
  );

  useEffect(() => {
    if (!parentElement) return;
    
    const handleEnter = () => setIsHovered(true);
    const handleLeave = () => setIsHovered(false);
    
    parentElement.addEventListener('mousemove', handleMouseMove);
    parentElement.addEventListener('mouseenter', handleEnter);
    parentElement.addEventListener('mouseleave', handleLeave);
    
    return () => {
      parentElement.removeEventListener('mousemove', handleMouseMove);
      parentElement.removeEventListener('mouseenter', handleEnter);
      parentElement.removeEventListener('mouseleave', handleLeave);
    };
  }, [parentElement, handleMouseMove]);

  const getGradientColor = () => {
    switch (fill) {
      case 'orange':
        return 'rgba(251, 146, 60, 0.5)';
      case 'purple':
        return 'rgba(168, 85, 247, 0.5)';
      case 'blue':
        return 'rgba(59, 130, 246, 0.5)';
      case 'pink':
        return 'rgba(236, 72, 153, 0.5)';
      default:
        return 'rgba(255, 255, 255, 0.5)';
    }
  };

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        'pointer-events-none absolute rounded-full blur-3xl transition-opacity duration-300',
        isHovered ? 'opacity-100' : 'opacity-0',
        className
      )}
      style={{
        width: size,
        height: size,
        left: spotlightLeft,
        top: spotlightTop,
        background: `radial-gradient(circle at center, ${getGradientColor()}, transparent 70%)`
      }}
    />
  );
}