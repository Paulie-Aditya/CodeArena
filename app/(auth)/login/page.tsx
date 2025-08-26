"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Github, Mail } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState<"google" | "github" | null>(null);

  const signIn = useCallback(async (provider: "google" | "github") => {
    try {
      setLoading(provider);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo:
            typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });
      if (error) {
        console.error(`${provider} sign-in error:`, error);
        alert(`${provider} sign-in failed: ${error.message}`);
        throw error;
      }
    } catch (e) {
      console.error(`${provider} sign-in exception:`, e);
      alert(`${provider} sign-in failed. Check console for details.`);
    } finally {
      setLoading(null);
    }
  }, []);

  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-3">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <Button
          onClick={() => signIn("google")}
          disabled={!!loading}
          className="w-full"
        >
          <Mail className="mr-2" /> Continue with Google
        </Button>
        <Button
          onClick={() => signIn("github")}
          disabled={!!loading}
          variant="outline"
          className="w-full"
        >
          <Github className="mr-2" /> Continue with GitHub
        </Button>
      </div>
    </div>
  );
}
