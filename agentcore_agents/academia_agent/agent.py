from bedrock_agentcore import BedrockAgentCoreApp
from strands import Agent
import boto3
import os

app = BedrockAgentCoreApp()

# Cache for system prompt (loaded once per Lambda cold start)
_system_prompt_cache = None

def get_system_prompt():
    """Load system prompt from SSM Parameter Store with caching."""
    global _system_prompt_cache
    if _system_prompt_cache is not None:
        return _system_prompt_cache
    
    param_name = os.environ.get('SYSTEM_PROMPT_PARAM', '/academia-agent/system-prompt')
    ssm = boto3.client('ssm')
    
    try:
        response = ssm.get_parameter(Name=param_name, WithDecryption=True)
        _system_prompt_cache = response['Parameter']['Value']
        return _system_prompt_cache
    except Exception as e:
        # Fallback to minimal safe prompt if SSM fails
        print(f"Warning: Failed to load system prompt from SSM: {e}")
        return "You are Academia Agent. Assist only with post-secondary education planning."

# Create an agent instance with a default model. Override model as needed.
# System prompt is loaded at runtime from SSM for security.
agent = Agent(
    model='amazon.nova-micro-v1:0',
    system_prompt=get_system_prompt()
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
