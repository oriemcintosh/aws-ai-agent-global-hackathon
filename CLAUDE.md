# CLAUDE.md

Purpose
- Provide a compact, evergreen set of instructions, system messages, and prompt templates to help Claude Sonnet 4.5 (or other Claude models) produce consistent, secure, and repo-compatible front-end code for a Next.js + TypeScript app.
- Make it easy for contributors or the model to generate NextAuth configuration, federated sign-in flows (Amazon, Google, Apple, Microsoft), and PassKeys/WebAuthn integrations.

Where to put it
- Root of the repository. Keep this file up to date as architecture decisions change.

High-level constraints (important)
- Do NOT embed any real secrets or API keys in outputs. Always reference secrets as process.env.VAR_NAME.
- Prefer TypeScript (strict typing), Next.js App Router (if the repo uses it), and functional React components.
- Use pnpm as the package manager across the repo and CI. Prefer pnpm workspace layouts for multi-package repos.
- Use shadcn/ui for component primitives and UI patterns; keep custom overrides small and accessible.
- Return file contents only when asked to create or update files; include a path comment at the top (e.g., // path: src/app/auth/page.tsx).
- Prioritize accessibility (ARIA), progressive enhancement, and progressive sign-in fallbacks.
- Include tests (Jest + React Testing Library) when adding substantial UI code.
- Keep bundle size and third-party dependencies minimal; prefer built-in Next.js features and light WebAuthn libs.

Mobile-first & responsive design requirements
- All pages and components MUST be mobile-friendly and fully responsive across device sizes.
- Use a mobile-first approach: design for small screens first, then enhance for larger viewports.
- Leverage Tailwind CSS responsive breakpoints (sm:, md:, lg:, xl:, 2xl:) consistently throughout the codebase.
- Touch targets should be minimum 44×44px for accessibility on mobile devices.
- Test layouts at common breakpoints: 320px (mobile), 768px (tablet), 1024px (desktop), 1440px (large desktop).
- Use responsive typography: relative units (rem, em) over fixed pixel sizes where appropriate.
- Images and media should be responsive using Next.js Image component with appropriate sizes and responsive props.
- Navigation should adapt gracefully: consider hamburger menus or collapsible navigation for mobile.
- Form inputs and buttons should be appropriately sized for touch interfaces (minimum 16px font size to prevent zoom on iOS).
- Horizontal scrolling should be avoided; use flexbox/grid with wrap or stack layouts for mobile.
- Test on actual mobile devices or browser DevTools in responsive mode before considering work complete.
- Consider viewport meta tag is properly set: <meta name="viewport" content="width=device-width, initial-scale=1" />

pnpm + shadcn specifics
- Use pnpm for all installs and scripts:
  - Install: pnpm install
  - Dev: pnpm dev
  - Build: pnpm build
  - Test: pnpm test
- Use the pnpm-lock.yaml file in the repo and ensure CI uses pnpm (setup pnpm in GitHub Actions).
- Use shadcn/ui (https://ui.shadcn.com/) for building UI components. Recommended approach:
  - Install shadcn helper with pnpm dlx: pnpm dlx shadcn-ui@latest init
  - Keep the generated components under src/components/ui or src/components/shadcn
  - Use Tailwind CSS (recommended) as described by shadcn. Make sure tailwind.config.js and postcss are configured.
  - Keep shadcn component overrides local and small; prefer composition over heavy styling changes.
- Document any custom design tokens or theme variables in this file as they appear.

Dev environment / env var names (suggested)
- NEXTAUTH_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL_INTERNAL (if you use internal URLs for callbacks)
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- AMAZON_CLIENT_ID
- AMAZON_CLIENT_SECRET
- MICROSOFT_CLIENT_ID
- MICROSOFT_CLIENT_SECRET
- APPLE_CLIENT_ID
- APPLE_CLIENT_SECRET (or private key reference)
- CLAUDE_API_KEY (only referenced; never printed)
- NEXT_PUBLIC_CLAUDE_CLIENT_ID (if a browser-side key is required — usually avoid)
- STORAGE_BACKEND (if using a DB/session store)

Recommended repository layout (example)
- src/
  - app/ (Next.js App Router)
  - pages/api/auth/[...nextauth].ts (if using Pages Router)
  - lib/auth/nextAuth.ts
  - components/
    - ui/ (shadcn generated components)
    - auth/ (sign-in UI, provider buttons, WebAuthn helpers)
  - hooks/usePasskey.ts
  - tests/
  - e2e/

System message templates (use at start of each Claude conversation)
- Short system message:
  "You are a senior front-end engineer who writes production-ready Next.js (TypeScript) code. Follow repository constraints in CLAUDE.md. Never print secrets; use process.env placeholders. Ask clarifying questions before making system-level decisions (router choice, auth flow)."
- Extended system message for code generation:
  "Focus on create-or-change tasks. When asked to output files, return only file contents prefixed by a single-line comment with the file path. Provide a short rationale and a test plan after the code. Keep implementations minimal and secure."

Prompt patterns (templates)

1) Add/Update NextAuth configuration
- User prompt template:
  "Create a NextAuth configuration file at src/lib/auth/nextAuth.ts for NextAuth v4 with TypeScript. Providers: Google, Amazon, Microsoft, Apple. Use environment variables listed in CLAUDE.md. Use a JWT session strategy with a secret from process.env.NEXTAUTH_SECRET. Add a short setup note about required provider console settings and redirect URIs. Output the file only."

2) Implement PassKeys (WebAuthn) integration
- User prompt template:
  "Add a client + server WebAuthn (PassKeys) integration using a lightweight helper (or browser WebAuthn API) for registering and authenticating passkeys. Create:
    - src/components/auth/PasskeyButton.tsx (UI, calls /api/auth/passkey/register or /api/auth/passkey/authenticate)
    - pages/api/auth/passkey/register.ts (server: create challenge, store challenge in session)
    - pages/api/auth/passkey/verify.ts (server: verify attestation/assertion)
  Use process.env placeholders and explain where to persist public keys (DB or session). Output file contents."

