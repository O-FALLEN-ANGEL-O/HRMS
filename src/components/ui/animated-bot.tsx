
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedBotProps {
  className?: string;
  size?: number;
}

export const AnimatedBot = ({ className, size = 24 }: AnimatedBotProps) => {
  const eyeVariants = {
    initial: {
      scaleY: 1,
    },
    blinking: {
      scaleY: [1, 0.1, 1],
      transition: {
        duration: 0.3,
        repeat: Infinity,
        repeatDelay: 3,
        ease: 'easeInOut',
      },
    },
  };
  
  const antennaVariants = {
    initial: {
        opacity: 0.5
    },
    glowing: {
        opacity: [0.5, 1, 0.5],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
        }
    }
  }

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-primary", className)}
    >
      {/* Head */}
      <path d="M12 8V4H8" />
      <path d="M16 4h-4" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      
      {/* Eyes */}
      <motion.circle cx="9" cy="14" r="1" variants={eyeVariants} initial="initial" animate="blinking" />
      <motion.circle cx="15" cy="14" r="1" variants={eyeVariants} initial="initial" animate="blinking" />

      {/* Antenna */}
       <motion.path d="M12 4V2" variants={antennaVariants} initial="initial" animate="glowing" />
       <motion.circle cx="12" cy="2" r="1" fill="currentColor" variants={antennaVariants} initial="initial" animate="glowing"/>

    </motion.svg>
  );
};
