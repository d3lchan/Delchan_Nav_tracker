'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard } from './glass-card';
import type { User as UserType } from '@/types';

export interface UserSelectionButtonProps {
  user: UserType;
  onClick: (user: UserType) => void;
  className?: string;
  disabled?: boolean;
}

const UserSelectionButton: React.FC<UserSelectionButtonProps> = ({
  user,
  onClick,
  className,
  disabled = false
}) => {
  const [isPressed, setIsPressed] = React.useState(false);

  const handleClick = () => {
    if (!disabled) {
      onClick(user);
    }
  };

  const buttonVariants = {
    idle: { 
      scale: 1, 
      y: 0,
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
    },
    hover: { 
      scale: 1.02, 
      y: -2,
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
    },
    pressed: { 
      scale: 0.98, 
      y: 0,
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
    }
  };

  const iconVariants = {
    idle: { scale: 1, rotate: 0 },
    hover: { scale: 1.1, rotate: 5 },
    pressed: { scale: 0.9, rotate: -5 }
  };

  const textVariants = {
    idle: { y: 0 },
    hover: { y: -1 },
    pressed: { y: 1 }
  };

  return (
    <motion.div
      className={cn(
        'relative cursor-pointer select-none',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      variants={buttonVariants}
      initial="idle"
      whileHover={!disabled ? "hover" : "idle"}
      animate={isPressed ? "pressed" : "idle"}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={handleClick}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17
      }}
    >
      <GlassCard 
        className="p-12 md:p-16 min-h-[180px] md:min-h-[220px] flex flex-col items-center justify-center space-y-6 group relative overflow-hidden"
        blur="lg"
        opacity={0.05}
        shadow="xl"
      >
        {/* Epic animated background gradient */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-purple-600/10 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-all duration-700" />
        
        {/* Dynamic glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/10 to-purple-600/10 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Intense shine effect */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <div className="absolute -inset-full opacity-0 group-hover:opacity-40 bg-gradient-to-r from-transparent via-white to-transparent skew-x-12 group-hover:animate-glass-shine transition-opacity duration-1000" />
        </div>

        {/* Epic border glow */}
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-br from-cyan-400/50 via-transparent to-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'xor' }} />

        {/* Profile Image with Epic Effects */}
        <motion.div
          variants={iconVariants}
          className="relative z-10"
        >
          <div className="relative">
            {/* Outer glow ring */}
            <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-cyan-400/30 to-purple-500/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Main image container */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-600/30 backdrop-blur-sm border-2 border-white/20 overflow-hidden p-1 relative">
              {/* Inner glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="w-full h-full rounded-full overflow-hidden relative">
                <Image
                  src={`/images/${user.toLowerCase()}.png`}
                  alt={`${user} profile`}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover object-center scale-110 transition-transform duration-500 group-hover:scale-125"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden absolute inset-0 bg-gradient-to-br from-cyan-900/50 to-purple-900/50 rounded-full flex items-center justify-center">
                  <User size={40} className="text-cyan-400" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Epic User name */}
        <motion.div
          variants={textVariants}
          className="relative z-10 text-center"
        >
          <h3 className="text-3xl md:text-4xl font-black mb-2 tracking-wider uppercase">
            <span 
              className="bg-gradient-to-r from-cyan-400 via-white to-purple-400 bg-clip-text text-transparent"
              style={{ 
                filter: "drop-shadow(0 0 10px rgba(0, 255, 255, 0.5))",
                textShadow: "0 0 20px rgba(255, 255, 255, 0.3)"
              }}
            >
              {user}
            </span>
          </h3>
          <motion.p 
            className="text-sm font-medium text-cyan-300 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500"
            animate={{ 
              textShadow: [
                "0 0 5px rgba(0, 255, 255, 0.5)",
                "0 0 15px rgba(0, 255, 255, 0.8)",
                "0 0 5px rgba(0, 255, 255, 0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Enter the Zone
          </motion.p>
        </motion.div>

        {/* Ripple effect overlay */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          {isPressed && (
            <motion.div
              className="absolute inset-0 bg-white/20"
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
};

export { UserSelectionButton };
