import { useState, useEffect } from 'react';
import { useTranslation } from './contexts/LanguageContext';
import './App.css';

import { Onboarding } from './components/Onboarding';
import { Settings } from './components/Settings';
import { ContextArea } from './components/ContextArea';
import { TabSystem } from './components/TabSystem';
import { ResultArea } from './components/ResultArea';
import { ChatInput } from './components/ChatInput';
import type { AgentType } from './lib/agents';
import type { PageContext } from './lib/types';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function App() {
  const { t } = useTranslation();
  // Routing State
  const [view, setView] = useState<'main' | 'onboarding' | 'settings'>('main');

  // Agent/Main State
  const [selectedText, setSelectedText] = useState<string>('');
  const [context, setContext] = useState<PageContext | undefined>(undefined);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState<AgentType | null>(null);
  const [apiKey, setApiKey] = useState<string>('');

  // UI State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatThinking, setIsChatThinking] = useState(false);

  // Initialization & Routing Logic
  useEffect(() => {
    // 1. Check URL Hash
    const hash = window.location.hash.replace('#', '');
    if (hash === 'onboarding') setView('onboarding');
    else if (hash === 'settings') setView('settings');

    // 2. Check Storage
    chrome.storage.local.get(['lastSelection', 'lastContext', 'lastResult', 'lastActiveAgent', 'setupComplete', 'apiKey', 'chatHistory'], (data) => {
      if (data.lastSelection) setSelectedText(data.lastSelection as string);
      if (data.lastContext) setContext(data.lastContext as PageContext);
      if (data.lastResult) setResult(data.lastResult);
      if (data.lastActiveAgent) setActiveAgent(data.lastActiveAgent as AgentType);
      if (data.apiKey) setApiKey(data.apiKey as string);
      if (data.chatHistory) setChatHistory(data.chatHistory as ChatMessage[]);

      if (!data.setupComplete && hash !== 'onboarding') {
        setView('onboarding');
      }
    });

    // 3. Listen for Hash Changes
    const handleHashChange = () => {
      const h = window.location.hash.replace('#', '');
      if (h === 'onboarding') setView('onboarding');
      else if (h === 'settings') setView('settings');
      else setView('main');
    };
    window.addEventListener('hashchange', handleHashChange);

    // 4. Listen for Messages
    const messageListener = (message: any) => {
      if (message.type === 'TEXT_SELECTED') {
        setSelectedText(message.payload.text);
        // Reset state on new selection
        setResult(null);
        setActiveAgent(null);
        setChatHistory([]);

        if (message.payload.context) {
          setContext(message.payload.context);
        }
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  // Persist State
  useEffect(() => {
    chrome.storage.local.set({
      lastSelection: selectedText,
      lastContext: context,
      lastResult: result,
      lastActiveAgent: activeAgent,
      chatHistory: chatHistory
    });
  }, [selectedText, context, result, activeAgent, chatHistory]);

  // Handle Tab Switch (Agent Action)
  const handleTabChange = async (agent: AgentType, forceRefresh = false) => {
    if (!selectedText) return;
    setLoading(true);
    setActiveAgent(agent);
    setResult(null);
    setChatHistory([]); // Reset chat on new primary action

    // Check cache first if not forced
    if (!forceRefresh) {
      try {
        const storage = await chrome.storage.local.get(['collections']);
        const items = (storage.collections || []) as any[];
        const cachedItem = items.find((item: any) =>
          item.url === (context?.url || '') &&
          item.selectedText === selectedText?.trim()
        );

        if (cachedItem && cachedItem.results && cachedItem.results[agent]) {
          console.log('Using cached result for agent:', agent);
          setResult(cachedItem.results[agent]);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Cache check failed:', err);
        // Continue to fetch if cache fails
      }
    }

    const config = await chrome.storage.local.get(['apiKey', 'targetLanguage', 'userContext']);
    const currentKey = config.apiKey || apiKey;
    const currentLang = config.targetLanguage || 'English';
    const userContext = config.userContext || '';

    if (!currentKey) {
      setResult("Error: API Key not found. Please configure in settings.");
      setLoading(false);
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'PROCESS_TEXT',
        payload: {
          agentType: agent,
          text: selectedText,
          lang: currentLang,
          apiKey: currentKey,
          userContext: userContext,
          context: context
        }
      });

      if (response && response.success) {
        setResult(response.data);
        // Auto-save to collection
        saveToCollection(selectedText?.trim() || '', context, agent, response.data);
      } else {
        setResult("Error: " + (response?.error || "Unknown error"));
      }
    } catch (e) {
      setResult("Error: " + e);
    } finally {
      setLoading(false);
    }
  };

  const saveToCollection = (text: string, ctx: PageContext | undefined, agent: AgentType, res: any) => {
    chrome.storage.local.get(['collections'], (data) => {
      const items = (data.collections || []) as any[];

      // Check for existing item with same URL and selected Text
      const existingIndex = items.findIndex((item: any) =>
        item.url === (ctx?.url || '') &&
        item.selectedText === text
      );

      let updatedCollections;

      if (existingIndex !== -1) {
        // Update existing item
        const existingItem = items[existingIndex];
        const newResults = { ...(existingItem.results || {}), [agent]: res };

        const updatedItem = {
          ...existingItem,
          timestamp: Date.now(),
          agentType: agent, // Update to latest agent used
          result: res,      // Update to latest result
          results: newResults, // Store persistent results
          // Preserve other fields
          hasQuiz: agent === 'EXAMINER' || existingItem.hasQuiz,
          hasChat: existingItem.hasChat // Chat is its own thing
        };

        updatedCollections = [...items];
        updatedCollections[existingIndex] = updatedItem;
        console.log('Updated existing collection item:', updatedItem);

      } else {
        // Create new item
        const newItem = {
          id: Date.now().toString(),
          url: ctx?.url || '',
          domain: ctx?.domain || 'unknown',
          favicon: ctx?.favicon,
          title: ctx?.pageTitle || 'Untitled',
          selectedText: text,
          timestamp: Date.now(),
          masteryLevel: 0,
          hasQuiz: agent === 'EXAMINER',
          hasChat: false,
          agentType: agent,
          result: res,
          results: { [agent]: res }, // Initialize results map
          chatHistory: []
        };
        updatedCollections = [newItem, ...items];
        console.log('Created new collection item:', newItem);
      }

      chrome.storage.local.set({ collections: updatedCollections });
    });
  };

  // Handle Chat Follow-up
  const handleChatSubmit = async (message: string) => {
    if (!result) return;
    setIsChatThinking(true);

    // Optimistic Update
    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: message }];
    setChatHistory(newHistory);

    const config = await chrome.storage.local.get(['apiKey', 'targetLanguage']);
    const currentKey = config.apiKey || apiKey;
    const currentLang = config.targetLanguage || 'English';

    // Extract content if result contains verification data
    let resultForContext = result;
    if (result && typeof result === 'object' && 'content' in result && 'verification' in result) {
        resultForContext = result.content;
    }

    // Construct context for Assistant
    // We send the original text, the previous result, and the history
    const combinedContext = `
      ORIGINAL TEXT: "${selectedText}"
      PREVIOUS AI RESULT: "${typeof resultForContext === 'string' ? resultForContext : JSON.stringify(resultForContext)}"
      CHAT HISTORY: ${JSON.stringify(newHistory)}
    `;

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'PROCESS_TEXT', // Re-using process text but we might want a specialized handler or just use agent type ASSISTANT
        payload: {
          agentType: 'ASSISTANT',
          text: message, // User's question is the "text"
          lang: currentLang,
          apiKey: currentKey,
          userContext: combinedContext, // Pass all context here
          context: context
        }
      });

      if (response && response.success) {
        let responseContent = response.data;
        if (typeof response.data === 'object' && response.data.content) {
            responseContent = response.data.content;
        }
        setChatHistory(prev => [...prev, { role: 'assistant', content: responseContent }]);
      } else {
        setChatHistory(prev => [...prev, { role: 'assistant', content: t('errors.processError') }]);
      }
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: t('errors.connectionError') }]);
    } finally {
      setIsChatThinking(false);
    }
  };

  const openFullTab = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
    window.close();
  };

  // --- Render ---

  if (view === 'onboarding') return <Onboarding onComplete={() => { setView('main'); window.location.hash = ''; }} />;
  if (view === 'settings') return <Settings onBack={() => { setView('main'); window.location.hash = ''; }} onReset={() => setView('onboarding')} />;

  return (
    <div className="h-screen flex flex-col font-sans box-border relative max-w-7xl mx-auto border-r-2 border-l-2 border-lnc-ink-black shadow-neo-1">
      {/* Compact Header */}
      <div className="flex justify-between items-center px-3 py-2 bg-lnc-bg sticky top-0 z-20 border-b-2 border-lnc-ink-black">
        <div className="flex items-center gap-2">
          {context?.favicon ? (
            <img src={context.favicon} alt="Favicon" className="w-6 h-6 rounded-lg shadow-sm" />
          ) : (
            <div className="app-icon shadow-neo-1 border-2 border-lnc-ink-black flex items-center justify-center overflow-hidden">
              <img src="/icons/icon.png" alt="LNC Learn" className="w-4 h-4" />
            </div>
          )}
          <div className="flex flex-col">
            <h1 className="text-base font-extrabold text-lnc-ink-black leading-tight">{t('app.title')}</h1>
            {context?.domain && (
              <span className="text-[9px] text-lnc-ink-grey font-bold tracking-wide uppercase">{context.domain}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openFullTab}
            className="px-2 py-1 bg-white hover:bg-gray-50 border-2 border-lnc-ink-black rounded-neo-sm shadow-neo-2 flex items-center gap-1.5 transition-all group active:shadow-neo-pressed active:translate-y-[2px]"
            title={t('app.openDashboardTooltip')}
          >
            <span className=" text-base group-hover:scale-110 transition-transform flex items-center justify-center">
              📚
            </span>
            <span className="text-xs font-bold text-lnc-ink-black hidden sm:inline-block">{t('dashboard.title')}</span>
          </button>
          <button onClick={() => setView('settings')} className="p-1.5 text-lnc-ink-black hover:text-lnc-teal transition-colors rounded-lg bg-transparent hover:bg-black/5" title={t('app.settingsTooltip')}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar space-y-3">
        {/* Context Area */}
        <ContextArea
          selectedText={selectedText}
          onTextChange={setSelectedText}
          siteTitle={context?.pageTitle}
          siteUrl={context?.url}
        />

        {/* Mode Switcher */}
        <TabSystem
          activeTab={activeAgent}
          onTabChange={handleTabChange}
          loading={loading}
          disabled={!selectedText}
        />

        {/* Results */}
        {/* Results */}
        <ResultArea
          result={result}
          loading={loading}
          activeAgent={activeAgent}
          onClear={() => { setResult(null); setActiveAgent(null); setChatHistory([]); }}
          onReload={() => activeAgent && handleTabChange(activeAgent, true)}
          onQuizComplete={(score, total) => {
             const mastery = Math.round((score / total) * 100);
             // We need to update the collection item with this mastery
             // Since we don't have the ID easily here, we use the same logic as saveToCollection to find it by URL+Text
             // Actually, we can just call saveToCollection with the current result but inject the new mastery
             
             // BUT saveToCollection is designed to save the RESULT, not just update mastery.
             // Let's modify saveToCollection or create a helper ?
             // For now, re-saving with same result but we need a way to pass mastery.
             
             // Quick fix: Update local storage directly for this item
             chrome.storage.local.get(['collections'], (data) => {
                 const items = (data.collections || []) as any[];
                 const index = items.findIndex((item: any) => 
                    item.url === (context?.url || '') && 
                    item.selectedText === selectedText?.trim()
                 );
                 
                 if (index !== -1) {
                     const updatedItems = [...items];
                     updatedItems[index] = { ...updatedItems[index], masteryLevel: mastery };
                     chrome.storage.local.set({ collections: updatedItems });
                 }
             });
          }}
        />

        {/* Chat History */}
        {chatHistory.length > 0 && (
          <div className="mb-20 space-y-2">
            <div className="flex items-center gap-2 my-2">
              <div className="h-[2px] bg-lnc-ink-light flex-1"></div>
              <span className="text-[10px] font-extrabold text-lnc-ink-grey uppercase tracking-widest">{t('app.discussion')}</span>
              <div className="h-[2px] bg-lnc-ink-light flex-1"></div>
            </div>
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 text-sm font-medium border-2 border-lnc-ink-black shadow-neo-1 ${msg.role === 'user'
                    ? 'bg-lnc-teal text-white rounded-neo rounded-tr-sm'
                    : 'bg-white text-lnc-ink-black rounded-neo rounded-tl-sm'
                  }`}>
                  {msg.role === 'assistant' ? <div className="prose prose-sm max-w-none"><ReactMarkdown>{msg.content}</ReactMarkdown></div> : msg.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky Chat Input */}
      {result && !loading && (
        <div className="px-3 pb-3 bg-gradient-to-t from-lnc-bg via-lnc-bg to-transparent">
          <ChatInput
            onSend={handleChatSubmit}
            disabled={isChatThinking}
            isThinking={isChatThinking}
          />
        </div>
      )}
      {/* Sticky Footer */}
      <div className="px-3 py-1 bg-lnc-bg text-center border-t-2 border-lnc-ink-black">
        <a
          href="https://near.ai/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[9px] text-gray-400 hover:text-lnc-teal transition-colors font-medium decoration-none"
        >
          {t('app.footer')}
        </a>
      </div>
    </div>
  );
}

export default App;
