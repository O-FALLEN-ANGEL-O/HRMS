import React from 'react';
import { motion } from "framer-motion";

export function Logo({ className }: { className?: string }) {
  const iconVariants = {
    hidden: {
      pathLength: 0,
    },
    visible: {
      pathLength: 1,
    }
  }
  return (
    <div className={`inline-flex items-center gap-2 font-headline text-xl font-bold ${className}`}>
        <motion.svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
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
                transition={{
                    default: { duration: 1.2, ease: "easeInOut" },
                }}
            />
            <motion.path
                d="M2 17l10 5 10-5"
                 variants={iconVariants}
                initial="hidden"
                animate="visible"
                transition={{
                    default: { duration: 1.2, ease: "easeInOut", delay: 0.3 },
                }}
            />
            <motion.path
                d="M2 12l10 5 10-5"
                 variants={iconVariants}
                initial="hidden"
                animate="visible"
                transition={{
                    default: { duration: 1.2, ease: "easeInOut", delay: 0.6 },
                }}
            />
        </motion.svg>
        <span>OptiTalent</span>
    </div>
  );
}
