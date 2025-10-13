"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export function AuthCard() {
  const [email, setEmail] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy");
      return;
    }

    setLoading(true);

    try {
      // Sign in with Cognito - this will redirect to Cognito hosted UI
      // The email can be used as login_hint to pre-fill the Cognito form
      await signIn("cognito", {
        callbackUrl: "/",
        // Pass email as login_hint to pre-populate Cognito form
        login_hint: email,
      });
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl">Welcome to Academia Agent</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Sign in or create an account to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full"
              autoComplete="email"
            />
          </div>

          {/* Terms Checkbox with improved visibility */}
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              disabled={loading}
              className="mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <Label
                htmlFor="terms"
                className="text-xs sm:text-sm font-normal leading-snug cursor-pointer block"
              >
                I agree to the{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  className="text-primary underline underline-offset-4 hover:no-underline font-medium"
                >
                  Terms of Service and Privacy Policy
                </Link>
                , and consent to receive marketing communications from Eight
                Twelve Consulting LLC
              </Label>
            </div>
          </div>

          {error && (
            <div className="p-3 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <Button 
            onClick={handleSignIn} 
            className="w-full" 
            disabled={loading || !email.trim() || !agreedToTerms}
          >
            {loading ? "Redirecting..." : "Sign In"}
          </Button>

          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            You&apos;ll be redirected to a secure sign-in page
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
