"use client";

import { useEffect } from "react";
import { Amplify, ResourcesConfig } from "aws-amplify";
import outputs from "../amplify_outputs.json";

export default function AmplifyInit() {
  useEffect(() => {
    try {
      if (outputs) {
        // Configure Amplify for client-side usage (no SSR)
        Amplify.configure(outputs as ResourcesConfig, {
          ssr: false // Explicitly disable SSR for client-side
        });
        console.log("Amplify configured successfully on client");
      }
    } catch (e) {
      // swallow during dev; log for diagnostics
      console.error("Amplify configure failed", e);
    }
  }, []);

  return null;
}
