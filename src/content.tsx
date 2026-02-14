import { createRoot } from 'react-dom/client';
import React, { useState, useEffect } from 'react';
import { FloatingButton } from './components/FloatingButton';
import './index.css';
import type { PageContext } from './lib/types';

// --- Context Extraction Logic ---

const findNearestHeader = (element: Node | null): string | null => {
  let current: Node | null = element;
  let depth = 0;
  const MAX_DEPTH = 5;

  while (current && depth < MAX_DEPTH) {
    // Check previous siblings
    let sibling = current.previousSibling;
    while (sibling) {
      if (sibling.nodeType === Node.ELEMENT_NODE) {
        const tagName = (sibling as Element).tagName;
        if (/^H[1-6]$/.test(tagName)) {
            return (sibling as HTMLElement).innerText.trim();
        }
      }
      sibling = sibling.previousSibling;
    }

    // Move up to parent
    current = current.parentNode;
    depth++;
  }
  
  return null;
};

const getPageContext = (selection: Selection): PageContext => {
  let nearestHeader: string | null = null;

  if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const startContainer = range.startContainer;
      // If text node, use parent
      const element = startContainer.nodeType === Node.TEXT_NODE ? startContainer.parentNode : startContainer;
      nearestHeader = findNearestHeader(element);
  }

  return {
    url: window.location.href,
    domain: window.location.hostname,
    pageTitle: document.title,
    nearestHeader: nearestHeader
  };
};


const ContentApp: React.FC = () => {
  const [selection, setSelection] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMousePos = React.useRef<{ x: number; y: number } | null>(null);

  const updatePosition = (instant = false) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.toString().trim().length === 0) {
      setSelection(null);
      setCoords(null);
      return;
    }

    const performUpdate = () => {
      const currentSel = window.getSelection();
      if (!currentSel || currentSel.isCollapsed || currentSel.toString().trim().length === 0) return;
      if (currentSel.rangeCount === 0) return;

      setSelection(currentSel.toString());
      
      let x, y;
      
      // If we have a recent mouse position, use it. Otherwise fallback to selection center.
      if (lastMousePos.current && !instant) {
        x = lastMousePos.current.x;
        y = lastMousePos.current.y - 30; // 30px above the mouse
      } else {
        const range = currentSel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;
        x = rect.left + rect.width / 2;
        y = rect.top - 30;
      }

      const padding = 20;
      x = Math.max(padding, Math.min(window.innerWidth - padding, x));
      y = Math.max(padding, Math.min(window.innerHeight - padding, y));

      setCoords({ x, y });
    };

    if (instant) {
      if (coords) performUpdate();
    } else {
      timeoutRef.current = setTimeout(performUpdate, 150);
    }
  };

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      // Small delay to ensure selection is processed
      setTimeout(() => updatePosition(false), 10);
    };

    const onSelectionChange = () => {
      // If selection is cleared, hide button immediately
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) {
        setSelection(null);
        setCoords(null);
      }
    };

    const onScrollOrResize = () => updatePosition(true);

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('selectionchange', onSelectionChange);
    document.addEventListener('scroll', onScrollOrResize, { capture: true, passive: true });
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('selectionchange', onSelectionChange);
      document.removeEventListener('scroll', onScrollOrResize, { capture: true });
      window.removeEventListener('resize', onScrollOrResize);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [coords]);

  const handleOpenPanel = async () => {
    const sel = window.getSelection();
    if (!selection || !sel) return;

    const context = getPageContext(sel);

    try {
      await chrome.runtime.sendMessage({
        type: 'OPEN_SIDE_PANEL',
        payload: { text: selection, context }
      });
    } catch (e) { console.error("Error", e); }
    
    chrome.runtime.sendMessage({
        type: 'TEXT_SELECTED',
        payload: { text: selection, context }
    });
  };

  if (!selection || !coords) return null;

  return (
    <div className="lnc-extension-root font-sans text-base text-gray-900">
      <FloatingButton 
        x={coords.x} 
        y={coords.y} 
        onOpen={handleOpenPanel} 
      />
    </div>
  );
};

// Mount to Shadow DOM
const host = document.createElement('div');
host.id = "lnc-learn-extension-host";
// Force high Z-index on the host itself to ensure it's not buried
host.style.position = "fixed";
host.style.zIndex = "2147483647";
host.style.top = "0";
host.style.left = "0";
host.style.width = "0";
host.style.height = "0";
host.style.display = "block";
// Append to documentElement for maximum safety (above body transforms)
(document.documentElement || document.body).appendChild(host);

const shadow = host.attachShadow({ mode: 'open' });
const rootContainer = document.createElement('div');
shadow.appendChild(rootContainer);

const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = chrome.runtime.getURL('lnc-quiz-extension.css');
shadow.appendChild(link);

const style = document.createElement('style');
style.textContent = `
  .neo-card { background: white; border-radius: 20px; border: 2px solid #18181B; box-shadow: 4px 4px 0px 0px #18181B; }
  .neo-btn { background: #FFB36B; color: #18181B; border-radius: 12px; border: 2px solid #18181B; padding: 0.5rem 1.5rem; font-weight: 800; box-shadow: 4px 4px 0px 0px #18181B; }
  @keyframes pop-in {
    0% { opacity: 0; transform: translate(-50%, -80%) scale(0.5); }
    100% { opacity: 1; transform: translate(-50%, -100%) scale(1); }
  }
  .animate-pop-in { animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
`;
shadow.appendChild(style);

createRoot(rootContainer).render(<ContentApp />);
