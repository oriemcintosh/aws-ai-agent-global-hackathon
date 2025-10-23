# Academia Agent

This is a local Bedrock AgentCore / Strands agent wrapper for the Academia Agent used during development.

## How to run

1. Create a Python virtual environment (recommended):

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r ../requirements.txt  # or install bedrock_agentcore and strands packages
```

1. Set AGENT_ARN if you want to call a remote Bedrock Agent runtime (not required for local Strands Agent):

```bash
export AGENT_ARN="arn:aws:bedrock-agentcore:region:account:runtime/agent-id"
```

1. Run locally:

```bash
python agent.py
```

## Notes

- The agent uses a default `amazon.nova-micro-v1:0` model. Change `model` in `agent.py` to override.
- This code assumes `bedrock_agentcore` and `strands` Python packages are installed.
