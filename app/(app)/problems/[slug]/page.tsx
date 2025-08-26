"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/code-editor";

function diffClass(d: string) {
  switch (d) {
    case "Easy":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    case "Medium":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
    case "Hard":
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

type ProblemDetail = {
  id: number;
  title: string;
  slug: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  test_cases: Array<{ input: string; output: string }>;
};

export default function ProblemDetailPage() {
  const params = useParams<{ slug: string }>();
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("problems")
        .select("*")
        .eq("slug", params.slug)
        .single();
      if (!error) setProblem(data as ProblemDetail);
      setLoading(false);
    };
    if (params.slug) load();
  }, [params.slug]);

  const tagBadges = useMemo(
    () => (
      <div className="flex flex-wrap gap-1.5">
        {problem?.tags?.map((t) => (
          <Badge key={t} variant="secondary" className="bg-muted/50">
            {t}
          </Badge>
        ))}
      </div>
    ),
    [problem?.tags]
  );

  if (loading)
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  if (!problem)
    return (
      <div className="text-sm text-muted-foreground">Problem not found.</div>
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border-[hsl(var(--border))] bg-[hsl(var(--background))] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{problem.title}</h1>
            <div className="mt-2 flex items-center gap-3">
              <span
                className={`px-2 py-0.5 rounded-md text-xs ${diffClass(
                  problem.difficulty
                )}`}
              >
                {problem.difficulty}
              </span>
              {tagBadges}
            </div>
          </div>
          <Button
            onClick={() =>
              editorRef.current?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Solve Now
          </Button>
        </div>
        <div className="prose dark:prose-invert max-w-none mt-6">
          <ReactMarkdown>{problem.description}</ReactMarkdown>
        </div>
      </div>

      <div className="rounded-lg border-[hsl(var(--border))] bg-[hsl(var(--background))] p-5">
        <h2 className="text-lg font-medium mb-3">Example Test Cases</h2>
        <div className="space-y-3">
          {problem.test_cases?.map((tc, i) => (
            <div key={i} className="rounded-md border-[hsl(var(--border))] p-3">
              <div className="text-xs text-muted-foreground">Input</div>
              <pre className="text-sm overflow-auto whitespace-pre-wrap">
                {tc.input}
              </pre>
              <div className="text-xs text-muted-foreground mt-2">Output</div>
              <pre className="text-sm overflow-auto whitespace-pre-wrap">
                {tc.output}
              </pre>
            </div>
          ))}
        </div>
      </div>

      <div ref={editorRef}>
        <CodeEditor problemSlug={problem.slug} testCases={problem.test_cases} />
      </div>
    </div>
  );
}
