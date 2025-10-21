import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";

let clientInstance: ReturnType<typeof generateClient<Schema>> | null = null;

/**
 * Get or create the Amplify Data client.
 * Ensures Amplify is configured before creating the client.
 */
function getClient() {
  if (typeof window === "undefined") {
    throw new Error("Amplify client can only be used in browser context");
  }

  // Configure Amplify if not already configured
  try {
    const config = Amplify.getConfig();
    if (!config.Auth || !config.API) {
      console.log("Configuring Amplify...");
      Amplify.configure(outputs);
    }
  } catch {
    console.log("Configuring Amplify (first time)...");
    Amplify.configure(outputs);
  }

  // Create client if not already created
  if (!clientInstance) {
    console.log("Creating Amplify Data client...");
    clientInstance = generateClient<Schema>({ authMode: "userPool" });
  }

  return clientInstance;
}

/**
 * Client-side Amplify Data client.
 * This should only be used in client-side code (browser).
 * It automatically uses the authenticated user's credentials from Amplify Auth.
 */
export const client = new Proxy({} as ReturnType<typeof generateClient<Schema>>, {
  get(_target, prop) {
    const actualClient = getClient();
    return actualClient[prop as keyof typeof actualClient];
  }
});

/**
 * Ensure a conversation exists for the given id. If the id is a special
 * placeholder (like 'welcome'), we just create a new conversation.
 * 
 * NOTE: This function should only be called from client-side code.
 */
export async function getOrCreateConversation(conversationId?: string) {
  if (typeof window === "undefined") {
    throw new Error("getOrCreateConversation can only be called from client-side code");
  }
  
  // If no conversationId provided, create a new conversation via the Data API
  if (!conversationId || conversationId === "welcome") {
    console.log("Creating new conversation (no ID or welcome)");
    const { data: conversation, errors } = await client.conversations.AcademiaChat.create();
    
    if (errors) {
      console.error("Error creating conversation:", errors);
      throw new Error(`Failed to create conversation: ${JSON.stringify(errors)}`);
    }
    
    console.log("Created conversation:", conversation);
    return conversation;
  }

  // Try to read the conversation by id
  try {
    console.log("Attempting to fetch existing conversation:", conversationId);
    const convApi = (client.conversations.AcademiaChat as unknown) as Record<string, unknown>;
    
    if (typeof convApi.get === "function") {
      const getFn = convApi.get as unknown as (id?: string) => Promise<{ data?: unknown; errors?: unknown }>;
      const { data, errors } = await getFn(conversationId);
      
      if (errors) {
        console.warn("Error fetching conversation, will create new one:", errors);
      } else if (data) {
        console.log("Found existing conversation");
        return data;
      }
    }
  } catch (e) {
    console.warn("Failed to fetch conversation, creating new one", e);
  }

  // Fallback: create new conversation
  console.log("Creating new conversation (fallback)");
  const { data: conversation, errors } = await client.conversations.AcademiaChat.create();
  
  if (errors) {
    console.error("Error creating conversation:", errors);
    throw new Error(`Failed to create conversation: ${JSON.stringify(errors)}`);
  }
  
  console.log("Created conversation:", conversation);
  return conversation;
}

/**
 * Send a message to the AcademiaChat conversation and return the assistant reply.
 * 
 * NOTE: This function should only be called from client-side code.
 */
export async function sendMessageToAcademia(conversationId: string | undefined, text: string) {
  if (typeof window === "undefined") {
    throw new Error("sendMessageToAcademia can only be called from client-side code");
  }

  console.log("sendMessageToAcademia called with:", { conversationId, text });
  
  const conversation = await getOrCreateConversation(conversationId);
  console.log("Got conversation:", conversation);

  // The conversation object from the Amplify Data API typically exposes a `sendMessage` helper
  try {
    const conv = conversation as unknown as Record<string, unknown>;
    console.log("Conversation object keys:", Object.keys(conv));
    
    if (typeof conv.sendMessage === "function") {
      console.log("Calling sendMessage with content:", [{ text }]);
      
      const sendFn = conv.sendMessage as unknown as (payload: unknown) => Promise<{ data?: unknown; errors?: unknown }>;
      const result = await sendFn({ content: [{ text }] });
      console.log("sendMessage result:", result);
      
      const { data: message, errors } = result;
      
      if (errors) {
        console.error("Amplify Data errors:", errors);
        throw new Error(`Amplify Data error: ${JSON.stringify(errors)}`);
      }
      
      if (!message) {
        console.warn("No message data returned");
        return null;
      }
      
      // Parse the response message
      const msg = message as unknown as Record<string, unknown>;
      console.log("Message shape:", { keys: Object.keys(msg), msg });
      
      const content: unknown = msg.content ?? msg.output ?? msg.response ?? null;
      
      if (Array.isArray(content)) {
        // find first text block
        const textBlock = (content as Array<Record<string, unknown>>).find((b) => typeof b.text === "string");
        if (textBlock) {
          console.log("Returning text from content array");
          return String(textBlock.text);
        }
        // fallback to joining text fields
        const joined = (content as Array<Record<string, unknown>>)
          .map((b) => (typeof b.text === "string" ? String(b.text) : JSON.stringify(b)))
          .join("\n");
        console.log("Returning joined content");
        return joined;
      }
      
      if (typeof content === "string") {
        console.log("Returning content as string");
        return content;
      }

      // Try other common fields
      if (typeof msg.message === "string") {
        console.log("Returning msg.message");
        return String(msg.message);
      }
      if (typeof msg.body === "string") {
        console.log("Returning msg.body");
        return String(msg.body);
      }

      console.log("Fallback: returning stringified message");
      return JSON.stringify(message);
    }
  } catch (e) {
    console.error("Failed to send message via Amplify Data conversation:", e);
    if (e instanceof Error) {
      console.error("Error stack:", e.stack);
    }
    throw e;
  }

  console.error("Conversation client does not expose sendMessage()");
  throw new Error("Conversation client does not expose sendMessage()");
}
