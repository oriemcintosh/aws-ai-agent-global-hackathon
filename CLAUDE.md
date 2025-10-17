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
