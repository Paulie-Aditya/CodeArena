"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Submission {
  id: string;
  created_at: string;
  language: string;
  code: string;
  verdict: string;
  runtime: number | null;
  memory: number | null;
  problem: {
    title: string;
    slug: string;
    difficulty: string;
  };
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [verdictFilter, setVerdictFilter] = useState("all");
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from("submissions")
        .select(
          `
          id,
          created_at,
          language,
          code,
          verdict,
          runtime,
          memory,
          problem:problems(title, slug, difficulty)
        `
        )
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch = submission.problem.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesLanguage =
      languageFilter === "all" || submission.language === languageFilter;
    const matchesVerdict =
      verdictFilter === "all" ||
      submission.verdict.toLowerCase().includes(verdictFilter.toLowerCase());
    return matchesSearch && matchesLanguage && matchesVerdict;
  });

  const getVerdictColor = (verdict: string) => {
    const lower = verdict.toLowerCase();
    if (lower.includes("accepted")) return "bg-green-500";
    if (lower.includes("wrong")) return "bg-red-500";
    if (lower.includes("time")) return "bg-yellow-500";
    if (lower.includes("memory")) return "bg-orange-500";
    return "bg-gray-500";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Submission History</h1>
        <Badge variant="secondary">{submissions.length} submissions</Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search problems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
              </SelectContent>
            </Select>
            <Select value={verdictFilter} onValueChange={setVerdictFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Verdict" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Verdicts</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="wrong">Wrong Answer</SelectItem>
                <SelectItem value="time">Time Limit</SelectItem>
                <SelectItem value="memory">Memory Limit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.map((submission) => (
          <Card key={submission.id} className="hover-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold">{submission.problem.title}</h3>
                  <Badge variant="outline">
                    {submission.problem.difficulty}
                  </Badge>
                  <Badge variant="outline">{submission.language}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getVerdictColor(submission.verdict)}>
                    {submission.verdict}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(submission.created_at)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                {submission.runtime && (
                  <span>Runtime: {submission.runtime}ms</span>
                )}
                {submission.memory && (
                  <span>Memory: {submission.memory}KB</span>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSelectedSubmission(
                      selectedSubmission?.id === submission.id
                        ? null
                        : submission
                    )
                  }
                >
                  {selectedSubmission?.id === submission.id
                    ? "Hide Code"
                    : "View Code"}
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={`/problems/${submission.problem.slug}`}>Try Again</a>
                </Button>
              </div>

              {selectedSubmission?.id === submission.id && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <pre className="text-sm overflow-x-auto">
                    <code>{submission.code}</code>
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredSubmissions.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No submissions found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
