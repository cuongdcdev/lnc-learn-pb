import React from 'react';
import { ClayButton } from './ClayButton';
import type { AgentType } from '../lib/agents';
import { useTranslation } from '../contexts/LanguageContext';


interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (agent: AgentType) => void;
  children: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onAction, children }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-[400px] bg-lnc-bg shadow-neo-1 border-l-2 border-lnc-ink-black z-[100000] transform transition-transform duration-300 ease-in-out font-sans">
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold text-lnc-ink-black">{t('sidebar.title')}</h2>
          <button onClick={onClose} className="text-lnc-ink-grey hover:text-lnc-ink-black text-xl font-bold">✕</button>
        </div>

        {/* Action Menu */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <ClayButton onClick={() => onAction('LINGUIST')} className="text-sm">{t('sidebar.translate')}</ClayButton>
          <ClayButton onClick={() => onAction('TUTOR')} className="text-sm">{t('sidebar.explain')}</ClayButton>
          <ClayButton onClick={() => onAction('EXAMINER')} className="text-sm">{t('sidebar.quiz')}</ClayButton>
          <ClayButton onClick={() => onAction('CRITIC')} className="text-sm">{t('sidebar.critique')}</ClayButton>
        </div>

        {/* Result Area */}
        <div className="flex-grow overflow-y-auto neo-card bg-white p-4 rounded-neo">
          {children}
        </div>
        
        <div className="mt-4 text-xs text-center text-gray-400">
          {t('sidebar.poweredBy')}
        </div>
      </div>
    </div>
  );
};
