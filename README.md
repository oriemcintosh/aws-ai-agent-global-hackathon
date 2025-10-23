# Academia Agent – AWS AI Global Hackathon Submission

Smart, explainable post‑secondary program guidance powered by AWS Bedrock AgentCore and a modern Next.js (App Router) interface.

**Status:** Working prototype (AppSync GraphQL + Python AgentCore Lambda). Focus: clear architecture, reproducibility, and extensibility for future streaming & personalization.

## 1. Problem & Solution Overview

Choosing a degree or certificate program involves balancing interests, geographic constraints, cost, and career return. Information is fragmented across university sites, PDFs, and ranking dashboards. The Academia Agent unifies retrieval + reasoning to produce structured, explainable recommendations (Markdown summaries with sources) through an AI conversation.

## 2. High-Level Architecture

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 15 (App Router), Tailwind | Chat UI, auth, markdown rendering, code block copy |
| Auth | Amazon Cognito (Amplify Gen 2 `auth`) | Secure user identity for AppSync & per-user sessions |
| API | AWS AppSync (GraphQL + subscriptions) | Mutation triggers agent invocation; subscription path (extensible) |
| Compute | Python Lambda (`python-agent-invoker`) | Invokes Bedrock AgentCore runtime (boto3) |
| AI Runtime | Bedrock AgentCore deployed runtime | Handles prompt orchestration and knowledge access |
| Config & Secrets | SSM Parameter Store | Stores `AGENT_ARN` runtime ARN securely |
| Dependencies | `pyproject.toml` + `uv.lock` / `package.json` + `pnpm-lock.yaml` | Reproducible Python & Node installs |

Current flow:
 
1. User authenticates (Cognito).
2. Chat mutation `sendMessage` → AppSync resolver → Python Lambda.
3. Lambda reads `AGENT_ARN` from SSM, calls `bedrock-agentcore.invoke_agent_runtime`.
4. Response chunks are assembled, returned as a `Message` object.
5. UI parses/normalizes markdown → renders (ReactMarkdown + GFM + code copy buttons).
 

Planned additions: streaming over subscriptions, conversation persistence (DynamoDB), semantic retrieval augmentation, cost estimation module.

## 3. Repository Structure

```text
agentcore_agents/           # Local AgentCore helpers & test harness
  invoke_agent.py           # Direct invoke helper (boto3)
  invoke_agent_stream.py    # Local streaming prototype
frontend/academia-agent/    # Next.js application (App Router)
  amplify/                  # Amplify Gen 2 backend definition
    backend.ts              # AppSync + Python Lambda wiring
    functions/python-agent-invoker/index.py  # Lambda handler
    graphql/schema.graphql  # Message, mutation, subscription
  app/                      # Pages & routes
  components/chat/          # Chat shell with markdown rendering
  package.json              # Frontend dependencies
  pnpm-lock.yaml            # Frontend lockfile
pyproject.toml              # Python dependencies
uv.lock                     # Python lockfile
```

## 4. Key Features

- Conversational guidance for academic program selection.
- Markdown response formatting (headings, tables, lists, code) with secure rendering.
- Clipboard copy for code blocks.
- Lazy Amplify client initialization avoids hydration race conditions.
- Python Lambda invocation of Bedrock AgentCore (no subprocess spawn needed now).
- Reproducible environment (uv + pnpm lockfiles).

## 5. Quick Start (Local Development)

Prerequisites: Node >= 18, Python >= 3.13, pnpm, uv (optional but recommended), AWS credentials with Bedrock AgentCore access.

Set Agent ARN (replace with your runtime ARN):

```bash
aws ssm put-parameter \
  --name /academia-agent/bedrock-agent-arn \
  --value "arn:aws:bedrock-agentcore:us-east-1:ACCOUNT:runtime/AGENT_RUNTIME_ID" \
  --type SecureString --overwrite --region us-east-1
```

Provision sandbox (AppSync + Lambda):

```bash
pnpm exec ampx sandbox --once
```

Run frontend:

```bash
pnpm dev
```

Open <http://localhost:3000>, sign up / sign in, start chatting.

## 6. Configuration Reference

| Variable | Where | Purpose |
|----------|-------|---------|
| `AGENT_ARN_PARAM` | Lambda env (default `/academia-agent/bedrock-agent-arn`) | SSM parameter name holding agent runtime ARN |
| `AWS_REGION` | Shell / Lambda | AWS region (us-east-1 default) |
| Cognito user pool outputs | `amplify_outputs.json` (auto) | Used by Amplify client auth |
| AppSync endpoint | `amplify_outputs.json` | GraphQL URL for mutation/subscription |

Lockfiles (`uv.lock`, `pnpm-lock.yaml`) are committed for reproducible builds.

## 7. Development Notes

### Frontend Chat (`ChatShell`)

- Uses GraphQL mutation `sendMessage` and (extensible) subscription `onMessageReceived`.
- Immediately renders mutation result while awaiting eventual streaming support.
- Markdown rendered via `react-markdown` + `remark-gfm` with custom components.

### Lambda Handler (Python)

`python-agent-invoker/index.py`:
 
- Fetches agent ARN from SSM once (in-memory cache).
- Calls `bedrock-agentcore.invoke_agent_runtime` and aggregates chunks.
- Returns a `Message` aligned with `schema.graphql`.
 

### Avoiding Common Pitfalls

- Do not delete `backend.addOutput()` (required for Amplify client auto-configure).
- Ensure `AGENT_ARN` SSM parameter exists before mutation tests.
- If responses return JSON wrappers, UI attempts to unwrap `result.content[].text` arrays.

## 8. Deployment (Outline)

Future production steps (not fully automated yet):
 
1. Replace sandbox with `ampx deploy` for persistent stacks.
2. Add DynamoDB tables for conversations & messages.
3. Introduce streaming (token-level) over subscriptions.
4. Add retrieval augmentation (vector store + course catalogs).
 

## 9. Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Auth errors on mutation | Not signed in | Re-authenticate; confirm Cognito pool deployed |
| Empty response content | Agent runtime not returning text nodes | Check Lambda logs for chunk assembly issues |
| Access denied on SSM | Missing IAM permission for `ssm:GetParameter` | Add policy statement or adjust role |
| GraphQL 401 errors | Amplify not configured yet | Ensure outputs exported via `backend.addOutput()` and client initialized lazily |

View Lambda logs via CloudWatch console (Log group for the function name) to debug runtime issues.

## 10. Roadmap

- Streaming token-level responses over AppSync subscription.
- Retrieval augmentation (vector store + course catalogs).
- Cost estimator (tuition + ROI metrics fusion) module.
- Personalized ranking based on user profile attributes.
- Accessibility enhancements (ARIA roles, screen reader flows).
- Observability: X-Ray segments + structured JSON logging.

## 11. Security & Compliance Highlights

- No credentials committed; uses SSM for runtime ARN.
- Cognito user pool enforces authenticated access to mutation.
- IAM policy currently broad for prototype (`resources: ['*']`) – will scope down.
- Future: add encryption at rest for conversation history and PII minimization.

## 12. Contributing

Pull requests welcome. For major changes open an issue describing motivation & design sketch.

## 13. License

Apache License 2.0 – see [LICENSE](./LICENSE).

> Hackathon Judge Notes: This prototype emphasizes clean layering (frontend/AppSync/Lambda/AgentCore), reproducible environments, and a clear path to streaming & retrieval. The minimal set of moving parts is intentional to showcase feasibility and leave room for iterative feature expansion.
