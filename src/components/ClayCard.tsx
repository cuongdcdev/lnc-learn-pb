import React from 'react';

interface ClayCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  onClick?: () => void;
}

export const ClayCard: React.FC<ClayCardProps> = ({ children, className = '', title, onClick }) => {
  return (
    <div className={`neo-card ${className}`} onClick={onClick}>
      {title && <h3 className="text-xl font-extrabold mb-4 text-lnc-ink-black">{title}</h3>}
      {children}
    </div>
  );
};
