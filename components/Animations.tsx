import { motion, Variants } from 'framer-motion';
import React from 'react';

// Container Stagger
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Item Fade Up
export const itemFadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } },
};

// Item Scale In
export const itemScale: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } },
};

// Slide In From Right
export const slideInRight: Variants = {
  hidden: { x: 50, opacity: 0 },
  show: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 50 } },
};

// Pulse Animation for Alerts
export const pulseAnimation = {
  scale: [1, 1.05, 1],
  opacity: [1, 0.8, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

// Reusable Components
export const AnimatedPage = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    variants={containerVariants}
    initial="hidden"
    animate="show"
    exit={{ opacity: 0, y: -20 }}
    className="w-full h-full"
  >
    {children}
  </motion.div>
);

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  onClick?: () => void;
}

export const AnimatedCard = ({ children, className = "", delay = 0, onClick }: AnimatedCardProps) => (
  <motion.div
    variants={itemFadeUp}
    className={className}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    onClick={onClick}
  >
    {children}
  </motion.div>
);

export const Counter = ({ from, to }: { from: number; to: number }) => {
  const nodeRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const controls = {
      value: from,
      stop: false
    };

    const duration = 1500; // ms
    const start = performance.now();

    const animate = (time: number) => {
      if (controls.stop) return;
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      
      // EaseOutQuart
      const ease = 1 - Math.pow(1 - progress, 4);
      
      const current = Math.floor(from + (to - from) * ease);
      node.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);

    return () => { controls.stop = true; };
  }, [from, to]);

  return <span ref={nodeRef}>{from}</span>;
};