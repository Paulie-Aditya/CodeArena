"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, RotateCcw, Play } from "lucide-react";
import { languageToJudge0, submitToJudge0 } from "@/lib/judge0";

const LANGS = [
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
] as const;

const TEMPLATES: Record<string, string> = {
  javascript: `// JavaScript template\nfunction solve() {\n  // TODO\n}\n`,
  python: `# Python template\ndef solve():\n    pass\n \n \nif __name__ == "__main__":\n    solve()`,
  java: `// Java template\npublic class Main {\n  public static void main(String[] args) {\n  }\n}\n`,
  cpp: `// C++ template\n#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n  return 0;\n}\n`,
};

type Props = {
  problemSlug: string;
  initialLanguage?: (typeof LANGS)[number]["id"];
  testCases?: Array<{ input: string; output: string }>;
};

type Judge0Response = {
  status?: { id: number; description: string };
  time?: string;
  memory?: number;
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
};

export function CodeEditor({
  problemSlug,
  initialLanguage = "javascript",
  testCases = [],
}: Props) {
  const [lang, setLang] =
    useState<(typeof LANGS)[number]["id"]>(initialLanguage);
  const [code, setCode] = useState("");
  const [full, setFull] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Judge0Response | null>(null);
  const [expanded, setExpanded] = useState(false);

  const key = useMemo(() => `code:${problemSlug}:${lang}`, [problemSlug, lang]);

  useEffect(() => {
    const saved = localStorage.getItem(key);
    setCode(saved ?? TEMPLATES[lang]);
  }, [key, lang]);

  useEffect(() => {
    localStorage.setItem(key, code);
  }, [key, code]);

  const reset = useCallback(() => setCode(TEMPLATES[lang]), [lang]);

  const run = useCallback(async () => {
    try {
      setLoading(true);
      setExpanded(true);
      setResult(null);
      const language_id = languageToJudge0[lang];
      const payload = {
        language_id,
        source_code: code,
        test_cases:
          testCases.length > 0 ? testCases : [{ input: "", output: "" }],
      };
      const data = (await submitToJudge0(payload)) as Judge0Response;
      setResult(data);
    } catch (e) {
      setResult({ status: { id: 0, description: "Failed" } });
    } finally {
      setLoading(false);
    }
  }, [lang, code, testCases]);

  const verdict = result?.status?.description ?? "—";

  return (
    <div
      className={`${
        full ? "fixed inset-4 z-50" : ""
      } rounded-lg border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3`}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="flex items-center gap-2">
          <select
            className="px-3 py-2 rounded-md border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]/30"
            value={lang}
            onChange={(e) =>
              setLang(e.target.value as (typeof LANGS)[number]["id"])
            }
          >
            {LANGS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
          <Button variant="default" onClick={run} disabled={loading}>
            <Play className="mr-2" /> {loading ? "Running..." : "Run"}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={reset}>
            <RotateCcw className="mr-2" /> Reset
          </Button>
          <Button variant="outline" onClick={() => setFull((v) => !v)}>
            {full ? (
              <>
                <Minimize2 className="mr-2" /> Exit
              </>
            ) : (
              <>
                <Maximize2 className="mr-2" /> Fullscreen
              </>
            )}
          </Button>
        </div>
      </div>
      <div className="mt-3 rounded-md overflow-hidden border-[hsl(var(--border))]">
        <Editor
          height={full ? "80vh" : "50vh"}
          language={lang === "cpp" ? "cpp" : lang}
          theme="vs-dark"
          value={code}
          onChange={(v) => setCode(v ?? "")}
          options={{
            minimap: { enabled: false },
            wordWrap: "on",
            automaticLayout: true,
            fontSize: 14,
          }}
        />
      </div>
      <div className="mt-3 rounded-md border-[hsl(var(--border))] p-3">
        <div className="flex items-center justify-between">
          <div className="text-sm">Verdict: {verdict}</div>
          <Button variant="ghost" onClick={() => setExpanded((v) => !v)}>
            {expanded ? "Hide" : "Show"} Output
          </Button>
        </div>
        {expanded && (
          <div className="mt-2 text-sm space-y-1">
            {result?.time && <div>Runtime: {result.time}s</div>}
            {result?.memory !== undefined && (
              <div>Memory: {result.memory} KB</div>
            )}
            {result?.stdout && (
              <div>
                <div className="text-xs text-muted-foreground">stdout</div>
                <pre className="whitespace-pre-wrap overflow-auto">
                  {result.stdout}
                </pre>
              </div>
            )}
            {result?.stderr && (
              <div>
                <div className="text-xs text-muted-foreground">stderr</div>
                <pre className="whitespace-pre-wrap overflow-auto">
                  {result.stderr}
                </pre>
              </div>
            )}
            {result?.compile_output && (
              <div>
                <div className="text-xs text-muted-foreground">
                  compile_output
                </div>
                <pre className="whitespace-pre-wrap overflow-auto">
                  {result.compile_output}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
