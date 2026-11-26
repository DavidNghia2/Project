import React from 'react';
import { m, useReducedMotion } from 'motion/react';
import { staggerContainerVariants, staggerItemVariants } from './tokens';

export interface StaggerListProps {
  children: React.ReactNode;
  className?: string;
}

export const StaggerList: React.FC<StaggerListProps> = ({ children, className = '' }) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div
      className={className}
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </m.div>
  );
};

export interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({ children, className = '' }) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div className={className} variants={staggerItemVariants}>
      {children}
    </m.div>
  );
};
