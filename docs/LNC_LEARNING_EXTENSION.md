
# PROJECT: LNC Learn - NEAR Private AI Learning Extension
# ROLE: Senior Full-stack Developer & Chrome Extension Specialist (Manifest V3)
# GOAL: Build a MVP Chrome Extension in 5 days for a Hackathon.

## 1. TECH STACK & CONSTRAINTS
- **Core:** React (Vite), TypeScript.
- **Manifest:** V3 (Service Workers).
- **Styling:** Tailwind CSS (configured for Claymorphism style - 3D floating effect) with interaction sounds.
- **State:** React Context API + `chrome.storage.local`.
- **AI Integration:** NEAR AI API (OpenAI-compatible endpoint), use the `openai` js library
- **Icons:** Lucide React.
- **Architecture:** "Router-Worker" Pattern (Background script routes tasks to specific AI Agent Configs).

## 2. KEY FEATURES & ARCHITECTURE
The extension helps users learn from any web text using 4 specialized AI Agents.

### A. The "Router-Worker" Architecture (Hybrid AI Model Strategy)

Instead of a single generic prompt, we use a **Router-Worker** pattern. The frontend sends an action (e.g., "QUIZ"), and the background script routes it to a specific Agent Config.

**Model Strategy:**
1.  **Workhorse (Speed & JSON):** Use **Qwen 2.5-32B-Instruct** (or 72B if 32B is unavailable). It is fast, multilingual (great for Vietnamese/Chinese), and follows JSON schemas strictly.
    * *Used for:* Translation, Explanation (Feynman), Quiz Generation.
2.  **Thinker (Reasoning):** Use **DeepSeek V3**. It has superior reasoning capabilities for complex analysis.
    * *Used for:* Devil's Advocate (Critical Thinking).

**Code Implementation Blueprint (`src/lib/agents.ts`):**

Create the `src/lib/agents.ts` file exactly with this structure to define the prompts and model config:

```typescript
export type AgentType = 'LINGUIST' | 'TUTOR' | 'EXAMINER' | 'CRITIC';

export interface AgentConfig {
  model: string;
  temperature: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' | 'text' };
  system_prompt: (lang: string) => string;
}

// NOTE: Verify exact model slugs with NEAR AI documentation. 
// These are placeholders based on common provider naming conventions.
const MODELS = {
  FAST: "Qwen/Qwen3-30B-A3B-Instruct-2507", // Updated to recommended Qwen model
  SMART: "deepseek-ai/DeepSeek-V3.1"
};



export const AGENTS: Record<AgentType, AgentConfig> = {
  // 1. THE LINGUIST (Translation)
  // Goal: Fast, accurate, no fluff.
  LINGUIST: {
    model: MODELS.FAST,
    temperature: 0.1,
    system_prompt: (lang) => `
      You are a professional translator. Translate the user's text into ${lang}.
      Rules:
      1. Preserve the tone and nuance of the original text.
      2. Do not explain the translation. 
      3. Output ONLY the translated text.
    `
  },

  // 2. THE TUTOR (Feynman Technique)
  // Goal: Simple, uses analogies.
  TUTOR: {
    model: MODELS.FAST,
    temperature: 0.5,
    system_prompt: (lang) => `
      Act as a compassionate tutor using the Feynman Technique.
      Explain the following text as if teaching a 12-year-old student.
      Rules:
      1. Use simple analogies from daily life to explain complex concepts.
      2. Avoid jargon. If unavoidable, explain it immediately.
      3. Keep the explanation concise (under 200 words).
      4. Output language: ${lang}.
    `
  },

  // 3. THE EXAMINER (Quiz & Cloze)
  // Goal: Strict JSON output for UI rendering.
  EXAMINER: {
    model: MODELS.FAST,
    temperature: 0.3,
    response_format: { type: "json_object" }, // CRITICAL for Qwen/Llama
    system_prompt: (lang) => `
      You are an exam creator. Analyze the text and generate a quiz.
      
      You must output a strictly valid JSON object matching this TypeScript interface:
      {
        "questions": Array<{
          "id": number,
          "question": string,
          "options": string[], // 4 options
          "correctIndex": number, // 0-3
          "explanation": string // Short reason why it's correct
        }>
      }

      Rules:
      1. Create 3 distinct multiple-choice questions based on the text.
      2. Ensure options are not ambiguous.
      3. Output ONLY valid JSON. Do not include markdown formatting like \`\`\`json.
      4. Language of questions/answers: ${lang}.
    `
  },

  // 4. THE CRITIC (Devil's Advocate)
  // Goal: Deep reasoning, critical analysis.
  CRITIC: {
    model: MODELS.SMART, // Using DeepSeek here for better reasoning
    temperature: 0.7,
    system_prompt: (lang) => `
      You are a critical thinker playing 'Devil's Advocate'. 
      Your goal is to challenge the user's confirmation bias.
      
      Analyze the text and provide:
      1. A brief summary of the author's main argument.
      2. Three (3) strong counter-arguments or potential flaws in logic.
      3. One thought-provoking question for the user to ponder.

      Format the output nicely with Markdown (bolding key points).
      Output language: ${lang}.
    `
  }
};

