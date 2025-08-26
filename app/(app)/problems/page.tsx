"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProblemCard, type Problem } from "@/components/problem-card";

const DIFFS = ["Easy", "Medium", "Hard"] as const;

type DBProblem = Problem & { tags: string[] };

export default function ProblemsPage() {
  const [problems, setProblems] = useState<DBProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeDiffs, setActiveDiffs] = useState<string[]>([]);
  const [solvedProblems, setSolvedProblems] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("problems").select("*");
      if (!error) setProblems((data as DBProblem[]) ?? []);
      setLoading(false);
    };
    fetchProblems();
  }, []);

  useEffect(() => {
    const fetchSolvedProblems = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from("submissions")
        .select("problem_id, verdict")
        .eq("user_id", userData.user.id)
        .eq("verdict", "Accepted");

      if (!error && data) {
        const solvedIds = new Set(data.map((s) => s.problem_id));
        setSolvedProblems(solvedIds);
      }
    };
    fetchSolvedProblems();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return problems.filter((p) => {
      const matchesQ =
        q === "" ||
        p.title.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q));
      const matchesDiff =
        activeDiffs.length === 0 || activeDiffs.includes(p.difficulty);
      return matchesQ && matchesDiff;
    });
  }, [problems, search, activeDiffs]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <Input
            placeholder="Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="md:max-w-sm"
          />
          <div className="flex items-center gap-2">
            {DIFFS.map((d) => {
              const active = activeDiffs.includes(d);
              return (
                <Button
                  key={d}
                  variant={active ? "default" : "outline"}
                  onClick={() =>
                    setActiveDiffs((prev) =>
                      prev.includes(d)
                        ? prev.filter((x) => x !== d)
                        : [...prev, d]
                    )
                  }
                >
                  {d}
                </Button>
              );
            })}
            {activeDiffs.length > 0 && (
              <Button variant="ghost" onClick={() => setActiveDiffs([])}>
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading problems...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <ProblemCard
              key={p.id}
              problem={p}
              isSolved={solvedProblems.has(p.id)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No problems found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
