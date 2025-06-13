
# PrompTee - Collaborative Prompt Management Tool

> **PrompTee** is an innovative prompt‑management platform that makes creating, organising, and sharing prompts effortless for **individuals** and **teams**.  
> Built with a modern, serverless stack, it offers real‑time collaboration, robust authentication, and rapid continuous deployment.


## Table of Contents
1. [Features](#-features)
2. [Tech Stack](#-tech-stack)
3. [Project Structure](#-project-structure)
4. [Getting Started](#-getting-started)
5. [Running Tests](#-running-tests)
6. [CI / CD](#-ci--cd)
7. [Deployment](#-deployment)
8. [Roadmap](#-roadmap)
9. [Contributing](#-contributing)
10. [License](#-license)
11. [Acknowledgements](#-acknowledgements)

---

## Features
- **Intuitive Prompt Management** – create, categorise, clone, copy, edit, and delete prompts in seconds  
- **Real‑time Multi‑user Collaboration** – secure auth & live updates powered by **Supabase Realtime**  
- **Serverless Backend** – lightning‑fast APIs via **Netlify Functions** (Node 18)  
- **Prompt Export / Backup** – one‑click JSON or Markdown export  
- **Fuzzy Search & Filters** – instantly locate prompts by keyword, tag, token count, or favourite status  
- **Dark Mode** – automatic theme detection for eye‑friendly UX  
- **Comprehensive Tests** – unit & integration coverage with **Jest** & **React Testing Library**  
- **Continuous Deployment** – GitHub -> Netlify pipeline with preview builds on every PR  


## 🛠 Tech Stack
| Layer | Technologies & Tools |
|-------|----------------------|
| **Frontend** | React 18, Vite, **TypeScript**, JavaScript, HTML5, CSS3 / CSS Modules, Tailwind |
| **State Mgmt** | React Context API, Custom Hooks |
| **Backend / API** | Netlify Functions (Node.js 18), Express‑like Middleware, **Supabase Edge Functions** |
| **Database** | Supabase **PostgreSQL**, SQL, Row‑Level Security |
| **In-memory DB (testing)**  | **PG-Mem** in-memory PostgreSQL emulator with SQL | |
| **Authentication** | Supabase Auth (JWT, OAuth2 Google/GitHub/Magic Link) |
| **Testing** | Jest, React Testing Library, **Vitest** & **MSW** for API mocks |
| **CI / CD** | GitHub Actions, Netlify Continuous Deployment, Husky + lint‑staged |
| **Dev Tools** | ESLint, Prettier, Commitlint, npm | IntelliJ IDEA JetBrains AI Coding Assistant
| **Version Control** | Git & GitHub & GitBash |
| **DevOps & DX** | Docker (dev DB), VS Code Dev Containers, Conventional Commits |


## 📂 Project Structure
```text
src/
├── components/
│   ├── ChainConnector.jsx      # decorative dotted line between chained cards
│   ├── CustomDialog.jsx        # modal wrapper driven by DialogContext
│   ├── FavoritesToggle.jsx     # filter switch
│   ├── LoginForm.jsx           # Supabase email-magic-link auth UI
│   ├── PromptCard.jsx          # glass-style card + color selector
│   ├── PromptCard.css          # scoped styles for PromptCard
│   ├── PromptFormModal.jsx     # create / edit / view prompt modal
│   ├── PromptSidebar.jsx       # sidebar: filters, chains, export, logout
│   └── SearchFilters.jsx       # search box + category dropdown
├── context/
│   └── DialogContext.jsx       # global confirm / alert dialog provider
├── hooks/
│   ├── useAuth.js              # (WIP) higher-level auth helper
│   ├── useIdleTimeout.tsx      # auto-logout after X minutes of inactivity
│   ├── useProfile.ts           # fetch + cache user profile row
│   ├── usePromptData.js        # CRUD + caching for prompts / categories
│   ├── usePromptDump.ts        # export DOCX / JSON hook
│   ├── usePromptDump.test.js   # unit-test (if exists)
│   ├── useTokenCount.ts        # token count util (wrapper around gpt-3.5 est.)
│   └── useTokenCount.ts        # fast tokenizer approximation
├── utils/
│   ├── ChainModeToggle.jsx     # checkbox + <select> extracted from sidebar
│   ├── exportPrompts.tsx       # builds DOCX (sorted by category) or JSON
│   ├── promptFilter.ts         # client-side search / category / favorite filter
│   ├── promptService.ts        # Supabase service layer (CRUD helpers)
│   ├── promptService2.test.js  # edge-case unit-tests
│   └── tokenCounter.ts         # rough GPT token estimator (moved here)
├── lib/
│   └── inMemoryDb.js           # local mock repo (fallback without Supabase)
├── __tests__/                  # Vitest + RTL test suite
│   ├── exportPrompts.test.js
│   ├── favorite_fn.sql         # fixture for Supabase function test
│   ├── PromptCard.test.jsx
│   ├── PromptFormModal.test.jsx
│   ├── PromptSidebar.test.jsx
│   ├── promptService.test.js
│   └── promptService2.test.js
├── supabase/                   # SQL migrations / edge functions
│   └── (SQL & TypeScript edge-function files)
├── App.jsx                     # <Router> wrapper (could host routes later)
├── PromptApp.jsx               # main application once user is logged in
├── supabaseClient.js           # singleton Supabase browser client
├── main.jsx                    # React 18 entry (creates root)
├── index.css                   # Tailwind base + custom layers
├── setupTests.js               # Vitest global setup
└── vite.config.js              # Vite + Tailwind + alias config


```

## Getting Started

### Prerequisites
* **Node.js 18+**  
* **npm** or **pnpm**

### Installation
```bash
git clone https://github.com/your‑username/PrompTee.git
cd PrompTee
npm install   # or pnpm install
```

### Environment Variables
Create a `.env` in the project root:

```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON=<public‑anon‑key>
```

### Run Locally
```bash
npm run dev   # Vite dev server on http://localhost:5173
```

---

## 🧪 Running Tests
```bash
npm run test          # runs Jest & React Testing Library
npm run coverage      # generates coverage report
```

### i18n
All user-facing copy lives in `src/i18n/messages.en.json`. To add or edit text:
1. Update the appropriate key in that file.
2. Copy the file to `messages.<locale>.json` and translate the values to add a new language.
3. Reference strings in code via the `t(key)` helper.
4. Run `npm run lint:strings` to ensure no hard-coded text was introduced.

## 🧪 Production build
```bash
pnpm build && pnpm preview
```

---

## 🔄 CI / CD
| Stage | Tooling | Description |
|-------|---------|-------------|
| **Lint & Test** | GitHub Actions | PRs trigger lint + unit test jobs |
| **Build** | Netlify CI | Atomic deploys with preview URLs |
| **Release** | Semantic Release | Automated changelog & versioning |

---

## Deployment

PrompTee is built for **serverless** hosting. Push to `main` and Netlify:

1. Runs production build via `vite build`
2. Deploys static assets + Netlify Functions
3. Invalidates CDN cache

> **Tip:** Want a staging environment? Connect a second branch to a Netlify “context” and you’re set.

---

## Roadmap
- [x] ✅ i18n & localisation  
- [x] ✅ Login form with registration  
- [ ] Role-based access control  
- [ ] Prompt version history  
- [ ] VS Code extension  

Feel free to check the [issues](../../issues) page

---

## 🤝 Contributing
1. Fork the project  
2. Create your feature branch (`git checkout -b feat/amazing‑feature`)  
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)  
4. Push to your branch (`git push origin feat/amazing‑feature`)  
5. Open a Pull Request  

---

## 📜 License
Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

## Acknowledgements
- [React](https://react.dev)
- [Supabase](https://supabase.com)
- [Netlify](https://www.netlify.com)
- [Jest](https://jestjs.io)
- [GitHub Actions](https://github.com/features/actions)


<p align="center"><strong>Happy Prompting!☕️</strong></p>
