import React from 'react';

interface FloatingButtonProps {
  x: number;
  y: number;
  onOpen: () => void;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({ x, y, onOpen }) => {
  return (
    <button
      onClick={onOpen}
      style={{
        position: 'absolute',
        top: y,
        left: x,
        zIndex: 99999,
        transform: 'translate(-50%, -100%)',
      }}
      className="app-icon w-8 h-8 flex items-center justify-center shadow-neo-1 border-2 border-lnc-ink-black hover:scale-110 transition-transform duration-200 z-[99999] animate-pop-in text-[10px] font-extrabold text-lnc-ink-black tracking-tighter"
    >
      LNC
    </button>
  );
};
