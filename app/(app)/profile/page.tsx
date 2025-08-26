"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";

type Profile = {
  solved_count: number;
  easy_solved: number;
  medium_solved: number;
  hard_solved: number;
};

type Submission = {
  problem_id: number;
  verdict: string;
  created_at: string;
};

type Problem = {
  id: number;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) {
        setLoading(false);
        return;
      }
      const { data: prof } = await supabase
        .from("profiles")
        .select("solved_count,easy_solved,medium_solved,hard_solved")
        .eq("id", uid)
        .single();
      setProfile((prof as Profile) ?? null);

      const { data: subs } = await supabase
        .from("submissions")
        .select("problem_id,verdict,created_at")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });
      const acceptedIds = new Set(
        (subs as Submission[] | null)
          ?.filter((s) => s.verdict.toLowerCase().includes("accepted"))
          .map((s) => s.problem_id) ?? []
      );
      if (acceptedIds.size > 0) {
        const { data: probs } = await supabase
          .from("problems")
          .select("id,title,slug,difficulty")
          .in("id", Array.from(acceptedIds));
        setProblems((probs as Problem[]) ?? []);
      } else {
        setProblems([]);
      }
      setLoading(false);
    };
    load();
  }, []);

  const counts = useMemo(
    () => ({
      solved: profile?.solved_count ?? 0,
      easy: profile?.easy_solved ?? 0,
      medium: profile?.medium_solved ?? 0,
      hard: profile?.hard_solved ?? 0,
    }),
    [profile]
  );

  return (
    <div className="space-y-6">
      <div className="rounded-lg border-[hsl(var(--border))] bg-[hsl(var(--background))] p-5">
        <h1 className="text-2xl font-semibold">Your Profile</h1>
        {loading ? (
          <div className="mt-3 h-20 w-full animate-pulse bg-[hsl(var(--muted))] rounded-md" />
        ) : (
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <Badge className="bg-muted/50">Solved: {counts.solved}</Badge>
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Easy: {counts.easy}
            </Badge>
            <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400">
              Medium: {counts.medium}
            </Badge>
            <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400">
              Hard: {counts.hard}
            </Badge>
          </div>
        )}
      </div>

      <div className="rounded-lg border-[hsl(var(--border))] bg-[hsl(var(--background))] p-5">
        <h2 className="text-lg font-medium">Solved Problems</h2>
        {loading ? (
          <div className="mt-3 h-32 w-full animate-pulse bg-[hsl(var(--muted))] rounded-md" />
        ) : problems.length === 0 ? (
          <div className="mt-3 text-sm text-muted-foreground">
            No solved problems yet.
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {problems.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between text-sm"
              >
                <a href={`/problems/${p.slug}`} className="hover:underline">
                  {p.title}
                </a>
                <span>✅</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
