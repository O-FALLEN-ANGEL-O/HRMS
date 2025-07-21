
"use client";

import React from 'react';
import { motion } from "framer-motion";
import { cn } from '@/lib/utils';

export function LoadingLogo({ className }: { className?: string }) {
  const iconVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => {
      const delay = i * 0.5;
      return {
        pathLength: 1,
        opacity: 1,
        transition: {
          pathLength: { delay, type: "spring", duration: 1.5, bounce: 0 },
          opacity: { delay, duration: 0.01 },
        },
      };
    },
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
        <motion.svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="60" 
            height="60" 
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
                variants={iconVariants}
                initial="hidden"
                animate="visible"
                custom={1}
            />
            <motion.path
                d="M2 17l10 5 10-5"
                variants={iconVariants}
                initial="hidden"
                animate="visible"
                custom={2}
            />
            <motion.path
                d="M2 12l10 5 10-5"
                variants={iconVariants}
                initial="hidden"
                animate="visible"
                custom={3}
            />
        </motion.svg>
        <span className="font-headline text-2xl font-bold text-primary">OptiTalent</span>
    </div>
  );
}
