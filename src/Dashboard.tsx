import { createRoot } from 'react-dom/client';
import React, { useState, useEffect } from 'react';
import './index.css'; // Reuse main styles (Tailwind)
import { CollectionCard } from './components/CollectionCard';
import { DetailModal } from './components/DetailModal';
import { Settings } from './components/Settings';
import { DUMMY_COLLECTIONS, type CollectionItem } from './lib/dummy-data';
import { exportToJSON, exportToCSV } from './lib/data-management';
import { LanguageProvider, useTranslation } from './contexts/LanguageContext';

const DashboardContent = () => {
  const { t } = useTranslation();
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [filter, setFilter] = useState('ALL'); // ALL, LEARNING, MASTERED
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);
  const [view, setView] = useState<'main' | 'settings'>('main');

  const [showExportDropdown, setShowExportDropdown] = useState(false);

  useEffect(() => {
    // Load collections from storage or fallback to dummy data
    chrome.storage.local.get(['collections'], (result) => {
      const items = (result.collections || []) as CollectionItem[];
      if (items.length > 0) {
        setCollections(items);
      } else {
        setCollections(DUMMY_COLLECTIONS);
      }
    });
  }, []);

  const openSidePanel = () => {
    // Try to open side panel
    if (chrome.sidePanel && chrome.sidePanel.open) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.sidePanel.open({ tabId: tabs[0].id });
          // Or windowId for global
          // chrome.sidePanel.open({ windowId: tabs[0].windowId });
        }
      });
    } else {
      alert("Side panel not supported in this browser version.");
    }
  };

  const filteredCollections = collections.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.domain.toLowerCase().includes(search.toLowerCase()) ||
      item.selectedText.toLowerCase().includes(search.toLowerCase());

    if (filter === 'ALL') return matchesSearch;
    if (filter === 'MASTERED') return matchesSearch && item.masteryLevel >= 80;
    if (filter === 'LEARNING') return matchesSearch && item.masteryLevel < 80;

    return matchesSearch;
  });

  const handleDeleteItem = (id: string) => {
    const updated = collections.filter(c => c.id !== id);
    setCollections(updated);
    chrome.storage.local.set({ collections: updated });
  };

  if (view === 'settings') {
    return <Settings onBack={() => setView('main')} onReset={() => setCollections([])} />;
  }

  return (
    <div className="min-h-screen font-sans text-lnc-ink-black p-4 bg-lnc-bg flex flex-col">
      <div className="max-w-7xl mx-auto flex-1 w-full">
        {/* Compact Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
          <div className="flex items-center gap-2">
            <div className="app-icon w-10 h-10 bg-white p-1 shadow-neo-1 border-2 border-lnc-ink-black flex items-center justify-center overflow-hidden">
              <img src="/icons/icon.png" alt="LNC Learn" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-lnc-ink-black">{t('dashboard.title')}</h1>
              <p className="text-sm text-lnc-ink-grey font-medium">{t('dashboard.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openSidePanel}
              className="neo-btn-secondary py-1.5 px-3 text-xs flex items-center gap-1 font-bold text-lnc-teal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {t('dashboard.openSidebar')}
            </button>
            <button
              onClick={() => setView('settings')}
              className="p-2 text-lnc-ink-black hover:text-lnc-teal transition-colors rounded-neo-sm border-2 border-transparent hover:border-lnc-ink-black"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <div className="relative">
              <button
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className="neo-btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 font-bold"
                title='Export data to JSON or CSV'
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 transition-transform duration-200 ${showExportDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showExportDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowExportDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-40 bg-white border-2 border-lnc-ink-black shadow-neo-1 rounded-neo-sm z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={() => {
                        exportToJSON(collections);
                        setShowExportDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-lnc-bg transition-colors border-b-2 border-lnc-bg flex items-center justify-between group"
                    >
                      <span>{t('dashboard.exportJSON')}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </button>
                    <button
                      onClick={() => {
                        exportToCSV(collections);
                        setShowExportDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-lnc-bg transition-colors flex items-center justify-between group"
                    >
                      <span>{t('dashboard.exportCSV')}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Compact Filters */}
        <div className="bg-white sticky top-2 z-20 p-2 rounded-neo-sm shadow-neo-2 mb-4 flex flex-col sm:flex-row gap-3 justify-between items-center border-2 border-lnc-ink-black">

          {/* Compact Tabs */}
          <div className="flex p-1 gap-2">
            {['ALL', 'LEARNING', 'MASTERED'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`neo-tab text-[10px] py-1 px-3 ${filter === f
                    ? 'neo-tab-active'
                    : ''
                  }`}
              >
                {f === 'ALL' ? t('dashboard.filterAll') :
                  f === 'LEARNING' ? t('dashboard.filterLearning') :
                    t('dashboard.filterMastered')}
              </button>
            ))}
          </div>

          {/* Compact Search */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder={t('dashboard.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="neo-input w-full pl-8 pr-3 py-2 text-xs"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-lnc-ink-grey" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Compact Masonry Grid */}
        {filteredCollections.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4 pb-8">
            {filteredCollections.map(item => (
              <CollectionCard
                key={item.id}
                item={item}
                onOpen={() => setSelectedItem(item)}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-5xl mb-4 opacity-50">📭</div>
            <h3 className="text-lg font-bold text-gray-400">{t('dashboard.noItems')}</h3>
            <p className="text-sm text-gray-400 mt-1">{t('dashboard.noItemsHint')}</p>
          </div>
        )}

        {/* Detail Modal */}
        {selectedItem && (
          <DetailModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onUpdate={(updated) => {
              const newCollections = collections.map(c => c.id === updated.id ? updated : c);
              setCollections(newCollections);
              chrome.storage.local.set({ collections: newCollections });
              setSelectedItem(updated);
            }}
          />
        )}

      </div>

      {/* Footer */}
      {/* Footer */}
      <footer className="mt-8 py-6 text-center border-t-2 border-lnc-ink-black">
        <a
          href="https://near.ai/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-lnc-teal transition-colors font-medium"
        >
          {t('app.footer')}
        </a>
      </footer>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <DashboardContent />
    </LanguageProvider>
  </React.StrictMode>
);
