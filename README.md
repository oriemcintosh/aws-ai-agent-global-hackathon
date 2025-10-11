# AWS AI Global Hackathon — Submission (work in progress)

This repository contains the beginning of my submission for the AWS AI Global Hackathon.

This project implements an AI agent runtime (Python) and a Next.js frontend to interact with the agent.

Quick contents
--------------
- `agentcore_agents/` — helper scripts and a minimal test agent (see `agentcore_agents/README` for details).
- `main.py` — (optional) agent runtime entrypoint if present.
- `frontend/academia-agent` — Next.js frontend (App Router + Tailwind).
- `Dockerfile` — container image build instructions.
- `uv.lock` — Python lockfile for reproducible installs.

Getting started (development)
-----------------------------
Python (agent)

1. Create and activate a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate
```

2. Install Python dependencies (use your preferred tool). If you have a lockfile workflow, use `uv.lock`.

3. Run the agent (if available):

```bash
python main.py
```

Frontend (Next.js)

1. Change into the frontend folder and install dependencies with pnpm:

```bash
cd frontend/academia-agent
pnpm install
```

2. Start the dev server:

```bash
pnpm run dev
```

3. Open http://localhost:3000 in your browser.

## What I added in the frontend

- Chat UI: `app/page.tsx` contains a client-side chat interface (message list, input composer, send button). The current implementation uses a small mock response handler — swap it for your backend/LLM API.
- Responsive behavior: mobile-first layout, autosizing textarea, Enter to send / Shift+Enter for newline, and a mobile instruction bar for clarity.
- Theme: `app/globals.css` defines a `.theme-purple` token set and Tailwind-friendly variables; `app/layout.tsx` applies `theme-purple` by default.
- Favicon: book-themed favicons were added under `public/` and wired in `app/layout.tsx`.

## AgentCore agents

This repo includes example AgentCore helper scripts in `agentcore_agents/`:

- `agentcore_agents/invoke_agent.py` — small helper that invokes a deployed AgentCore runtime using the AWS SDK (boto3). It expects the environment variable `AGENT_ARN` to be set to the agent runtime ARN. Example:

```bash
export AGENT_ARN="arn:aws:..."
python agentcore_agents/invoke_agent.py
```

- `agentcore_agents/test_agent/test_agent.py` — a minimal local agent example using `bedrock_agentcore` and a `strands.Agent` wrapper. It defines an `invoke` entrypoint and runs a small local app when executed. Use it as a lightweight local test harness.

## Required environment & AWS credentials

- `AGENT_ARN` must be set for `invoke_agent.py`.
- `boto3` uses your configured AWS credentials. Make sure you have a valid AWS profile or environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION) configured.

> [!CAUTION]

> **Security Note:** Do not commit credentials or `.env` files to the repository. Use secrets managers or CI environment variables for deployment.

## Developer notes & tips

- Replace the mock assistant logic in `app/page.tsx` with a real API call to your backend or an LLM provider. The UI uses a message array shape: `{ id, role, text }`.
- If you see an old favicon after changing icons, do a hard refresh (Ctrl/Cmd+Shift+R), clear site data in DevTools, or open an incognito window.
- For runtime theme toggling consider adding `next-themes` and toggling a class on `<html>` (the app already uses CSS variables so toggling is straightforward).

## Git and workspace notes

- The frontend uses pnpm; `.gitignore` was updated with Node/pnpm/Next.js ignores and local `.env` patterns. Do not commit secrets.

## Next steps (suggested)

- Hook the frontend Send button to your agent backend (HTTP/WebSocket) to stream model responses.
- Add authentication and session handling for user-specific state.
- Add basic automated tests for the frontend and linting in CI.

## License

This project is licensed under the Apache License 2.0 — see [LICENSE](./LICENSE).

## Contributing

Contributions welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.
