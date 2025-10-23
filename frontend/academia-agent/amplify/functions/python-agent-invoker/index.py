import json
import os
import boto3
import time
import uuid
from datetime import datetime

ssm = boto3.client('ssm')
agentcore = boto3.client('bedrock-agentcore')

AGENT_ARN_PARAM = os.environ.get('AGENT_ARN_PARAM', '/academia-agent/bedrock-agent-arn')
_cached_agent_arn = None

def get_agent_arn():
    global _cached_agent_arn
    if _cached_agent_arn:
        return _cached_agent_arn
    resp = ssm.get_parameter(Name=AGENT_ARN_PARAM, WithDecryption=True)
    _cached_agent_arn = resp['Parameter']['Value']
    return _cached_agent_arn

def handler(event, context):
    """Lambda resolver for sendMessage(prompt: String!): Message!

    The updated GraphQL schema passes a single 'prompt' argument. We still
    synthesize a conversationId (ephemeral) so the client can group messages
    locally. In the future we can restore persistent conversations by adding
    an argument back to the schema.
    """
    args = event.get('arguments', {})
    prompt = args.get('prompt') or ''
    # Generate an ephemeral conversation id per invocation (keeps shape intact)
    conversation_id = f"conv-{uuid.uuid4().hex[:8]}"

    if not prompt.strip():
        return _message(conversation_id, 'assistant', 'Error: empty prompt')

    try:
        agent_arn = get_agent_arn()
    except Exception as e:
        return _message(conversation_id, 'assistant', f'SSM error: {e}')

    try:
        payload_bytes = json.dumps({"prompt": prompt}).encode('utf-8')
        response = agentcore.invoke_agent_runtime(agentRuntimeArn=agent_arn, payload=payload_bytes)
    except Exception as e:
        return _message(conversation_id, 'assistant', f'Agent invocation failed: {e}')

    assembled: list[str] = []
    for chunk in response.get('response', []):
        try:
            text = chunk.decode('utf-8') if isinstance(chunk, (bytes, bytearray)) else str(chunk)
            assembled.append(text)
        except Exception:
            assembled.append(str(chunk))

    final_text = ''.join(assembled).strip() or 'No response from agent'
    return _message(conversation_id, 'assistant', final_text)


def _message(conversation_id: str, role: str, content: str):
    # createdAt matches GraphQL schema's Message.createdAt (AWSDateTime)
    return {
        'id': f"{conversation_id}-{int(time.time()*1000)}",
        'conversationId': conversation_id,
        'role': role,
        'content': content,
        'createdAt': datetime.utcnow().isoformat(timespec='seconds') + 'Z',
    }
