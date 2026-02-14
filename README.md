# LNC Learn Extension

LNC Learn is a powerful, privacy-first AI learning assistant Chrome extension. It transforms selected text into personalized learning experiences while ensuring data integrity via cryptographic TEE verification.

## 🚀 Key Features

- **Multi-Agent Intelligence**: Switch between AI agents tailored for specific tasks:
  - **Tutor**: Breaks down complex concepts with clear explanations.
  - **Examiner**: Generates interactive quizzes based on your reading.
  - **Linguist**: High-precision translation and grammar breakdown.
  - **Critic**: Challenges perspectives and provides peer-review style feedback.
- **Cryptographic Verification**: Proves your data was processed in a Secure Trusted Execution Environment (TEE) on NEAR Private AI Cloud.
- **Personalized Dashboard**: Track your collections, mastery levels, and chat history.
- **Tactile UI**: Stunning "Neo-Pop" / Claymorphism design for a premium feel.

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
