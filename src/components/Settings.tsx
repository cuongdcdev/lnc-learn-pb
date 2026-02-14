import { useState, useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';

import { ClayButton } from './ClayButton';
import { ClayCard } from './ClayCard';

interface SettingsProps {
  onBack: () => void;
  onReset: () => void;
}

export function Settings({ onBack, onReset }: SettingsProps) {
  const { t, language, setLanguage } = useTranslation();

  const [apiKey, setApiKey] = useState('');
  const [targetLang, setTargetLang] = useState('English');
  const [modelStrategy, setModelStrategy] = useState('Speed');
  const [userContext, setUserContext] = useState('');
  const [soundEffects, setSoundEffects] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const [useDemo, setUseDemo] = useState(false);

  // Load initial state
  useEffect(() => {
    chrome.storage.local.get(['apiKey', 'targetLanguage', 'modelStrategy', 'userContext', 'soundEffects'], (result) => {
      if (result.apiKey === 'DEMO_MODE') {
        setUseDemo(true);
      } else {
        setApiKey((result.apiKey as string) || '');
      }
      setTargetLang((result.targetLanguage as string) || 'English');
      setModelStrategy((result.modelStrategy as string) || 'Speed');
      setUserContext((result.userContext as string) || '');
      setSoundEffects(result.soundEffects !== undefined && result.soundEffects !== null ? !!result.soundEffects : true);
    });
  }, []);

  const handleSave = () => {
    const finalApiKey = useDemo ? 'DEMO_MODE' : apiKey;
    chrome.storage.local.set({
      apiKey: finalApiKey,
      targetLanguage: targetLang,
      modelStrategy: modelStrategy,
      userContext: userContext,
      soundEffects: soundEffects
    }, () => {
      // visual feedback?
      alert(t('settings.savedAlert'));
    });
  };

  const handleReset = () => {
    if (confirm(t('settings.resetConfirm'))) {
      chrome.storage.local.clear(() => {
        onReset(); // Trigger App to re-evaluate state
        // Re-open onboarding
        window.open(chrome.runtime.getURL("index.html#onboarding"), '_blank');
        window.close(); // Close current settings window if it's a popup
      });
    }
  };

  return (
    <div className="h-screen bg-lnc-bg flex flex-col font-sans p-4 box-border">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold text-lnc-ink-black">{t('settings.title')}</h1>
        <button 
          onClick={onBack}
          className="p-2 text-lnc-ink-grey hover:text-lnc-ink-black transition-colors"
          title={t('settings.backTooltip')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <ClayCard className="space-y-6 flex-1 overflow-y-auto">
        
        {/* API Key Section */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-lnc-ink-grey uppercase tracking-wider">{t('settings.apiConfig')}</label>
          <div className="p-4 bg-white rounded-neo-sm border-2 border-lnc-ink-light space-y-3">
            <label className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                checked={useDemo}
                onChange={(e) => setUseDemo(e.target.checked)}
                className="rounded text-lnc-teal focus:ring-lnc-teal"
              />
              <span className="text-sm font-bold text-gray-700">{t('settings.useDemo')}</span>
            </label>

            {!useDemo && (
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={t('settings.apiKeyPlaceholder')}
                  className="neo-input w-full p-3 pr-10 text-sm"
                />
                <button 
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showKey ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.414-1.414A9.98 9.98 0 0020 10c0-3.328-1.782-6.19-4.526-8.034l-1.076 1.077A8.966 8.966 0 0118.916 10c0 4.142-3.358 7.5-7.5 7.5-1.928 0-3.692-.72-5.01-1.908l-1.396 1.396zM10 14a3.999 3.999 0 002.046-.566l-3.612-3.612A4.002 4.002 0 0010 14z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Language Section */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-lnc-ink-grey uppercase tracking-wider">{t('settings.preferences')}</label>
          <div className="p-4 bg-white rounded-neo-sm border-2 border-lnc-ink-light space-y-3">
             {/* UI Language (NEW) */}
             <label className="text-sm font-bold text-gray-700 block">{t('settings.uiLanguage')}</label>
             <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="neo-input w-full p-3 mb-4 text-sm"
              >
                <option value="en">English</option>
                <option value="vi">Vietnamese - Tiếng Việt</option>
                <option value="zh">Chinese - 中文</option>
                <option value="ja">Japanese - 日本語</option>
                <option value="de">German - Deutsch</option>
                <option value="ru">Russian - Русский</option>
                <option value="uk">Ukrainian - Українська</option>
              </select>

             <label className="text-sm font-bold text-gray-700 block">{t('settings.targetLanguage')}</label>
             <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="neo-input w-full p-3 text-sm"
              >
                <option value="English">English</option>
                <option value="Vietnamese">Vietnamese - Tiếng Việt</option>
                <option value="Chinese">Chinese - 中文</option>
                <option value="Korean">Korean - 한국어</option>
                <option value="Japanese">Japanese - 日本語</option>
                <option value="German">German - Deutsch</option>
                <option value="Russian">Russian - Русский</option>
                <option value="Ukrainian">Ukrainian - Українська</option>
              </select>
          </div>
        </div>

        {/* Model Strategy Section */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-lnc-ink-grey uppercase tracking-wider">{t('settings.modelStrategy')}</label>
          <div className="p-4 bg-white rounded-neo-sm border-2 border-lnc-ink-light space-y-3">
             <label className="text-sm font-bold text-gray-700 block">{t('settings.optimizationGoal')}</label>
             <select
                value={modelStrategy}
                onChange={(e) => setModelStrategy(e.target.value)}
                className="neo-input w-full p-3 text-sm"
              >
                <option value="Speed">{t('settings.modelSpeed')}</option>
                <option value="Reasoning">{t('settings.modelReasoning')}</option>
              </select>
          </div>
        </div>

        {/* Personalization Section */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-lnc-ink-grey uppercase tracking-wider">{t('settings.personalization')}</label>
          <div className="p-4 bg-white border-2 border-lnc-ink-light rounded-neo-sm space-y-3">
             
             {/* Sound Toggle */}
             <div className="flex items-center justify-between border-b pb-3 mb-3 border-gray-100">
               <span className="text-sm font-bold text-gray-700">{t('settings.soundEffects')}</span>
               <label className="relative inline-flex items-center cursor-pointer">
                 <input 
                   type="checkbox" 
                   checked={soundEffects} 
                   onChange={(e) => setSoundEffects(e.target.checked)} 
                   className="sr-only peer" 
                 />
                 <div className="w-11 h-6 bg-lnc-ink-light peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-lnc-teal/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lnc-teal"></div>
               </label>
             </div>

             <label className="text-sm font-bold text-gray-700 block">{t('settings.userContext')}</label>
             <p className="text-xs text-gray-500">
               {t('settings.userContextHint')}
             </p>
             <textarea
                value={userContext}
                onChange={(e) => setUserContext(e.target.value)}
                placeholder={t('settings.userContextPlaceholder')}
                className="neo-input w-full p-3 h-24 text-sm resize-none"
             />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="space-y-2 pt-4 border-t border-gray-100">
           <label className="text-xs font-bold text-red-400 uppercase tracking-wider">{t('settings.dangerZone')}</label>
           <div className="p-4 bg-red-50 rounded-xl">
             <p className="text-xs text-red-600 mb-3">
               {t('settings.resetWarning')}
             </p>
             <button 
               onClick={handleReset}
                className="w-full py-2 px-4 bg-white border-2 border-red-200 text-red-600 rounded-neo-sm text-sm font-bold hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-neo-2 active:shadow-none active:translate-y-[2px]"
              >
               {t('settings.resetButton')}
             </button>
           </div>
        </div>

      </ClayCard>

      <div className="mt-4">
        <ClayButton onClick={handleSave} className="w-full py-3 font-bold">{t('settings.saveButton')}</ClayButton>
      </div>

    </div>
  );
}
