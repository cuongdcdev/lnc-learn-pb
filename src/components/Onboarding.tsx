import { useState, useEffect } from 'react';
import { ClayButton } from './ClayButton';
import { useTranslation } from '../contexts/LanguageContext';

import { ClayCard } from './ClayCard';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const { t, language, setLanguage } = useTranslation();
  const [step, setStep] = useState(1);
  const [apiKey, setApiKey] = useState('');
  const [useDemo, setUseDemo] = useState(false);
  const [targetLang, setTargetLang] = useState('English');
  const [isValid, setIsValid] = useState(false);


  // Validate Step 3 (API Key)
  useEffect(() => {
    if (step === 3) {
      if (useDemo) {
        setIsValid(true);
      } else {
        setIsValid(apiKey.trim().length > 0);
      }
    }
  }, [step, apiKey, useDemo]);

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    const finalApiKey = useDemo ? 'DEMO_MODE' : apiKey;
    chrome.storage.local.set({ 
      apiKey: finalApiKey,
      targetLanguage: targetLang,
      setupComplete: true
    }, () => {
      onComplete();
      // If we are in a tab, close it? Or just let the parent handle it.
      // The parent (App.tsx) will switch the view.
      // If opened as a full page tab for onboarding, we might want to close it.
      if (window.location.hash === '#onboarding') {
          window.close();
      }
    });
  };

  return (
    <div className="min-h-screen bg-lnc-bg flex items-center justify-center p-4">
      <ClayCard className="max-w-md w-full p-8 space-y-6 shadow-neo-1 border-2 border-lnc-ink-black">
        {/* Progress Bar */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`h-2 flex-1 mx-1 rounded-full border-2 border-lnc-ink-black transition-colors ${s <= step ? 'bg-lnc-teal' : 'bg-lnc-ink-light'}`} />
          ))}
        </div>

        {/* Step 1: UI Language (NEW) */}
        {step === 1 && (
          <div className="space-y-4 text-center">
            <h1 className="text-2xl font-extrabold text-lnc-ink-black">{t('onboarding.selectLanguage')}</h1>
            <p className="text-lnc-ink-grey">{t('onboarding.selectLanguageDesc')}</p>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
               {['en', 'vi', 'zh', 'ja', 'de', 'ru', 'uk'].map((lang) => (
                 <button
                   key={lang}
                   onClick={() => setLanguage(lang as any)}
                   className={`p-3 rounded-neo-sm border-2 transition-all ${
                     language === lang 
                       ? 'border-lnc-teal bg-lnc-teal/10 font-bold text-lnc-teal' 
                       : 'border-lnc-ink-light hover:border-lnc-teal text-lnc-ink-grey'
                   }`}
                 >
                   {lang === 'en' ? 'English' : 
                    lang === 'vi' ? 'Tiếng Việt' :
                    lang === 'zh' ? '中文' :
                    lang === 'ja' ? '日本語' :

                    lang === 'de' ? 'Deutsch' :
                    lang === 'ru' ? 'Русский' :
                    'Українська'}
                 </button>
               ))}
            </div>

            <div className="pt-4">
              <ClayButton onClick={handleNext} className="w-full">{t('onboarding.next') || 'Next'}</ClayButton>
            </div>
          </div>
        )}

        {/* Step 2: Welcome (shifted) */}
        {step === 2 && (
          <div className="space-y-4 text-center">
            <h1 className="text-2xl font-extrabold text-lnc-ink-black">{t('onboarding.welcomeTitle')}</h1>
            <p className="text-lnc-ink-grey">
              {t('onboarding.welcomeStep')}
            </p>
            <div className="py-4">
                               <div className="app-icon flex justify-center">
                  <img src="/icons/icon.png" alt="LNC Learn" className="w-24 h-24" />
                </div>
            </div>
            <ClayButton onClick={handleNext} className="w-full">{t('onboarding.startSetup')}</ClayButton>
          </div>
        )}

        {/* Step 3: API Configuration (shifted) */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-lnc-ink-black">{t('onboarding.configureTitle')}</h2>
            <p className="text-sm text-lnc-ink-grey">
              {t('onboarding.configureStep')}
            </p>

            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={useDemo} 
                  onChange={(e) => setUseDemo(e.target.checked)}
                  className="rounded text-lnc-teal focus:ring-lnc-teal"
                />
                <span className="text-sm font-medium text-lnc-ink-black">{t('onboarding.useDemo')}</span>
              </label>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">{t('onboarding.apiKeyLabel')}</label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={useDemo}
                placeholder={useDemo ? t('onboarding.demoEnabled') : "sk-..."}
                className={`neo-input w-full p-3 ${useDemo ? 'bg-lnc-ink-light text-gray-400' : 'bg-white text-lnc-ink-black'}`}
              />
              {!useDemo && (
                <div className="mt-1 text-xs text-gray-500 font-medium">
                  {t('settings.apiKeyHelp')} <a href="https://near.ai/cloud" target="_blank" rel="noopener noreferrer" className="text-lnc-primary hover:underline">near.ai/cloud</a>
                </div>
              )}
            </div>

            <ClayButton onClick={handleNext} disabled={!isValid} className="w-full">{t('onboarding.next')}</ClayButton>
          </div>
        )}

        {/* Step 4: Personalization (shifted) */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-lnc-ink-black">{t('onboarding.personalizeTitle')}</h2>
            <p className="text-sm text-lnc-ink-grey">
              {t('onboarding.personalizeStep')}
            </p>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">{t('onboarding.targetLangLabel')}</label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="neo-input w-full p-3 text-lnc-ink-black"
              >
                <option value="English">English</option>
                <option value="Vietnamese">Vietnamese</option>
                <option value="Chinese">Chinese</option>
                <option value="Korean">Korean</option>
                <option value="Japanese">Japanese</option>
                <option value="German">German</option>
                <option value="Russian">Russian</option>
                <option value="Ukrainian">Ukrainian</option>
              </select>
            </div>

            <ClayButton onClick={handleFinish} className="w-full">{t('onboarding.finish')}</ClayButton>
          </div>
        )}

      </ClayCard>

      <div className="fixed bottom-4 left-0 right-0 text-center">
         <a 
           href="https://near.ai/" 
           target="_blank" 
           rel="noopener noreferrer"
           className="text-[10px] text-gray-400 hover:text-lnc-teal transition-colors font-medium decoration-none"
         >
           {t('app.footer')}
         </a>
      </div>
    </div>
  );
}
