"use client";

import { Amplify, ResourcesConfig } from "aws-amplify";
import outputs from "../amplify_outputs.json";

// Configure Amplify right away on the client
try {
  if (outputs) {
    Amplify.configure(outputs as ResourcesConfig, {
      ssr: false, // Explicitly disable SSR for client-side
    });
    console.log("Amplify configured successfully on client");
  }
} catch (e) {
  // In a real-world app, you might want to handle this error more gracefully
  console.error("Amplify configure failed", e);
}

// This component doesn't need to do anything but be present in the layout
// to ensure this module is loaded and executed on the client.
export default function AmplifyInit() {
  return null;
}
