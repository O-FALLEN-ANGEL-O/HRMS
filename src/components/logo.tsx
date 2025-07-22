
"use client";

import React from 'react';
import { motion } from "framer-motion";
import { cn } from '@/lib/utils';
import { useSidebar } from './ui/sidebar';

const LogoComponent = () => {
  const { state } = useSidebar();
  
  const iconVariants = {
    hidden: {
      pathLength: 0,
    },
    visible: {
      pathLength: 1,
    }
  }
  return (
    <div className={cn("inline-flex items-center gap-2 font-headline text-xl font-bold")}>
        <motion.svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="28" 
            height="28" 
            viewBox="0 0 24 24" 
            fill="none"
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-primary"
        >
            <motion.path
                d="M12 2L2 7l10 5 10-5-10-5z"
                strokeDasharray="1"
                strokeDashoffset="0"
                variants={iconVariants}
                initial="hidden"
                animate="visible"
                transition={{
                    default: { duration: 1, ease: "easeInOut", repeat: Infinity, repeatType: "loop", repeatDelay: 1 },
                }}
            />
            <motion.path
                d="M2 17l10 5 10-5"
                strokeDasharray="1"
                strokeDashoffset="0"
                 variants={iconVariants}
                initial="hidden"
                animate="visible"
                transition={{
                    default: { duration: 1, ease: "easeInOut", delay: 0.2, repeat: Infinity, repeatType: "loop", repeatDelay: 1 },
                }}
            />
            <motion.path
                d="M2 12l10 5 10-5"
                strokeDasharray="1"
                strokeDashoffset="0"
                 variants={iconVariants}
                initial="hidden"
                animate="visible"
                transition={{
                    default: { duration: 1, ease: "easeInOut", delay: 0.4, repeat: Infinity, repeatType: "loop", repeatDelay: 1 },
                }}
            />
        </motion.svg>
        {state === 'expanded' && <span>OptiTalent</span>}
    </div>
  );
}

export const Logo = React.memo(LogoComponent);
