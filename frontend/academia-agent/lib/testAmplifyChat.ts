import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

/**
 * Simplified test function to isolate the Amplify AI Chat issue
 */
export async function testAmplifyChat() {
  console.log("🧪 Testing Amplify AI Chat...");
  
  try {
    // Create client
    const client = generateClient<Schema>({ authMode: "userPool" });
    console.log("✅ Client created");

    // Create conversation
    console.log("📝 Creating conversation...");
    const { data: conversation, errors: createErrors } = await client.conversations.AcademiaChat.create();
    
    if (createErrors) {
      console.error("❌ Conversation creation errors:", createErrors);
      return { success: false, error: "Failed to create conversation", details: createErrors };
    }

    if (!conversation) {
      console.error("❌ No conversation returned");
      return { success: false, error: "No conversation object returned" };
    }

    console.log("✅ Conversation created:", conversation.id);
    console.log("🔍 Conversation object keys:", Object.keys(conversation));
    console.log("🔍 Conversation object:", conversation);

    // Check if sendMessage exists
    if (typeof conversation.sendMessage !== 'function') {
      console.error("❌ sendMessage is not a function");
      console.log("Available methods:", Object.keys(conversation).filter(key => typeof (conversation as any)[key] === 'function'));
      return { 
        success: false, 
        error: "sendMessage method not available",
        availableMethods: Object.keys(conversation).filter(key => typeof (conversation as any)[key] === 'function')
      };
    }

    // Send test message
    console.log("💬 Sending test message...");
    const messageResult = await conversation.sendMessage({
      content: [{ text: "Hello, can you help me find computer science programs?" }]
    });

    console.log("✅ Message sent successfully");
    console.log("📨 Message result:", messageResult);

    return { 
      success: true, 
      conversationId: conversation.id,
      messageResult 
    };

  } catch (error) {
    console.error("❌ Test failed:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    };
  }
}

/**
 * Test the current implementation
 */
export async function testCurrentImplementation(conversationId: string, text: string) {
  console.log("🧪 Testing current implementation...");
  
  try {
    const { sendMessageToAcademia } = await import('./amplifyClient');
    const result = await sendMessageToAcademia(conversationId, text);
    console.log("✅ Current implementation result:", result);
    return { success: true, result };
  } catch (error) {
    console.error("❌ Current implementation failed:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    };
  }
}