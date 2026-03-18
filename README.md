# 🍖 Todd's Grill and Bait

> A full-stack fake restaurant + bait shop website built as a learning project and portfolio piece. Features a public-facing site, a secure manager dashboard, and real AI integrations for review management and customer service chat.

[![Live Site](https://img.shields.io/badge/Live%20Site-todds--grill.toddtech.llc-orange?style=flat-square&logo=vercel)](https://todds-grill.toddtech.llc/)
[![Demo Dashboard](https://img.shields.io/badge/Demo%20Dashboard-read--only%20preview-yellow?style=flat-square&logo=vercel)](https://todds-grill-demo.toddtech.llc/)
[![GitHub](https://img.shields.io/badge/GitHub-reclinerhead%2Ftodds--grill--react-181717?style=flat-square&logo=github)](https://github.com/reclinerhead/todds-grill-react)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

---

## 🛠 Tech Stack

| Layer               | Technology                                                                        |
| ------------------- | --------------------------------------------------------------------------------- |
| **Framework**       | [Next.js 16](https://nextjs.org/) (App Router, Server Components, Server Actions) |
| **Language**        | TypeScript 5                                                                      |
| **Styling**         | Tailwind CSS v4                                                                   |
| **Database & Auth** | [Supabase](https://supabase.com/) — PostgreSQL, Auth, Storage, Row Level Security |
| **AI**              | [Vercel AI SDK 6](https://sdk.vercel.ai/) + xAI (Grok)                            |
| **Rate Limiting**   | Upstash Redis + `@upstash/ratelimit`                                              |
| **Spam Protection** | hCaptcha                                                                          |
| **Deployment**      | [Vercel](https://vercel.com/)                                                     |
| **Analytics**       | Vercel Analytics                                                                  |

---

## ✨ Key Features

### Public Site

- **Home** — Hero, stats bar, featured menu preview, contact form
- **Menu** — Full menu grid with images, descriptions, and pricing
- **Gallery** — Photo lightbox with lazy loading
- **Reviews** — Customer review grid with star ratings and manager replies
- **AI Chat** — On-site assistant that knows the menu and restaurant details

### Secure Manager Dashboard

Protected via Next.js middleware + role-based access control (`profiles` table, `role = 'admin'`). The service role key is intentionally absent — all operations use session-scoped Supabase clients with RLS enforcement.

- **Menu Manager** — Add, edit, delete menu items; assign and upload item images
- **Gallery Manager** — Upload and delete gallery photos via Supabase Storage
- **Review Manager** — The centerpiece feature:

  | AI Capability                     | Description                                                                                        |
  | --------------------------------- | -------------------------------------------------------------------------------------------------- |
  | 🧠 **Sentiment Analysis**         | Every review is automatically scored and labeled (positive / neutral / negative)                   |
  | 🚨 **Abuse / Toxicity Detection** | Flags reviews containing inappropriate content for moderation                                      |
  | ✍️ **Auto-Reply Generation**      | Generate a manager reply in multiple tones: Friendly, Professional, Humorous, Empathetic, and more |
  | 💬 **Reply Editor**               | Edit AI drafts, post replies, and manage response threads                                          |

## Screenshots

<image-card alt="Public Main Page" src="/screenshots/screen1.png" ></image-card>
<image-card alt="Public Gallery" src="/screenshots/screen2.png" ></image-card>
<image-card alt="Customer Service Agent Chat" src="/screenshots/screen3.png" ></image-card>
<image-card alt="Management Dashboard Overview" src="/screenshots/screen4.png" ></image-card>
<image-card alt="Review Manager with AI Reply" src="/screenshots/screen5.png" ></image-card>

### Security

- Row Level Security on all Supabase tables
- Storage bucket policies: public read, admin-only write
- `profiles` table used for role checks — no hardcoded email authorization
- Rate limiting on the AI chat endpoint via Upstash Redis
- hCaptcha on the review submission form

---

## 🚀 Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/reclinerhead/todds-grill-react.git
cd todds-grill-react

# 2. Install dependencies
npm install

# 3. Copy and fill in environment variables
cp .env.example .env.local

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Environment Variables

Create a `.env.local` file in the root of the project:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# xAI (Grok) — for AI review features and chat
XAI_API_KEY=your-xai-api-key

# Upstash Redis — for chat rate limiting
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token

# hCaptcha — spam protection on review form
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=your-hcaptcha-site-key
HCAPTCHA_SECRET_KEY=your-hcaptcha-secret

# Demo mode — set to "true" to skip auth and block all writes
IS_DEMONSTRATION_MODE=false
```

> **Note:** `SUPABASE_SERVICE_ROLE_KEY` is intentionally not used. All database access goes through session-scoped clients with RLS — no admin bypass.

---

## 📦 Dependencies

### Production

| Package                                   | Purpose                                |
| ----------------------------------------- | -------------------------------------- |
| `next` / `react` / `react-dom`            | App framework and rendering            |
| `@supabase/ssr` + `@supabase/supabase-js` | Database, auth, and storage            |
| `ai` + `@ai-sdk/xai` + `@ai-sdk/react`    | Vercel AI SDK with xAI (Grok) provider |
| `@upstash/ratelimit` + `@upstash/redis`   | Rate limiting on AI chat route         |
| `@hcaptcha/react-hcaptcha`                | CAPTCHA for review form                |
| `zod`                                     | Schema validation for Server Actions   |
| `date-fns`                                | Date formatting                        |
| `lucide-react`                            | Icon library                           |
| `sonner`                                  | Toast notifications                    |
| `yet-another-react-lightbox`              | Gallery lightbox                       |
| `@vercel/analytics`                       | Page view analytics                    |

### Dev

| Package                                   | Purpose           |
| ----------------------------------------- | ----------------- |
| `tailwindcss` v4 + `@tailwindcss/postcss` | Utility-first CSS |
| `typescript`                              | Type safety       |
| `eslint` + `eslint-config-next`           | Linting           |

---

## ☁️ Deployment

This project is deployed on **Vercel** with automatic deployments from the `main` branch.

1. Push the repo to GitHub
2. Import the project in [Vercel](https://vercel.com/new)
3. Add all environment variables from the table above in the Vercel project settings
4. Deploy — Vercel handles the rest

---

## 🎭 Demo Mode

Visiting [todds-grill-demo.toddtech.llc](https://todds-grill-demo.toddtech.llc/) activates **Demo Mode**, designed for recruiters and portfolio reviewers who want to explore the manager dashboard without logging in.

**How it works:**

- The Next.js middleware detects the hostname (`x-forwarded-host` for Vercel compatibility) or the `IS_DEMONSTRATION_MODE=true` env var
- Authentication is bypassed entirely — no login required
- All write operations are blocked at the UI layer:
  - Save / delete buttons are disabled or hidden
  - Upload sections are hidden
  - Review replies cannot be posted
- **AI features remain fully interactive** — sentiment analysis, abuse detection, and reply generation all work so visitors can see the AI capabilities in action
- A yellow demo banner is shown in the site header

This approach means the live production site is completely unaffected by demo traffic.

---

## 📓 Learning Notes / Future Ideas

This project was built to learn and practice:

- **Next.js App Router** — Server Components, Server Actions, middleware, route handlers
- **Supabase Auth + RLS** — Secure, policy-driven data access without a custom backend
- **Vercel AI SDK** — Streaming responses, structured output, multi-step AI pipelines
- **TypeScript** at scale across server and client boundaries
- **Multi-environment deployments** — Same codebase, different behavior per hostname

**Ideas for future exploration:**

- Add user manager to add other managers/owners via the web UI
- Add reservation system
- Real-time review notifications with Supabase Realtime
- Mobile app shell with Expo + same Supabase backend
- End-to-end tests with Playwright
