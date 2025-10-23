import json, os, boto3, time, uuid
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
    # AppSync Lambda resolver event structure
    args = event.get('arguments', {})
    conversation_id = args.get('conversationId') or f"conv-{uuid.uuid4().hex[:8]}"
    content = args.get('content') or ''
    identity = event.get('identity') or {}
    user_id = identity.get('sub', 'anonymous')

    if not content.strip():
        return _message(conversation_id, 'assistant', 'Error: empty prompt')

    try:
        agent_arn = get_agent_arn()
    except Exception as e:
        return _message(conversation_id, 'assistant', f'SSM error: {e}')

    # Invoke AgentCore runtime (non-streaming for now). The Python helper returns an iterable of bytes chunks.
    try:
        payload_bytes = json.dumps({"prompt": content}).encode('utf-8')
        response = agentcore.invoke_agent_runtime(agentRuntimeArn=agent_arn, payload=payload_bytes)
    except Exception as e:
        return _message(conversation_id, 'assistant', f'Agent invocation failed: {e}')

    assembled = []
    for chunk in response.get('response', []):
        try:
            text = chunk.decode('utf-8') if isinstance(chunk, (bytes, bytearray)) else str(chunk)
            assembled.append(text)
        except Exception:
            assembled.append(str(chunk))

    final_text = ''.join(assembled).strip() or 'No response from agent'
    return _message(conversation_id, 'assistant', final_text)


def _message(conversation_id: str, role: str, content: str):
    return {
        'id': f"{conversation_id}-{int(time.time()*1000)}",
        'conversationId': conversation_id,
        'role': role,
        'content': content,
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    }
