import json
import uuid
import boto3
import os
  
agent_arn = os.environ.get("AGENT_ARN")
if not agent_arn:
  raise EnvironmentError("Environment variable AGENT_ARN is not set. Set AGENT_ARN to the agent's ARN before running.")

prompt = "How can I add tools like time to you?"

# Initialize the AgentCore client
agent_core_client = boto3.client('bedrock-agentcore')
  
# Prepare the payload
payload = json.dumps({"prompt": prompt}).encode()
  
# Invoke the agent
response = agent_core_client.invoke_agent_runtime(
    agentRuntimeArn=agent_arn,
    payload=payload
)

content = []
for chunk in response.get("response", []):
    content.append(chunk.decode('utf-8'))
print(json.loads(''.join(content)))