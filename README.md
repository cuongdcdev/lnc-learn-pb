# LNC Learn Extension

LNC Learn is a powerful, privacy-first AI learning assistant Chrome extension. It transforms selected text into personalized learning experiences while ensuring data integrity via cryptographic TEE verification.

## 🚀 Key Features

LNC Learn is built with a multi-agent system designed to fit every learning style:

- **👑 Context is King**: Automatically reads page metadata (Title, Domain, Headers) to provide precise, context-aware answers instead of generic AI responses.
- **🌍 The Translator**: Context-aware translation for language learners that avoids literal, robotic errors. Supports 7+ languages!
- **👶 Feynman Tutor**: Explains complex documents and technical jargon like you're 5 years old. Master any topic in minutes.
- **🛡️ Critique (Devil's Advocate)**: Challenges your biases with sharp counter-arguments, logical checks, and risk analysis.
- **✍️ The Examiner**: Instantly generates Active Recall quizzes to test your retention. No more passive reading!
- **💬 Never Lose Your Flow**: Every mode includes a persistent **Follow-up Chat**, turning static AI answers into dynamic discussions.
- **🔒 Cryptographic Privacy**: Powered by **NEAR Private AI**, your data is processed in a Secure Trusted Execution Environment (TEE). We provide cryptographic proof that your data remains yours.
- **🧠 Personal Knowledge Base**: Your "Learning Collection" automatically organizes everything you learn. Search, filter, and revisit your insights anytime.
- **🎨 AI Tailored to Your Mind**: Tell the AI who you are. Use specific personas, learning levels, or favorite analogies through custom instructions.
- **📇 Anki & LMS Export**: Turn your quizzes into flashcards instantly with Anki CSV or generic CSV exports.
- **🔓 No Vendor Lock-in**: Export your entire collection as JSON/CSV. Your data stays under your control.
- **🌐 Multilingual Support**: Fully localized for English, Vietnamese, Chinese, Japanese, Russian, Ukrainian, and German.

## 🛠 Setup the extension for users

- Download the latest release from the GitHub release page.
- Unzip the downloaded file.
- Open your Chromium-based browser (Chrome, Brave, Opera, etc.) and go to the **Extensions** page (`chrome://extensions`).
- Enable **Developer mode** in the top right corner.
- Click **Load unpacked** and select the unzipped extension folder.
- You're all set! 🚀

## 🛠 Technology Stack

- **Core**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **AI Infrastructure**: NEAR AI Cloud (Private Confidential Completions)
- **Crypto**: ethers.js (for signature verification)

## 📦 Getting Started

### Prerequisites

- Node.js (v18+)
- A NEAR AI Cloud API Key (Get it at [cloud.near.ai](https://cloud.near.ai))

### Installation

1. Clone the repository
2. Create a `.env` file based on `.env.example` and add your `VITE_DEMO_API_KEY`.
3. Install dependencies:
   ```bash
   npm install
   ```

### Development

Run the development server:
```bash
npm run dev
```

### Build

Build the extension for production:
```bash
npm run build
```
The build artifacts will be in the `dist/` directory. Load this directory into Chrome via `chrome://extensions/` (Developer Mode).

## 🛡 Verification

You can verify the cryptographic integrity of any AI interaction using the built-in script:
```bash
npx ts-node script/test-verification.ts
```

---
Built with ☀️ on NEAR.
