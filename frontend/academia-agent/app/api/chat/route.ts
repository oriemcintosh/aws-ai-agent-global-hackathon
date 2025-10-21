import { NextResponse } from "next/server";
import { sendMessageToAcademia } from "@/lib/amplifyClient";

interface ChatRequestBody {
  message?: string;
  conversationId?: string;
  authToken?: string;
}

export async function POST(request: Request) {
  let payload: ChatRequestBody;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const prompt = payload.message?.trim();

  if (!prompt) {
    return NextResponse.json(
      { error: "Message is required." },
      { status: 400 }
    );
  }

  if (!payload.authToken) {
    return NextResponse.json(
      { error: "Authentication token is required." },
      { status: 401 }
    );
  }

  try {
    const assistantText = await sendMessageToAcademia(payload.authToken, payload.conversationId, prompt);
    return NextResponse.json({ message: assistantText ?? null, conversationId: payload.conversationId ?? null });
  } catch (e) {
    console.error("Chat backend error:", e);
    return NextResponse.json(
      { error: "Assistant service error." },
      { status: 502 }
    );
  }
}
