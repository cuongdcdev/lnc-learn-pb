import { ClayCard } from './ClayCard';
import type { CollectionItem } from '../lib/dummy-data';
import { useTranslation } from '../contexts/LanguageContext';


interface CollectionCardProps {
  item: CollectionItem;
  onOpen: (item: CollectionItem) => void;
  onDelete: (id: string) => void;
}

export function CollectionCard({ item, onOpen, onDelete }: CollectionCardProps) {
  const { t, language } = useTranslation();
  const date = new Date(item.timestamp).toLocaleDateString(language);


  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(t('collectionCard.deleteConfirm'))) {
      onDelete(item.id);
    }
  };

  return (
    <div className="mb-4 break-inside-avoid">
      <ClayCard className="hover:scale-[1.01] hover:-translate-y-[1px] transition-all cursor-pointer relative group overflow-visible p-4 shadow-neo-1 hover:shadow-neo-hover active:shadow-neo-pressed active:translate-y-[2px]" onClick={() => onOpen(item)}>
        
        {/* Compact Header: Source Data */}
        <div className="flex items-center gap-2 mb-2">
          {item.favicon ? (
            <img src={item.favicon} alt="" className="w-8 h-8 rounded-neo-sm border-2 border-lnc-ink-black bg-white p-0.5 object-obtain" />
          ) : (
            <span className="w-8 h-8 flex items-center justify-center bg-lnc-bg rounded-neo-sm border-2 border-lnc-ink-black text-sm">📄</span>
          )}
          <div className="flex flex-col overflow-hidden flex-1">
            <h4 className="text-sm font-extrabold text-lnc-ink-black truncate leading-tight" title={item.title}>
              {item.title}
            </h4>
            <span className="text-[9px] font-bold text-lnc-ink-grey uppercase tracking-wider truncate">
              {item.domain}
            </span>
          </div>
          {/* Action Buttons - Always visible on hover */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
             <button 
               onClick={(e) => { e.stopPropagation(); window.open(item.url, '_blank'); }}
               className="bg-white text-lnc-teal w-6 h-6 flex items-center justify-center rounded-neo-sm shadow-neo-1 hover:scale-110 transition-all border-2 border-lnc-ink-black text-xs hover:shadow-neo-hover"
               title={t('collectionCard.openOriginal')}
             >
               🔗
             </button>
             <button 
               onClick={handleDelete}
               className="bg-white text-red-400 w-6 h-6 flex items-center justify-center rounded-neo-sm shadow-neo-1 hover:text-red-600 hover:scale-110 transition-all border-2 border-lnc-ink-black text-xs hover:shadow-neo-hover"
               title={t('collectionCard.deleteItem')}
             >
               ✕
             </button>
          </div>
        </div>

        {/* Compact Snippet Preview */}
        <div className="bg-lnc-bg p-3 rounded-neo-sm mb-2 border-2 border-lnc-ink-light">
          <p className="text-xs text-lnc-ink-grey italic line-clamp-4 leading-snug font-medium">
            "{item.selectedText}"
          </p>
        </div>

        {/* Compact Status & Metrics - Single Row */}
        <div className="flex justify-between items-center gap-2 mt-3">
          <div className="flex flex-wrap gap-1 flex-1">
            {/* Render badges based on available results */}
            {item.results && Object.keys(item.results).map((agent) => (
               <span key={agent} className={`text-[9px] px-2 py-0.5 rounded-neo-sm font-extrabold border-2 border-lnc-ink-black ${
                 agent === 'EXAMINER' ? 'bg-blue-100 text-blue-800' :
                 agent === 'TUTOR' ? 'bg-green-100 text-green-800' :
                 agent === 'CRITIC' ? 'bg-orange-100 text-orange-800' :
                 agent === 'LINGUIST' ? 'bg-indigo-100 text-indigo-800' :
                 'bg-gray-100 text-gray-800'
               }`}>
                 {agent === 'EXAMINER' ? t('collectionCard.quiz') : 
                  agent === 'TUTOR' ? t('collectionCard.explain') : 
                  agent === 'CRITIC' ? t('collectionCard.critique') : 
                  agent === 'LINGUIST' ? t('collectionCard.translate') : agent}
               </span>
            ))}
            
            {!item.results && item.hasQuiz && (
               <span className="text-[9px] px-2 py-0.5 rounded-neo-sm bg-blue-100 text-blue-800 font-extrabold border-2 border-lnc-ink-black">{t('collectionCard.quiz')}</span>
            )}

            {item.hasChat && (
              <span className="text-[9px] px-2 py-0.5 rounded-neo-sm bg-purple-100 text-purple-800 font-extrabold border-2 border-lnc-ink-black">
                {t('collectionCard.chat')}
              </span>
            )}
          </div>
          
          {/* Compact Metadata: Date + Progress */}
          <div className="flex items-center gap-2">
             <span className="text-[9px] text-lnc-ink-grey font-bold whitespace-nowrap">{date}</span>
             {/* Compact Progress Bar */}
             <div className="w-12 h-2 bg-lnc-ink-light rounded-full overflow-hidden border-2 border-lnc-ink-black">
               <div 
                 className={`h-full ${
                    item.masteryLevel > 80 ? 'bg-green-400' :
                    item.masteryLevel > 40 ? 'bg-lnc-orange' : 'bg-gray-400'
                 }`} 
                 style={{ width: `${item.masteryLevel}%` }}
               />
             </div>
          </div>
        </div>

      </ClayCard>
    </div>
  );
}
