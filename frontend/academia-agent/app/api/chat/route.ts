import { NextResponse } from "next/server";

interface ChatRequestBody {
  message?: string;
  conversationId?: string;
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

  const responseText = `Echoing: ${prompt}`;

  return NextResponse.json({
    message: responseText,
    conversationId: payload.conversationId ?? null,
  });
}
