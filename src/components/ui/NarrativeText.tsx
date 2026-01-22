import type { ReactNode } from 'react';

interface NarrativeTextProps {
  children: ReactNode;
  className?: string;
}

export function NarrativeText({ children, className = '' }: NarrativeTextProps) {
  return (
    <p className={`text-narrative leading-relaxed max-w-prose text-gray-100 ${className}`}>
      {children}
    </p>
  );
}