### B. User Flow
step 0. Onboarding screen: Introducing project + inform user that their data is safe since we cant read their data, leveraging NEAR AI infra (https://docs.near.ai/cloud/introduction) and guide user to inputs NEAR API Key & Language preference in a onboarding screen, for NEAR API Key, since this is a hackathon, i will provide a predefined API key, but user can change to their own key. just notice that this is a demo key for demo purpose, dont overuse this :D -> after everything is done, show a finish screen with short introduction about what user can do now.
1. **Highlight Text** -> Floating "LNC" Icon appears with following options: (Translate, Quiz, Feynman, Devil -  Radial Menu or List appears with options (Translate, Quiz, Feynman, Devil).
2. **Select Option** -> Side Panel opens (inject iframe or shadow DOM) -> Loading State -> Stream/Render Result. Since our extension leveraging NEAR AI Private infra, we need to show user that we cant know user data, and here is the proof - show tee verification proof, read docs here on how to: https://docs.near.ai/cloud/verification/model 

## 3. FILE STRUCTURE BLUEPRINT
Create the project structure based on this, feel free to change to match project requirements
/src
  /assets         (icons, images)
  /components
    /ui           (Button, Card, Spinner - all Claymorphism style)
    /sidebar      (The main result view)
    /floating     (The floating trigger button)
  /lib
    /near-ai.ts   (API client)
    /agents.ts    (The 4 Agents configuration & Prompts)
    /storage.ts   (Helper for chrome.storage)
  /locales        (i18n: en.json, vi.json, zh.json)
  background.ts   (Service worker, handles API calls to avoid CORS)
  content.tsx     (Handles text selection & mounting UI)
  options.tsx     (Settings page)
  manifest.json

---

## 4. EXECUTION PLAN (ASSIGNMENTS FOR AGENTS)

I need you to act as the **Lead Architect**. Break this down and execute in the following order.

### ➤ TASK 1: SCAFFOLDING & CONFIG (Agent: Infrastructure)
- Initialize a Vite + React + TypeScript project.
- Configure Tailwind CSS with a custom plugin/utility for "Claymorphism" (soft shadows, rounded corners).
- Create `manifest.json` with permissions: `storage`, `activeTab`, `scripting`, `sidePanel` (if used) or just content script injection.
- Set up the `src/locales` and `i18n` helper.

### ➤ TASK 2: CORE LOGIC & AI INTEGRATION (Agent: Backend/Logic)
- Create `src/lib/agents.ts`: Define the `AGENTS` constant object containing system prompts and model configs for all 4 agents (Linguist, Tutor, Examiner, Critic).
- Create `src/lib/near-ai.ts`: A robust fetch wrapper to call `https://cloud-api.near.ai/v1/chat/completions`.
- Implement `background.ts`: Listen for messages from Content Script, route them to the correct Agent in `agents.ts`, call API, and return the result. *Handle JSON parsing errors for the Examiner agent.*

### ➤ TASK 3: UI COMPONENTS (Agent: Frontend/UI)
- Create `ClayCard`, `ClayButton` components using Tailwind.
- Build `src/options.tsx`: A simple Setup screen to save API Key & Language to `chrome.storage`.
- Build `src/components/sidebar/ResultView.tsx`:
  - Handle "Loading" state (Skeleton UI).
  - Handle "Text" result (Markdown renderer).
  - Handle "Quiz" result (Interactive component: render question -> click option -> show feedback).

### ➤ TASK 4: CONTENT SCRIPT INJECTION (Agent: DOM Specialist)
- Implement `content.tsx`:
  - Add a `mouseup` listener to detect text selection.
  - Calculate coordinates to show the Floating Button near the text.
  - When Button clicked -> Open Sidebar (Inject React Root into a Shadow DOM to avoid CSS conflicts with the host page).

---

## START COMMAND:
**Please start with TASK 1 (Scaffolding). Generate the project structure, manifest.json, and the tailwind.config.js specifically optimized for Claymorphism.**
