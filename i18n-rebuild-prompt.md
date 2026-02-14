# Prompt for Rebuilding i18n Feature

**Role:** Act as a Senior TypeScript Developer specializing in Chrome Extensions (Manifest V3).

**Objective:** Implement a robust, comprehensive Internationalization (i18n) system for the "LNC Learn" Chrome Extension to support **English, Vietnamese, Chinese, Japanese, and German**.

**Implementation Steps:**

1.  **Infrastructure Setup**:
    *   Create a `src/lang/` directory.
    *   Create 5 JSON files (`en.json`, `vi.json`, `zh.json`, `ja.json`, `de.json`) to store key-value translation pairs.
    *   Initialize `en.json` with a nested structure (e.g., `app`, `quiz`, `settings`, `errors`, `contextMenus`).

2.  **State Management (Context API)**:
    *   Create `src/contexts/LanguageContext.tsx`.
    *   Implement a `LanguageProvider` that:
        *   Loads the saved language from `chrome.storage.local` (key: `uiLanguage`) on mount.
        *   Listens for storage changes to sync state across tabs/windows.
        *   Provides a safe `t(key)` function that splits string paths (e.g., `'quiz.title'`) and always falls back to English if a translation is missing.
    *   Export a `useTranslation` hook for components to use.

3.  **Component Refactoring**:
    *   Wrap `main.tsx` (or `App` root) and `Dashboard` root with `LanguageProvider`.
    *   **Settings UI**: Update `Settings.tsx` to include a `<select>` dropdown for changing the UI language.
    *   **Deep Audit**: Systematically replace **every** hardcoded user-facing string with `t()` calls in:
        *   `App.tsx` (Titles, Error states)
        *   `Onboarding.tsx` (Welcome flows)
        *   `Quiz.tsx` (Questions, buttons, scores)
        *   `ResultArea.tsx`, `ContextArea.tsx` (Placeholders, labels)
        *   `CollectionCard.tsx`, `DetailModal.tsx` (Tooltips, actions)

4.  **Background Script Integration (Critical)**:
    *   Refactor `src/background.ts`.
    *   Implement logic to update `chrome.contextMenus` items (e.g., "Learn with LNC Learn") whenever the language changes.
    *   **Note**: Since `background.ts` cannot use React Context, import the JSON files directly and implement a lightweight lookup helper. Ensure strict TypeScript types (avoid `any` where possible, or cast safely) to prevent build errors.

5.  **Final Verification**:
    *   Ensure strict type safety (no `TS2345` errors).
    *   Verify `npm run build` completes successfully.
    *   Ensure absolutely zero hardcoded strings remain in the UI (check tooltips, hidden error messages, and aria-labels).

***

**Why this prompt works:**
*   It explicitly handles the **Background Script**, which is the trickiest part of i18n in Chrome Extensions (since it runs outside React).
*   It mandates **Fallback Logic**, preventing the app from crashing if a translation is missing.
*   It specifies **Storage Persistence**, ensuring the user's language choice is remembered.
