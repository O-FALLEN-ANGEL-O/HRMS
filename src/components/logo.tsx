import React from 'react';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 font-headline text-xl font-bold ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
        </svg>
        <span>OptiTalent</span>
    </div>
  );
}
