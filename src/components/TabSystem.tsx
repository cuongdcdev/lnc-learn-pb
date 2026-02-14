import type { AgentType } from '../lib/agents';
import { useTranslation } from '../contexts/LanguageContext';


interface TabSystemProps {
  activeTab: AgentType | null;
  onTabChange: (tab: AgentType) => void;
  loading: boolean;
  disabled: boolean;
}

export function TabSystem({ activeTab, onTabChange, loading, disabled }: TabSystemProps) {
  const { t } = useTranslation();
  const tabs: { id: AgentType; label: string; icon: string }[] = [
    { id: 'LINGUIST', label: t('tabs.translate'), icon: '🌐' },
    { id: 'TUTOR', label: t('tabs.explain'), icon: '💡' },
    { id: 'EXAMINER', label: t('tabs.quiz'), icon: '📝' },
    { id: 'CRITIC', label: t('tabs.critique'), icon: '🤔' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            disabled={disabled || loading}
            className={`
              flex flex-col items-center justify-center gap-1.5 py-3 px-2 transition-all duration-100 text-xs font-extrabold
              border-2 border-lnc-ink-black rounded-neo-sm cursor-pointer select-none
              ${isActive 
                ? 'bg-lnc-orange text-lnc-ink-black shadow-none translate-x-[2px] translate-y-[2px]' 
                : 'bg-white text-lnc-ink-grey shadow-neo-2 hover:-translate-y-[1px] hover:-translate-x-[1px] hover:shadow-neo-hover active:translate-y-[2px] active:translate-x-[2px] active:shadow-neo-pressed hover:text-lnc-ink-black'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}
            `}
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            <span className={`text-[10px] uppercase tracking-wider leading-none`}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
