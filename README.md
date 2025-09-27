# AWS AI Global Hackathon — Submission (work in progress)

This repository contains the beginning of my submission for the AWS AI Global Hackathon.

Summary
-------
This project is an initial implementation of an AI agent that integrates with AWS services. It includes the main entry points and build/dependency artifacts used during development.

Quick contents
--------------
- `main.py` — application entry point (agent runner)
- `invoke_agent.py` — helper to invoke the agent
- `uv.lock` — lockfile recording pinned dependencies for reproducible installs
- `Dockerfile` — container image build instructions

Getting started (development)
-----------------------------
1. Create a Python virtual environment and activate it:

```bash
python -m venv .venv
source .venv/bin/activate
```

2. Install dependencies (use your package manager). If you use a lockfile-aware tool, install from `uv.lock` to reproduce the environment.

3. Run the agent locally:

```bash
python main.py
```

Notes and guidance
------------------
- This repo is the start of the submission. Expect additional files, tests, and documentation to be added as the project progresses.
- `uv.lock` is included to enable reproducible installs for development and CI.
- Do NOT commit any secrets or `.env` files. Use environment variables or a secrets manager for production credentials.

Next steps
----------
- Add an `env.example` describing required environment variables.
- Add CI that installs from `uv.lock` and runs basic lint/tests.
- Flesh out the agent behavior and include a short demo script.

License
-------
This project is licensed under the Apache License 2.0 — see the included [LICENSE](./LICENSE) file for details. This license allows others to use, modify, and distribute the code, while preserving attribution and patent protections.

Contributing
------------
Contributions are welcome! If you'd like to collaborate, please read our [CONTRIBUTING.md](./CONTRIBUTING.md) for a short guide on how to get started, the PR checklist, and how to report issues.
