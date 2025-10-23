import { NextResponse } from "next/server";
import { spawn } from 'child_process';
import path from 'path';

interface ChatRequestBody {
  message?: string;
  conversationId?: string;
}

export async function POST(request: Request) {
  let payload: ChatRequestBody;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const prompt = payload.message?.trim();
  if (!prompt) return NextResponse.json({ error: "Message is required." }, { status: 400 });

  try {
    // Spawn the Python streaming invoker. The Python script reads a JSON payload from stdin
    // Use absolute path from project root
    const scriptPath = path.join(process.cwd(), '..', '..', 'agentcore_agents', 'invoke_agent_stream.py');
    const py = spawn('python3', [scriptPath], {
      stdio: ['pipe', 'pipe', 'inherit']
    });

    // Write the payload to the python process
    py.stdin.write(JSON.stringify({ prompt }));
    py.stdin.end();

    // Collect stdout lines (each line is a JSON object: { chunk: text })
    let buffer = '';
    const chunks: string[] = [];

    for await (const chunk of py.stdout) {
      buffer += chunk.toString('utf8');
      let idx: number;
      while ((idx = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 1);
        if (!line) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed && typeof parsed.chunk === 'string') {
            chunks.push(parsed.chunk);
          } else {
            chunks.push(String(parsed));
          }
        } catch {
          // fallback: push raw line
          chunks.push(line);
        }
      }
    }

    // Wait for process to exit
    await new Promise((resolve, reject) => {
      py.on('close', (code) => {
        if (code === 0) resolve(null);
        else resolve(null); // even on non-zero, we'll return whatever we captured
      });
      py.on('error', (err) => reject(err));
    });

    const assistantText = chunks.join('');
    return NextResponse.json({ message: assistantText ?? null, conversationId: payload.conversationId ?? null });
  } catch (e) {
    console.error("Chat backend error:", e);
    return NextResponse.json({ error: "Assistant service error." }, { status: 502 });
  }
}
