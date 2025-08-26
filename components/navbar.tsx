"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? null);
    };
    fetchUser();
    const { data: sub } = supabase.auth.onAuthStateChange(() => fetchUser());
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <div className="w-full bg-[hsl(var(--background))] border-b border-[hsl(var(--border))]">
      <div className="mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <Link href="/" className="text-lg font-semibold">
            CodeArena
          </Link>
          <nav className="hidden md:flex items-center gap-3 text-sm text-muted-foreground">
            <Link
              href="/problems"
              className="hover:text-foreground px-3 py-1.5 rounded-md hover:bg-foreground/5"
            >
              Problems
            </Link>
            <Link
              href="/submissions"
              className="hover:text-foreground px-3 py-1.5 rounded-md hover:bg-foreground/5"
            >
              Submissions
            </Link>
            <Link
              href="/leaderboard"
              className="hover:text-foreground px-3 py-1.5 rounded-md hover:bg-foreground/5"
            >
              Leaderboard
            </Link>
            <Link
              href="/profile"
              className="hover:text-foreground px-3 py-1.5 rounded-md hover:bg-foreground/5"
            >
              Profile
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {userEmail ? (
            <Button asChild variant="outline">
              <Link href="/logout" replace>
                Logout
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
