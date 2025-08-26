"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function LogoutPage() {
  const [loading, setLoading] = useState(false);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = "/";
    } catch (e) {
      alert("Sign-out failed. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-3 text-center">
        <h1 className="text-2xl font-semibold">Sign out</h1>
        <Button onClick={signOut} disabled={loading} className="w-full">
          {loading ? "Signing out..." : "Sign out"}
        </Button>
      </div>
    </div>
  );
}
