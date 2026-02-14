import { useState } from 'react';
import { ContextArea } from './ContextArea'; // Same directory
import { TabSystem } from './TabSystem';     // Same directory
import { ResultArea } from './ResultArea';   // Same directory
import ReactMarkdown from 'react-markdown';
import type { CollectionItem } from '../lib/dummy-data'; // Up one level
import type { AgentType } from '../lib/agents';          // Up one level
import { useTranslation } from '../contexts/LanguageContext';

// Extracted Component to manage Modal State correctly
export function DetailModal({ item, onClose, onUpdate }: { item: CollectionItem, onClose: () => void, onUpdate: (item: CollectionItem) => void }) {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState<AgentType | null>(item.agentType || 'LINGUIST');


  // When tab changes, if we don't have a result for it, we might show nothing or pre-filled message
  // But strictly, we check `item.results`
  
  const currentResult = item.results?.[activeTab!] || (activeTab === item.agentType ? item.result : null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-neo w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-neo-1 border-2 border-lnc-ink-black flex flex-col" onClick={e => e.stopPropagation()}>
         {/* Modal Header */}
         <div className="flex justify-between items-center p-6 border-b-2 border-lnc-ink-black bg-lnc-bg">
            <div className="flex items-center gap-3">
               {item.favicon ? (
                 <img src={item.favicon} alt="" className="w-8 h-8 rounded-neo-sm border-2 border-lnc-ink-black shadow-neo-2" />
               ) : (
                 <div className="text-2xl">📄</div>
               )}
               <div>
                 <h2 className="text-lg font-extrabold text-lnc-ink-black leading-tight">{item.title}</h2>
                 <div className="text-xs text-lnc-ink-grey font-bold flex gap-2">
                    <span className="uppercase">{item.domain}</span>
                    <span>•</span>
                    <span>{new Date(item.timestamp).toLocaleDateString(language)}</span>
                 </div>
               </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-neo-sm hover:bg-lnc-ink-light text-lnc-ink-grey hover:text-lnc-ink-black transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
         </div>

         {/* Modal Content */}
         <div className="overflow-y-auto p-6 custom-scrollbar flex-1 bg-white">
            <ContextArea 
              selectedText={item.selectedText}
              siteTitle={item.title}
              siteUrl={item.url}
              onTextChange={(val) => {
                 onUpdate({ ...item, selectedText: val });
              }}
            />

            <TabSystem 
               activeTab={activeTab}
               onTabChange={setActiveTab} 
               loading={false}
               disabled={false} 
            />

            <ResultArea 
               result={currentResult}
               loading={false}
               activeAgent={activeTab}
               onClear={() => {}} 
               onQuizComplete={(score, total) => {
                   const mastery = Math.round((score / total) * 100);
                   onUpdate({ ...item, masteryLevel: mastery });
               }}
            />

            {item.chatHistory && item.chatHistory.length > 0 && (
              <div className="mb-6 space-y-3">
                 <div className="text-center text-xs text-lnc-ink-grey font-bold my-2 uppercase tracking-wide">{t('detailModal.chatHistory')}</div>
                 {item.chatHistory.map((msg: any, i: number) => (
                   <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[85%] p-3 rounded-neo text-sm border-2 border-lnc-ink-black shadow-neo-1 ${
                       msg.role === 'user' 
                         ? 'bg-lnc-teal text-white rounded-tr-none' 
                         : 'bg-white text-lnc-ink-black rounded-tl-none'
                     }`}>
                       {msg.role === 'assistant' ? <ReactMarkdown>{msg.content}</ReactMarkdown> : msg.content}
                     </div>
                   </div>
                 ))}
              </div>
            )}
         </div>
      </div>
    </div>
  );
}
