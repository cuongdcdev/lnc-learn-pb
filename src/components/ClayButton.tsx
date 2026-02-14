import React from 'react';

interface ClayButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export const ClayButton: React.FC<ClayButtonProps> = ({ 
  children, 
  className = '', 
  variant = 'primary',
  ...props 
}) => {
  // Use new utility classes
  const styles = variant === 'secondary' 
    ? "neo-btn-secondary" 
    : "neo-btn-primary";

  return (
    <button 
      className={`${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
