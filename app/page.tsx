"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LeaderboardUser {
  id: string;
  email: string;
  solved_count: number;
  easy_solved: number;
  medium_solved: number;
  hard_solved: number;
}

export default function Home() {
  const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select(
            "id, email, solved_count, easy_solved, medium_solved, hard_solved"
          )
          .order("solved_count", { ascending: false })
          .limit(5);

        if (error) throw error;
        setTopUsers(data || []);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            CodeArena
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Master competitive programming with our curated collection of
            problems. Practice, compete, and climb the leaderboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/problems">Start Solving</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6"
            >
              <Link href="/leaderboard">View Leaderboard</Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
          <Card className="hover-card text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-blue-600">100+</div>
              <div className="text-muted-foreground">Problems</div>
            </CardContent>
          </Card>
          <Card className="hover-card text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-green-600">4</div>
              <div className="text-muted-foreground">Languages</div>
            </CardContent>
          </Card>
          <Card className="hover-card text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-purple-600">24/7</div>
              <div className="text-muted-foreground">Available</div>
            </CardContent>
          </Card>
        </div>

        {/* Mini Leaderboard */}
        <div className="mt-16 max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Top Solvers</span>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/leaderboard">View All</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-muted rounded animate-pulse" />
                      <div className="flex-1 h-4 bg-muted rounded animate-pulse" />
                      <div className="w-16 h-4 bg-muted rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {topUsers.map((user, index) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-xs font-bold text-white">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium truncate">
                          {user.email?.split("@")[0] || "Anonymous"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.easy_solved || 0}E • {user.medium_solved || 0}M
                          • {user.hard_solved || 0}H
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {user.solved_count || 0} solved
                      </Badge>
                    </div>
                  ))}
                  {topUsers.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No users yet. Be the first to solve problems!
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="hover-card">
            <CardContent className="p-6">
              <div className="text-2xl mb-2">🚀</div>
              <h3 className="font-semibold mb-2">Fast Execution</h3>
              <p className="text-muted-foreground text-sm">
                Run your code instantly with our Judge0 integration supporting
                multiple languages.
              </p>
            </CardContent>
          </Card>
          <Card className="hover-card">
            <CardContent className="p-6">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-semibold mb-2">Progress Tracking</h3>
              <p className="text-muted-foreground text-sm">
                Track your progress with detailed statistics and submission
                history.
              </p>
            </CardContent>
          </Card>
          <Card className="hover-card">
            <CardContent className="p-6">
              <div className="text-2xl mb-2">🏆</div>
              <h3 className="font-semibold mb-2">Competitive</h3>
              <p className="text-muted-foreground text-sm">
                Compete with others on the global leaderboard and improve your
                ranking.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
