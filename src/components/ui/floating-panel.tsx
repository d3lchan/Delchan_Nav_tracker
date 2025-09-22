'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard } from './glass-card';

export interface FloatingPanelProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  className?: string;
  showCloseButton?: boolean;
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

const positionClasses = {
  center: 'items-center justify-center',
  top: 'items-start justify-center pt-20',
  bottom: 'items-end justify-center pb-20',
  left: 'items-center justify-start pl-20',
  right: 'items-center justify-end pr-20'
};

const panelVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30
    }
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30
    }
  }
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const FloatingPanel: React.FC<FloatingPanelProps> = ({
  children,
  isOpen,
  onClose,
  title,
  className,
  showCloseButton = true,
  position = 'center'
}) => {
  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when panel is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />

          {/* Panel container */}
          <div className={cn('absolute inset-0 flex', positionClasses[position])}>
            <motion.div
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className={cn('relative z-10', className)}
              onClick={(e) => e.stopPropagation()}
            >
              <GlassCard
                className="relative overflow-hidden"
                blur="xl"
                opacity={0.2}
                shadow="xl"
              >
                {/* Header */}
                {(title || showCloseButton) && (
                  <div className="flex items-center justify-between p-6 border-b border-white/10">
                    {title && (
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {title}
                      </h2>
                    )}
                    {showCloseButton && onClose && (
                      <motion.button
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        onClick={onClose}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <X size={20} className="text-gray-600 dark:text-gray-400" />
                      </motion.button>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  {children}
                </div>

                {/* Animated border */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
                     style={{ 
                       background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                       animation: 'float-shimmer 3s ease-in-out infinite'
                     }} 
                />
              </GlassCard>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export { FloatingPanel };
