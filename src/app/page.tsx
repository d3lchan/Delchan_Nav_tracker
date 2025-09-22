'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserSelectionButton } from '@/components/ui/user-selection-button';
import { useAppStore } from '@/store';
import type { User } from '@/types';

export default function Home() {
  const router = useRouter();
  const setCurrentUser = useAppStore(state => state.setCurrentUser);

  const handleUserSelection = (user: User) => {
    setCurrentUser(user);
    router.push(`/${user.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-black">
      {/* Epic animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Dynamic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-black/60" />
        
        {/* Floating geometric shapes */}
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl"
          animate={{
            x: [0, 200, -100, 0],
            y: [0, -150, 100, 0],
            scale: [1, 1.3, 0.8, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ top: '10%', left: '10%' }}
        />
        
        <motion.div
          className="absolute w-80 h-80 bg-gradient-to-br from-purple-500/25 to-pink-600/25 rounded-full blur-3xl"
          animate={{
            x: [0, -150, 200, 0],
            y: [0, 100, -80, 0],
            scale: [1, 0.7, 1.4, 1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ top: '50%', right: '15%' }}
        />
        
        <motion.div
          className="absolute w-64 h-64 bg-gradient-to-br from-emerald-400/20 to-cyan-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 120, -80, 0],
            y: [0, -120, 60, 0],
            scale: [1, 1.2, 0.9, 1],
            rotate: [0, -180, 180, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ bottom: '20%', left: '30%' }}
        />

        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" 
               style={{
                 backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%), linear-gradient(0deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)',
                 backgroundSize: '100px 100px'
               }} />
        </div>

        {/* Shooting stars effect */}
        <motion.div
          className="absolute w-2 h-40 bg-gradient-to-b from-white to-transparent rounded-full opacity-80"
          animate={{
            x: [-100, 1200],
            y: [-50, 200],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: 0,
            ease: "easeOut"
          }}
          style={{ top: '20%', transform: 'rotate(45deg)' }}
        />
        
        <motion.div
          className="absolute w-1 h-30 bg-gradient-to-b from-cyan-400 to-transparent rounded-full opacity-60"
          animate={{
            x: [-100, 1200],
            y: [100, 400],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: 2,
            ease: "easeOut"
          }}
          style={{ top: '60%', transform: 'rotate(45deg)' }}
        />
      </div>

      {/* Main content with epic presentation */}
      <div className="relative z-10 w-full max-w-6xl mx-auto text-center">
        {/* Epic user selection with dramatic entrance */}
        <motion.div
          initial={{ opacity: 0, y: 100, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-12 justify-center items-center perspective-1000"
        >
          <motion.div
            whileHover={{ 
              scale: 1.1, 
              rotateY: 15,
              boxShadow: "0 30px 60px rgba(0, 255, 255, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <UserSelectionButton
              user="Nav"
              onClick={handleUserSelection}
              className="w-80 transform-gpu"
            />
          </motion.div>
          
          <motion.div
            whileHover={{ 
              scale: 1.1, 
              rotateY: -15,
              boxShadow: "0 30px 60px rgba(255, 0, 255, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <UserSelectionButton
              user="Delchan"
              onClick={handleUserSelection}
              className="w-80 transform-gpu"
            />
          </motion.div>
        </motion.div>

        {/* Epic call to action */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="mt-16"
        >
          <motion.p 
            className="text-lg text-gray-400 font-medium tracking-widest uppercase"
            animate={{ 
              textShadow: [
                "0 0 10px rgba(255, 255, 255, 0.3)",
                "0 0 20px rgba(255, 255, 255, 0.6)",
                "0 0 10px rgba(255, 255, 255, 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Choose Your Warrior
          </motion.p>
        </motion.div>
      </div>

      {/* Epic border effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-60" />
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-pink-400 to-transparent opacity-60" />
        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-emerald-400 to-transparent opacity-60" />
      </div>
    </div>
  );
}
