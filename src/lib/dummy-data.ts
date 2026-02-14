import type { AgentType } from './agents';

export const DUMMY_RESPONSES: Record<AgentType, any> = {
  LINGUIST: `[DUMMY] This is a simulated translation.
  
Original: "Hello World"
Translated: "Xin chào thế giới" (Vietnamese)
  
(Note: Real AI is disabled in settings or .env)`,

  TUTOR: `[DUMMY] Here is a simple explanation using the Feynman Technique:

Imagine the concept like a library. The books are data, and the librarian is the algorithm finding exactly what you need.

- **Simple Analogy**: It's like finding a needle in a haystack, but with a magnet.
- **Key Point**: Efficiency matters.`,

  EXAMINER: {
    "questions": [
      {
        "id": 1,
        "question": "[DUMMY] What is the capital of France?",
        "options": ["London", "Berlin", "Paris", "Madrid"],
        "correctIndex": 2,
        "explanation": "Paris is the capital and most populous city of France."
      },
      {
        "id": 2,
        "question": "[DUMMY] Which language is this extension built with?",
        "options": ["Python", "Java", "TypeScript", "C++"],
        "correctIndex": 2,
        "explanation": "We use React + TypeScript for Chrome Extensions."
      },
      {
        "id": 3,
        "question": "[DUMMY] What implies 'Dummy Data'?",
        "options": ["Real API calls", "Static JSON", "Magic", "Quantum computing"],
        "correctIndex": 1,
        "explanation": "It returns pre-defined static data for testing UI."
      }
    ]
  },

  CRITIC: `[DUMMY] **Critical Analysis**

**Summary:** The text argues that cats are better than dogs.

**Counter-Arguments:**
1. **Loyalty**: Dogs have a history of working alongside humans for survival; cats do not.
2. **Utility**: Dogs can be trained for service, rescue, and protection.
3. **Social Bonding**: Pack mentality makes dogs more attuned to human emotions.

**Question to Ponder:**
*If independence is a virtue, why do we value the companionship of a pet?*`,
  ASSISTANT: `[DUMMY] **Assistant Response**

Based on the text provided, the main difference between the two approaches is the underlying philosophy of state management. 

*   **Approach A** favors immutability and explicit updates.
*   **Approach B** allows for mutable state with automatic tracking.

If you're building a large-scale application, Approach A might offer better predictability, while Approach B could be faster for rapid prototyping.`
};

export interface CollectionItem {
  id: string;
  url: string;
  domain: string;
  favicon?: string;
  title: string;
  selectedText: string;
  timestamp: number;
  masteryLevel: number; // 0-100
  hasQuiz: boolean;
  hasChat: boolean;
  notes?: string;
  agentType?: AgentType; // Keep for backward compat (tracks last active)
  result?: any;          // Keep for backward compat (tracks last result)
  results?: Partial<Record<AgentType, any>>; // Store all results per agent
  chatHistory?: any[]; // Using any[] to avoid circular dependency, but logically ChatMessage[]
}

export const DUMMY_COLLECTIONS: CollectionItem[] = [
  {
    id: 'c1',
    url: 'https://react.dev/learn',
    domain: 'react.dev',
    favicon: 'https://react.dev/favicon.ico',
    title: 'Quick Start – React',
    selectedText: 'React components are JavaScript functions that return markup:',
    timestamp: 1707330000000,
    masteryLevel: 75,
    hasQuiz: true,
    hasChat: true,
    agentType: 'EXAMINER',
    result: DUMMY_RESPONSES.EXAMINER,
    chatHistory: [
      { role: 'user', content: 'Can you verify this?' },
      { role: 'assistant', content: 'Yes, React components return JSX which compiles to JavaScript.' }
    ]
  },
  {
    id: 'c2',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures',
    domain: 'developer.mozilla.org',
    favicon: 'https://developer.mozilla.org/favicon.ico',
    title: 'Closures - JavaScript | MDN',
    selectedText: 'A closure is the combination of a function bundled together (enclosed) with references to its surrounding state (the lexical environment).',
    timestamp: 1707240000000,
    masteryLevel: 30,
    hasQuiz: false,
    hasChat: true,
    agentType: 'TUTOR',
    result: DUMMY_RESPONSES.TUTOR,
    chatHistory: []
  },
  {
    id: 'c3',
    url: 'https://tailwindcss.com/docs/utility-first',
    domain: 'tailwindcss.com',
    favicon: 'https://tailwindcss.com/favicon.ico',
    title: 'Utility-First Fundamentals - Tailwind CSS',
    selectedText: 'Traditionally, whenever you need to style something on the web, you write CSS.',
    timestamp: 1707150000000,
    masteryLevel: 0,
    hasQuiz: false,
    hasChat: false,
    agentType: 'LINGUIST',
    result: DUMMY_RESPONSES.LINGUIST
  },
  {
    id: 'c4',
    url: 'https://www.typescriptlang.org/docs/handbook/2/basic-types.html',
    domain: 'typescriptlang.org',
    favicon: 'https://www.typescriptlang.org/favicon.ico',
    title: 'TypeScript: Documentation - The Basics',
    selectedText: 'JavaScript’s shared runtime behavior is part of what makes it so flexible.',
    timestamp: 1707060000000,
    masteryLevel: 100,
    hasQuiz: true,
    hasChat: false,
    agentType: 'CRITIC',
    result: DUMMY_RESPONSES.CRITIC
  }
];
