'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface LiquidButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const sizeClasses = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  xl: 'h-14 px-8 text-lg'
};

const variantClasses = {
  primary: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25',
  secondary: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 shadow-lg shadow-gray-500/25',
  outline: 'border-2 border-blue-500 text-blue-500 bg-transparent hover:bg-blue-50',
  ghost: 'text-gray-600 hover:bg-gray-100'
};

const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(
  ({ 
    children, 
    className, 
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon,
    iconPosition = 'left',
    disabled,
    onClick,
    type = 'button',
    ...props 
  }, ref) => {
    const [isPressed, setIsPressed] = React.useState(false);
    const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !isLoading) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const newRipple = {
          id: Date.now(),
          x,
          y
        };
        
        setRipples(prev => [...prev, newRipple]);
        
        // Remove ripple after animation
        setTimeout(() => {
          setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
        }, 600);
        
        onClick?.(e);
      }
    };

    const buttonVariants = {
      idle: { 
        scale: 1,
        y: 0,
        boxShadow: variant === 'primary' ? '0 4px 14px rgba(59, 130, 246, 0.25)' : '0 4px 14px rgba(0, 0, 0, 0.1)'
      },
      hover: { 
        scale: 1.02,
        y: -1,
        boxShadow: variant === 'primary' ? '0 8px 25px rgba(59, 130, 246, 0.35)' : '0 8px 25px rgba(0, 0, 0, 0.15)'
      },
      pressed: { 
        scale: 0.98,
        y: 0,
        boxShadow: variant === 'primary' ? '0 2px 8px rgba(59, 130, 246, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.2)'
      }
    };

    const contentVariants = {
      idle: { x: 0 },
      hover: { x: iconPosition === 'right' ? -2 : 2 },
      pressed: { x: 0 }
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center rounded-xl font-medium',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'transition-all duration-200 ease-out overflow-hidden',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        variants={buttonVariants}
        initial="idle"
        whileHover={!disabled && !isLoading ? "hover" : "idle"}
        animate={isPressed ? "pressed" : "idle"}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        onClick={handleClick}
        disabled={disabled || isLoading}
        type={type}
        transition={{
          type: "spring" as const,
          stiffness: 400,
          damping: 17
        }}
      >
        {/* Background gradient animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 hover:opacity-100 transition-opacity duration-300" />
        
        {/* Shine effect */}
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          <div className="absolute -inset-full opacity-0 hover:opacity-30 bg-gradient-to-r from-transparent via-white to-transparent skew-x-12 hover:animate-glass-shine transition-opacity duration-700" />
        </div>

        {/* Ripple effects */}
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            className="absolute bg-white/30 rounded-full pointer-events-none"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
            }}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}

        {/* Content */}
        <motion.div
          className="relative z-10 flex items-center space-x-2"
          variants={contentVariants}
        >
          {icon && iconPosition === 'left' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
          
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            <span>{children}</span>
          )}
          
          {icon && iconPosition === 'right' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
        </motion.div>
      </motion.button>
    );
  }
);

LiquidButton.displayName = 'LiquidButton';

export { LiquidButton };
