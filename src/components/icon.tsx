"use client";

import { forwardRef } from 'react';
import { icons, LucideProps } from 'lucide-react';

interface IconProps extends LucideProps {
  name: keyof typeof icons;
}

const Icon = forwardRef<SVGSVGElement, IconProps>(({ name, ...props }, ref) => {
  const LucideIcon = icons[name];
  
  if (!LucideIcon) {
    // Return a fallback or null if the icon name is invalid
    return null;
  }

  return <LucideIcon ref={ref} {...props} />;
});

Icon.displayName = 'Icon';

export { Icon };
