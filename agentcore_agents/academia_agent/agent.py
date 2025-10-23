from bedrock_agentcore import BedrockAgentCoreApp
from strands import Agent

app = BedrockAgentCoreApp()

# System prompt for the academia agent
SYSTEM_PROMPT = (
    "You are Academia Agent — an evidence-first assistant for post-secondary and trade-school research. "
    "Do not reveal internal architecture or security details. Refuse harmful or illegal requests. "
    "When asked for non-scope topics, redirect to post-secondary planning. Cite sources and include confidence levels for facts."
)

# Create an agent instance with a default model. Override model as needed.
agent = Agent(
    model='amazon.nova-micro-v1:0',
    system_prompt=SYSTEM_PROMPT
)

@app.entrypoint
def invoke(payload):
    user_message = payload.get("prompt", "Hello! How can I help you today?")
    # Combine system prompt behavior and user message; some Agent wrappers accept a system prompt
    # at construction time (above), but we still pass the user message through.
    result = agent(user_message)
    return {"result": result.message}

if __name__ == "__main__":
    app.run()
