"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

type Row = {
  id: string;
  username: string | null;
  solved_count: number;
  easy_solved: number;
  medium_solved: number;
  hard_solved: number;
};

const SORTS = [
  { key: "solved_count", label: "Total" },
  { key: "easy_solved", label: "Easy" },
  { key: "medium_solved", label: "Medium" },
  { key: "hard_solved", label: "Hard" },
] as const;

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] =
    useState<(typeof SORTS)[number]["key"]>("solved_count");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select(
          "id,username,solved_count,easy_solved,medium_solved,hard_solved"
        )
        .order(sortKey, { ascending: false })
        .limit(50);
      setRows((data as Row[]) ?? []);
      setLoading(false);
    };
    load();
  }, [sortKey]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4">
        <div className="flex items-center gap-2">
          {SORTS.map((s) => (
            <Button
              key={s.key}
              variant={sortKey === s.key ? "default" : "outline"}
              onClick={() => setSortKey(s.key)}
            >
              {s.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border-[hsl(var(--border))] bg-[hsl(var(--background))]">
        {loading ? (
          <div className="h-64 w-full animate-pulse bg-[hsl(var(--muted))] rounded-md" />
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b-[hsl(var(--border))]">
              <tr>
                <th className="text-left p-3">Rank</th>
                <th className="text-left p-3">User</th>
                <th className="text-left p-3">Solved</th>
                <th className="text-left p-3">Easy</th>
                <th className="text-left p-3">Medium</th>
                <th className="text-left p-3">Hard</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} className="border-b-[hsl(var(--border))]">
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3">{r.username ?? r.id.slice(0, 6)}</td>
                  <td className="p-3">{r.solved_count}</td>
                  <td className="p-3">{r.easy_solved}</td>
                  <td className="p-3">{r.medium_solved}</td>
                  <td className="p-3">{r.hard_solved}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