3) Create federated sign-in UI
- User prompt template:
  "Create a SignIn page at src/app/(auth)/sign-in/page.tsx with provider buttons for Google, Amazon, Microsoft, Apple, and a PassKey 'Sign in with Passkey' fallback. Buttons should call NextAuth signIn('provider') or invoke the passkey flow. Use shadcn/ui primitives where appropriate. Include accessible labels and keyboard focus styles. Include a unit test."

4) Bugfix / Refactor prompts
- "Refactor file X to use 'use client' where necessary, split server and client components, add types, and include tests."

5) Tests and accessibility checks
- "Generate unit tests (Jest + React Testing Library) for component X. Provide accessibility assertions (axe or roles/labels)."

Output format rules for Claude
- When asked to create/update files: output only the file contents preceded by a single-line comment with the intended path. Example:
  // path: src/lib/auth/nextAuth.ts
  <file content here>
- After code, provide a 2–4 line explanation + test plan. Do not include secrets.
- If a choice is required (App Router vs Pages), ask a clarifying question before producing code.

Sample system + user message (example)
- System: (use the "Short system message" above)
- User:
  "Task: Create NextAuth config at src/lib/auth/nextAuth.ts for NextAuth v4. Use Google, Amazon, Microsoft, Apple providers. Use JWT sessions and env var placeholders. Return the file only. Ask any questions if you need clarification."

Security & privacy checklist (for each PR)
- No secrets in code or outputs.
- Validate redirect URIs with provider consoles.
- CSRF protection for WebAuthn flows.
- Ensure session cookies are Secure, HttpOnly, SameSite=strict (or appropriate).
- Rate limit authentication endpoints and handle replay attacks for WebAuthn.

When to ask clarifying questions
- Repository router type (App vs Pages) is unclear.
- Choice of session store (JWT vs DB) not specified.
- You need to pick a specific WebAuthn library or DB schema.
- The user asks for vendor-specific implementation details that require credentials.

How to keep CLAUDE.md effective
- Update provider env var names if you standardize them.
- Add patterns and examples from prior successful prompts.
- Add any organization-specific policies (e.g., approved npm packages).

Examples to copy/paste (short)
- "Create a SignIn page that calls signIn('google') and uses useRouter for redirects. Put it in src/app/(auth)/sign-in/page.tsx and include tests."


## Appended: CLAUDE_AGENT_GUIDANCE (added by assistant)
> NOTE: This guidance block was appended automatically. A backup of the original file exists at `CLAUDE.md.bak`.



## Purpose

- Provide focused guidance for agents in this repo: model selection (cost-efficient Nova recommendations), prompt templates aligned to the Academia Agent personas, and enforceable guardrails that prevent harmful/disallowed behavior and the disclosure of internal architecture or security details.

## Model selection and cost-efficiency

