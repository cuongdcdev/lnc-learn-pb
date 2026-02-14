import { AGENTS } from './lib/agents';
import { generateCompletion } from './lib/near-ai';
import { DUMMY_RESPONSES } from './lib/dummy-data';
import type { ProcessRequest, PageContext } from './lib/types';
import en from './lang/en.json';

import vi from './lang/vi.json';
import zh from './lang/zh.json';
import ja from './lang/ja.json';

import de from './lang/de.json';
import ru from './lang/ru.json';
import uk from './lang/uk.json';

const languages: Record<string, typeof en> = { en, vi, zh, ja, de, ru, uk };

function t(key: string, lang: string = 'en'): string {
  const keys = key.split('.');
  let value: any = languages[lang] || languages['en'];
  
  for (const k of keys) {
    if (value && value[k]) {
      value = value[k];
    } else {
      return key; // key fallback
    }
  }
  return typeof value === 'string' ? value : key;
}


// Enable Side Panel on Action Click
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error("Failed to set panel behavior:", error));

// Create Context Menu on Install & Check Onboarding
chrome.runtime.onInstalled.addListener(async (details) => {
  const { uiLanguage } = await chrome.storage.local.get('uiLanguage');
  const currentLang = (uiLanguage || 'en') as string;

  // 1. Context Menu
  chrome.contextMenus.create({
    id: "open_full_page",
    title: t('contextMenus.openFullPage', currentLang),
    contexts: ["action"]
  });

  chrome.contextMenus.create({
    id: "lnc_process_selection",
    title: t('contextMenus.processSelection', currentLang),
    contexts: ["selection"]
  });

  // 2. Check Onboarding Status
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({ url: chrome.runtime.getURL("index.html#onboarding") });
  } else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
    // Optional: Check if we need to migrate or re-onboard
    const data = await chrome.storage.local.get("setupComplete");
    if (!data.setupComplete) {
      chrome.tabs.create({ url: chrome.runtime.getURL("index.html#onboarding") });
    }
  }
});

// Update Context Menus on Language Change
chrome.storage.onChanged.addListener((changes) => {
  if (changes.uiLanguage) {
    const newLang = changes.uiLanguage.newValue as string;
    chrome.contextMenus.update("open_full_page", { title: t('contextMenus.openFullPage', newLang) });
    chrome.contextMenus.update("lnc_process_selection", { title: t('contextMenus.processSelection', newLang) });
  }
});


// Handle Context Menu Clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "open_full_page") {
    chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
  } else if (info.menuItemId === "lnc_process_selection") {
    // Handle right-click selection (e.g. for PDF or restricted pages)
    const text = info.selectionText;
    if (!text) return;

    // Construct best-effort context (without DOM access)
    const context: PageContext = {
      url: tab?.url || "",
      domain: tab?.url ? new URL(tab.url).hostname : "",
      pageTitle: tab?.title || "",
      nearestHeader: null // Cannot get DOM header from background context menu click easily
    };

    // Save logic similar to content script message
    await chrome.storage.local.set({ 
      lastSelection: text,
      lastContext: context 
    });

    // Notify any open UI (Side Panel)
    let messageSent = false;
    try {
        await chrome.runtime.sendMessage({
            type: 'TEXT_SELECTED',
            payload: { text, context }
        });
        messageSent = true;
    } catch (e) {
        // Ignore error if no receiver (side panel closed)
    }

    // Open Side Panel
    if (tab?.id) {
       chrome.sidePanel.open({ tabId: tab.id })
         .catch(async (error) => {
             // Only fallback if we couldn't send the message (panel closed) AND couldn't open it
             if (!messageSent) {
                 console.error("Failed to open side panel, falling back to tab:", error);
                 const url = chrome.runtime.getURL("index.html");
                 const existingTabs = await chrome.tabs.query({ url: url });
                 if (existingTabs.length > 0 && existingTabs[0].id) {
                     chrome.tabs.update(existingTabs[0].id, { active: true });
                     // Ensure the existing tab gets the message too since it might not have been listening when we sent the first one?
                     // Actually if messageSent failed, it definitely wasn't listening.
                     // So we should send it again to this specific tab.
                     chrome.tabs.sendMessage(existingTabs[0].id, { 
                         type: 'TEXT_SELECTED', 
                         payload: { text, context } 
                     }).catch(() => {});
                 } else {
                     chrome.tabs.create({ url });
                 }
             }
         });
    }
  }
});

chrome.runtime.onMessage.addListener((message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  if (message.type === 'PROCESS_TEXT') {
    handleProcessText(message.payload)
      .then(response => sendResponse({ success: true, data: response }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true; // Keep channel open for async response
  }
  
  if (message.type === 'OPEN_SIDE_PANEL') {
    // 1. Save text and context to local storage
    if (message.payload?.text) {
      chrome.storage.local.set({ 
        lastSelection: message.payload.text,
        lastContext: message.payload.context 
      });
    }

    // 2. Try to open the side panel
    if (sender.tab?.id) {
       chrome.sidePanel.open({ tabId: sender.tab.id })
         .then(() => sendResponse({ success: true }))
         .catch((error) => {
           console.error("Failed to open side panel:", error);
           sendResponse({ success: false, error: error.message });
         });
       return true;
    }
  }
});



// Env constants
const DEMO_API_KEY = import.meta.env.VITE_DEMO_API_KEY || "";
const USE_DUMMY_DATA = import.meta.env.VITE_USE_DUMMY_DATA === 'true';

async function handleProcessText(payload: ProcessRequest['payload']) {
  let { agentType, text, lang, apiKey, userContext, context } = payload;
  
  // 1. Check for Dummy Data Mode FIRST
  if (USE_DUMMY_DATA) {
      console.log(`[Dummy Mode] Processing Request for ${agentType}`);
      console.log(`[Dummy Mode] Selected Text:`, text);
      console.log(`[Dummy Mode] Full Payload:`, payload);
      console.log(`[Dummy Mode] Language: ${lang}`)
    
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return DUMMY_RESPONSES[agentType];
  }

  // 2. Handle Demo API Key
  if (apiKey === 'DEMO_MODE') {
      apiKey = DEMO_API_KEY;
      if (!apiKey || apiKey.startsWith("sk-YOUR")) {
          throw new Error("Demo API Key is not configured in .env file.");
      }
  }

  const agent = AGENTS[agentType];

  if (!agent) {
    throw new Error(`Unknown Agent Type: ${agentType}`);
  }

  // Construct efficient prompt
  const systemPrompt = agent.system_prompt(lang, userContext, context);
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: text }
  ] as any; // Type assertion to bypass strict checking for now

  try {
    const response = await generateCompletion(apiKey, {
      model: agent.model,
      messages,
      temperature: agent.temperature,
      response_format: agent.response_format
    });

    const { content, rawRequest, rawResponse, chatId, modelId } = response;
    
    const verificationData = {
        rawRequest,
        rawResponse,
        chatId,
        modelId,
        apiKey
    };

    // Special handling for EXAMINER to ensure valid JSON
    if (agentType === 'EXAMINER') {
      try {
        // Sometimes models wrap JSON in markdown blocks even when told not to.
        const cleaned = content.replace(/\n/g, '').replace(/^\s*```json/, '').replace(/```\s*$/, '');
        const json = JSON.parse(cleaned);
        return {
            content: json,
            verification: verificationData
        };
      } catch (e) {
        throw new Error("Failed to parse Examiner JSON response: " + content);
      }
    }

    return {
        content,
        verification: verificationData
    };
  } catch (error) {
    console.error("Agent Execution Failed:", error);
    throw error;
  }
}

