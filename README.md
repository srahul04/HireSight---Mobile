# 🎯 HireSight — Mobile

> **The surgical AI-driven talent bridge.** An intelligent, dual-sided mobile ecosystem built with **React Native (Expo 54)** and **Supabase** designed to help tech talent optimize their job search and empower recruiters with automated, brutally honest intelligence.

This repository represents the mobile application for **HireSight**. It features a full **Candidate Suite** (resume audit, AI mock interviews, LaTeX builder, application tracker) and a **Recruiter Suite** (ATS deep-audit, AI JD generator, hiring pipeline tracking).

---

## 🚀 Key Features

### 👤 Candidate Experience (`app/(candidate)`)
*   **AI Mock Interviews (`mock-interview.tsx`)**: Real-time mock technical interviews powered by LLMs (Groq SDK) providing interactive, contextual feedback.
*   **ATS Scan & Resume Analysis (`analyze.tsx`)**: Upload a resume and get an instant ATS score, keyword density audit, and formatting suggestions.
*   **Interactive LaTeX Resume Builder (`latex-builder.tsx`)**: Build recruiter-ready LaTeX-formatted resumes directly in the app.
*   **Application Tracker (`tracker.tsx`)**: Trello-style pipeline to monitor job applications through Applied, Interviewing, Offered, and Rejected phases.
*   **LinkedIn Profile Optimizer (`linkedin.tsx`)**: AI audit tool that evaluates LinkedIn copy for maximum visibility.
*   **Browse Jobs (`browse-jobs.tsx`)**: Live search and filtering for active tech openings.

### 🏢 Recruiter Command Center (`app/(recruiter)`)
*   **Mission Admin Dashboard (`dashboard.tsx`)**: Real-time analytics tracking active listings, application velocity, and candidate metrics.
*   **Candidate Deep-Audit (`candidate-audit.tsx`)**: A "brutally honest" AI audit tool that analyzes resumes to bypass fluff, highlights red flags, and evaluates role-alignment.
*   **AI JD Forge (`jd-forge.tsx`)**: Enter a few bullet points to generate an optimized, inclusive, and ATS-tailored job description in seconds.
*   **Active Pipeline (`pipeline.tsx` / `candidates.tsx`)**: Manage and drag candidates through recruitment stages (Screening, Interview, Offer).

---

## 🛠️ The Tech Stack

*   **Core Framework**: [React Native](https://reactnative.dev/) with [Expo (SDK 54)](https://expo.dev/)
*   **Navigation**: [Expo Router v6](https://docs.expo.dev/router/introduction/) (File-based routing with tab and slot layouts)
*   **Database & Auth**: [Supabase JS Client](https://supabase.com/) (Real-time subscriptions, secure auth guards, and relational data vaulting)
*   **Styling System**: [NativeWind (v4)](https://www.nativewind.dev/) — Tailwind CSS utility styling designed specifically for React Native primitives.
*   **AI Orchestration**: [Groq SDK](https://github.com/groq/groq-sdk) (Ultra-fast LLM response times for interactive interviews and heavy resume analysis)
*   **Testing Suite**: [Jest](https://jestjs.io/) & [Jest-Expo](https://docs.expo.dev/develop/unit-testing/) (Transpiled module testing with React Test Renderer and snapshot validation)

---

## 📂 Project Architecture

The directory follows a highly modular, clean structure standard for Expo applications:

```text
hiresight-mobile/
├── app/                      # Expo Router File-Based Pages
│   ├── (candidate)/          # Candidate dashboard, tracker, mock-interviews
│   ├── (recruiter)/          # Recruiter cockpit, JD Forge, candidate audits
│   ├── _layout.tsx           # Global Root layout and context providers
│   └── index.tsx             # Entry gate (redirects based on role)
├── components/               # Shareable UI Primitives (Button, Inputs, Uploader)
│   └── __tests__/            # Jest component tests and snapshots
├── constants/                # Tailwind/NativeWind theme palette configurations
├── lib/                      # Core Services & Helpers
│   ├── AuthContext.tsx       # Supabase Session Provider & Role manager
│   ├── notifications.ts      # Client-side notification integrations
│   └── supabase.ts           # Initialized Supabase client instance
├── package.json              # Managed Expo dependencies
└── tailwind.config.js        # Design tokens
```

---

## ⚡ Getting Started (Local Development)

### Prerequisites
Make sure you have Node.js (v18+) and Git installed.

1.  **Clone the Repo and Navigate to Mobile**:
    ```bash
    git clone https://github.com/srahul04/HireSight---Mobile.git
    cd HireSight---Mobile/hiresight-mobile
    ```

2.  **Install Dependencies**:
    ```bash
    npm install --legacy-peer-deps
    ```

3.  **Environment Variables**:
    Create a `.env` file in the root of `hiresight-mobile/` (refer to `.env.example`):
    ```env
    EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
    EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    EXPO_PUBLIC_GROQ_API_KEY=your_groq_api_key
    ```

4.  **Boot Up the Expo Dev Server**:
    ```bash
    npm start
    ```
    *   Press `a` to run on an Android Emulator or connected physical device.
    *   Press `i` to run on an iOS Simulator.
    *   Press `w` to run on a web browser.

---

## 🧪 Testing System (Jest)

We use **Jest** and **`jest-expo`** to handle testing in this codebase. Because native code depends on physical device modules (which don't exist in standard Node.js), `jest-expo` mocks out these modules to prevent testing runtime crashes.

### Running Tests
To run the full suite:
```bash
npm test
```

To run Jest in watch mode (updates automatically as you write code):
```bash
npm run test -- --watch
```

### Writing a Component Test
Test files are saved under `__tests__` directories or named with `*-test.js`. Here is an example of a snapshot test written for our styling component:

```typescript
import * as React from 'react';
import renderer from 'react-test-renderer';
import { MonoText } from '../StyledText';

it('renders correctly and matches the visual baseline', () => {
  const tree = renderer.create(<MonoText>Snapshot test!</MonoText>).toJSON();
  expect(tree).toMatchSnapshot();
});
```
