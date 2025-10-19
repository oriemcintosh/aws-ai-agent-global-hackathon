"use client";

import { useEffect } from "react";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";

export default function AmplifyInit() {
  useEffect(() => {
    try {
      if (outputs) {
        Amplify.configure(outputs as any);
      }
    } catch (e) {
      // swallow during dev; log for diagnostics
      // eslint-disable-next-line no-console
      console.warn("Amplify configure failed", e);
    }
  }, []);

  return null;
}
