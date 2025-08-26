import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export type Problem = {
  id: number;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
};

export function ProblemCard({ problem }: { problem: Problem }) {
  return (
    <Link href={`/problems/${problem.slug}`}>
      <Card className="hover-card">
        <CardHeader className="pb-0">
          <CardTitle className="text-base flex items-center justify-between">
            <span>{problem.title}</span>
            <span
              className={`px-2 py-0.5 rounded-md text-xs ${diffClass(
                problem.difficulty
              )}`}
            >
              {problem.difficulty}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="flex flex-wrap gap-1.5">
            {problem.tags?.slice(0, 5).map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-muted/50">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
