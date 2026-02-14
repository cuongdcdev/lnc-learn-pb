

import { useTranslation } from '../contexts/LanguageContext';

interface ContextAreaProps {

  selectedText: string;
  onTextChange?: (text: string) => void;
  siteTitle?: string;
  siteUrl?: string;
}

export function ContextArea({ 
  selectedText, 
  onTextChange,
  siteTitle, 
  siteUrl 
}: ContextAreaProps) {
  const { t } = useTranslation();
  
  const handleOpenLink = () => {
    if (siteUrl) {
      window.open(siteUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="mb-3">
      <div className="flex justify-between items-end mb-1.5 px-0.5">
        <label className="text-[10px] font-extrabold text-lnc-ink-grey uppercase tracking-widest">
          {t('contextArea.label')}
        </label>
        {siteUrl && (
          <button 
             onClick={handleOpenLink}
             className="neo-btn-secondary py-0.5 px-2 text-[9px] flex items-center gap-1 h-auto"
             title={t('contextArea.linkTooltip')}
           >
             🔗 {t('contextArea.linkBtn')}
           </button>
        )}
      </div>
      
      <div className="relative group">
        <textarea 
          value={selectedText}
          onChange={(e) => onTextChange?.(e.target.value)}
          placeholder={t('contextArea.placeholder')}
          className="w-full text-lnc-textarea h-16 neo-input bg-white italic text-lnc-ink-grey resize-none custom-scrollbar text-xs leading-tight"
          style={{ lineHeight: '1.3' }}
        />
      </div>
      
      {siteTitle && (
        <div className="mt-1 text-[9px] font-bold text-gray-300 truncate px-1 uppercase tracking-wide">
          {t('contextArea.sourceLabel')}: {siteTitle}
        </div>
      )}
    </div>
  );
}
