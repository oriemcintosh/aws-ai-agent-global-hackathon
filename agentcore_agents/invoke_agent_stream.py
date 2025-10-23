#!/usr/bin/env python3
import sys
import json
import os
import boto3

def main():
    agent_arn = os.environ.get("AGENT_ARN")
    if not agent_arn:
        print(json.dumps({"error": "AGENT_ARN not configured on server"}))
        sys.exit(1)

    # Read entire stdin as JSON
    try:
        raw = sys.stdin.read()
        payload = json.loads(raw) if raw else {}
    except Exception as e:
        print(json.dumps({"error": f"Invalid input JSON: {e}"}))
        sys.exit(1)

    prompt = payload.get("prompt", "")
    if not prompt:
        print(json.dumps({"error": "prompt missing"}))
        sys.exit(1)

    client = boto3.client('bedrock-agentcore')
    # Prepare payload as bytes
    pb = json.dumps({"prompt": prompt}).encode('utf-8')

    try:
        resp = client.invoke_agent_runtime(agentRuntimeArn=agent_arn, payload=pb)
    except Exception as e:
        print(json.dumps({"error": f"invoke_agent_runtime failed: {e}"}))
        sys.exit(1)

    # response['response'] is expected to be iterable of bytes chunks
    for chunk in resp.get('response', []):
        try:
            text = chunk.decode('utf-8')
        except Exception:
            # if it's already str
            text = str(chunk)
        # Write each chunk as a JSON string line so the Node SSE proxy can stream it
        sys.stdout.write(json.dumps({"chunk": text}) + "\n")
        sys.stdout.flush()

if __name__ == '__main__':
    main()