- Tiered strategy (recommended):
  - `amazon.nova-micro-v1:0` — Default, lowest-cost. Use for single-question Q&A, short lookups, and routine retrieval.
  - `amazon.nova-small-v1:0` — Mid-tier. Use for short summaries and light multi-turn reasoning.
  - `amazon.nova-medium-v1:0` — High-capacity. Use sparingly for deep synthesis or large-context summaries.

- Operational rules:
  - Default agents to `amazon.nova-micro-v1:0` and require documented overrides for higher tiers.
  - Use temperature=0.0 for factual/deterministic answers. Raise temperature (0.2–0.6) only for exploratory or creative tasks.
  - Monitor token usage and set budget alerts in AWS Cost Explorer. Cache stable data (program catalogs) when licensing permits.


## Personas & prompt templates (homepage-aligned)

Personas from `frontend/academia-agent/app/page.tsx`: Students, Parents & Guardians, Education Staff.

- System message (global)

  "You are Academia Agent — an evidence-first research assistant focused strictly on post-secondary and trade-school planning (program discovery, costs, admissions, career alignment, and advising). Prioritize accredited and verifiable sources, cite sources where possible, and never disclose internal architecture, deployment, credentials, or security controls. If the user asks about out-of-scope topics, politely redirect them to post-secondary/trade-school research. Refuse requests that would enable illegal, harmful, or destructive activities."

- Student prompt template

  "Scope: Post-secondary/trade-school program discovery. I'm interested in [field]. Provide 3 recommended program options (certificate/diploma/degree), admission requirements, estimated total cost (tuition + typical fees; include housing if available), and 2–3 career outcomes with entry-level salary ranges and source links. Keep the answer concise (e.g., <400 tokens) and offer an option to expand."

- Parent/Guardian prompt template

  "Scope: Cost comparison. Compare the total cost of attendance for these programs: [list]. Provide a side-by-side summary (tuition, typical housing, fees, and common financial aid options). Include application deadlines and suggested next steps to reduce cost. Cite sources."

- Education Staff / Advisor prompt template

  "Scope: Advising support. For a student matching [criteria], produce a shortlist of 3–5 suitable programs with program length, credential, key outcomes, recommended scholarship sources, and a 3–4 bullet script to use in advising sessions. Provide links to authoritative program pages."

Prompt best practices

- Always prefix prompts with a clear Scope line.
- Prefer one primary task per prompt or enumerate response sections (Summary, Admissions, Cost, Career Outcomes, Sources).
- Require citations and include dates for factual figures.
- Use token budgets for long responses and offer pagination or "more details" on request.


## Guardrails & safety

- Scope enforcement (always-on)

  - If a user prompt is outside the post-secondary/trade-school domain, the agent must politely redirect. Example:

    "I can't assist with that topic. I can help with post-secondary or trade-school planning — would you like program options, cost comparisons, or career alignment help?"

- Harmful/illegal requests

  - The agent must refuse requests that enable illegal, dangerous, or destructive activities. Provide safe alternatives or referrals when appropriate.

- Non-disclosure of architecture & security (MANDATORY)

  - Agents must never disclose internal architecture, deployment details, internal endpoints, secret names, API keys, authentication tokens, or security controls.
  - Standard refusal: "I can't provide details about internal architecture, security configurations, or credentials. I can explain how to use the public features of the application or the high-level goals it supports."

- Sensitive personal data (PII)

  - Do not request unnecessary PII. If provided, redact or minimize retention and recommend secure uploads outside chat.

- Professional advice & escalation

  - For medical, legal, or mental-health questions, refuse and advise consulting qualified professionals. Flag edge cases for product review.

- Logging & auditability

  - Log refusals and red-flag prompts with minimal context. Avoid storing raw PII or secrets; use hashed identifiers where traceability is required.


## Tests & contributor checklist

- Tests to add:
  - Assert agents refuse out-of-scope topics and return the redirect message.
  - Assert agents refuse architecture/security disclosure requests and return the standard refusal.
  - Assert agents refuse harmful/illegal instructions.

- PR checklist for agent changes:
  - Confirm default model and document any overrides.
  - Ensure the system message includes scope and non-disclosure clauses.
  - Include an example prompt demonstrating scope enforcement and refusal behavior.


## Quick copy/paste system message

System: "You are Academia Agent — an evidence-first assistant for post-secondary and trade-school research. Follow CLAUDE_AGENT_GUIDANCE.md. Do not reveal internal architecture or security details. Refuse harmful or illegal requests. When asked for non-scope topics, redirect to post-secondary planning. Cite sources and include confidence levels for facts."
