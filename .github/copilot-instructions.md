# Copilot Instructions: AWS AI Agent Hackathon Project

## Architecture Overview

This project implements an AI agent runtime for AWS Bedrock AgentCore with two deployment modes:
- **Remote deployment**: AWS Bedrock AgentCore runtime invoked via boto3 (`agentcore_agents/invoke_agent.py`)
- **Local testing**: Standalone agent using `strands.Agent` wrapper (`agentcore_agents/test_agent/test_agent.py`)

The agent entry point pattern: use `@app.entrypoint` decorator on an `invoke(payload)` function that extracts `payload.get("prompt")` and returns `{"result": agent_response.message}`.

## Key Technologies

- **Python 3.13+** with `uv` package manager (faster pip alternative)
- **bedrock-agentcore>=0.1.5**: AWS Bedrock AgentCore integration
- **strands-agents>=1.9.1**: Agent orchestration framework
- **boto3**: AWS SDK for invoking deployed agents
- **ruff**: Python linting and formatting
- **pnpm**: JavaScript package manager (for planned frontend)

## Essential Commands

**Setup & Dependencies:**
```bash
# Install dependencies with uv (preferred over pip)
uv pip install .

# Or with traditional venv workflow
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt  # if using pip
```

**Running Agents:**
```bash
# Local test agent (runs BedrockAgentCoreApp on port 8080/8000)
python agentcore_agents/test_agent/test_agent.py

# Invoke deployed agent (requires AGENT_ARN)
export AGENT_ARN="arn:aws:bedrock-agentcore:region:account:runtime/agent-id"
python agentcore_agents/invoke_agent.py
```

**Docker Build:**
```bash
# Build with OpenTelemetry instrumentation
docker build -t aws-agent .
# Note: Dockerfile expects a module named 'main' (main.py not present in current structure)
```

**Linting:**
```bash
ruff check .
ruff format .
```

## Project-Specific Patterns

**Agent Implementation Pattern** (see `test_agent.py`):
```python
from bedrock_agentcore import BedrockAgentCoreApp
from strands import Agent

app = BedrockAgentCoreApp()
agent = Agent(model='amazon.nova-micro-v1:0')

@app.entrypoint
def invoke(payload):
    user_message = payload.get("prompt", "Hello! How can I help you today?")
    result = agent(user_message)
    return {"result": result.message}
```

**AWS Agent Invocation** (see `invoke_agent.py`):
- Requires `AGENT_ARN` environment variable
- Payload must be JSON-encoded bytes: `json.dumps({"prompt": prompt}).encode()`
- Response is streamed chunks that need decoding: `''.join([chunk.decode('utf-8') for chunk in response["response"]])`

## Environment & Credentials

**Required Environment Variables:**
- `AGENT_ARN`: ARN of deployed AWS Bedrock AgentCore runtime
- `AWS_REGION`: AWS region (defaults to `us-east-1` in Dockerfile)
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`: AWS credentials for boto3

**Security:**
- Never commit `.env` files (covered by `.gitignore`)
- Use AWS IAM roles in production, not hardcoded credentials
- `.dockerignore` excludes sensitive files and tests from container builds

## Directory Structure

```
.
├── agentcore_agents/          # AgentCore helper scripts and examples
│   ├── invoke_agent.py        # Remote agent invocation via boto3
│   └── test_agent/
│       └── test_agent.py      # Local test agent with BedrockAgentCoreApp
├── Dockerfile                 # Container build (OpenTelemetry + uv)
├── pyproject.toml             # Python dependencies and project metadata
└── uv.lock                    # Lockfile for reproducible installs
```

## Frontend Integration (Planned)

README mentions a Next.js frontend at `frontend/academia-agent` (not yet in repo):
- App Router + Tailwind CSS
- Chat UI with message shape: `{ id, role, text }`
- pnpm package manager
- Theme system with CSS variables (`.theme-purple`)
- Expected to call agent backend via HTTP/WebSocket

## Common Pitfalls

1. **Missing main.py**: Dockerfile references `python -m main` but no `main.py` exists in root. Create `main.py` or update CMD to reference actual entry point.
2. **AGENT_ARN not set**: `invoke_agent.py` raises `EnvironmentError` if missing. Always export before running.
3. **uv vs pip**: This project uses `uv` for faster installs. Use `uv pip install` not `pip install` directly.
4. **Docker COPY duplication**: Dockerfile has two `COPY . .` commands (lines 9 and 36) - the second overwrites the first.

## Testing & Development

- No formal test suite currently present (tests excluded from Docker builds via `.dockerignore`)
- Use `test_agent.py` for local development and testing
- Ruff is configured in dependencies but no custom config in `pyproject.toml` yet
