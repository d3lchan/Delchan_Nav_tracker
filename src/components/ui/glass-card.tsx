'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  opacity?: number;
  border?: boolean;
  shadow?: 'sm' | 'md' | 'lg' | 'xl';
}

const blurClasses = {
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
  lg: 'backdrop-blur-lg',
  xl: 'backdrop-blur-xl'
};

const shadowClasses = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl'
};

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ 
    children, 
    className, 
    blur = 'md', 
    opacity = 0.1, 
    border = true, 
    shadow = 'lg',
    style,
    ...props 
  }, ref) => {
    const customStyle = {
      backgroundColor: `rgba(255, 255, 255, ${opacity})`,
      ...style
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl',
          blurClasses[blur],
          shadowClasses[shadow],
          border && 'border border-white/20',
          'transition-all duration-300 ease-out',
          className
        )}
        style={customStyle}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export { GlassCard };
