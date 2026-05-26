import { BriefcaseBusiness, CalendarClock, Flame, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLockedInStore } from "@/store/useLockedInStore";
import { formatDate } from "@/lib/date";

export function SummaryDashboard() {
  const analytics = useLockedInStore((state) => state.analytics);
  const tasks = useLockedInStore((state) => state.tasks);
  const placements = useLockedInStore((state) => state.placements);
  const upcoming = [...placements].sort((a, b) => new Date(a.oaTestDate).getTime() - new Date(b.oaTestDate).getTime()).slice(0, 2);

  const stats = [
    { label: "Pending tasks", value: analytics.pendingTasks, icon: Target, detail: "Open daily commitments" },
    { label: "Productivity score", value: `${analytics.productivityScore}%`, icon: Flame, detail: `${analytics.currentStreak} day streak` },
    { label: "Upcoming tests", value: analytics.upcomingTests, icon: CalendarClock, detail: "OA and interviews" },
    { label: "Applications", value: analytics.activeApplications, icon: BriefcaseBusiness, detail: "Active placement pipeline" }
  ];

  return (
    <section className="mb-6 grid gap-4 xl:grid-cols-[1fr_0.85fr]">
      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-3 text-3xl font-bold">{stat.value}</p>
                <p className="mt-2 text-xs text-muted-foreground">{stat.detail}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Card className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">Dashboard pulse</p>
            <p className="mt-1 text-xs text-muted-foreground">Upcoming deadlines, tasks, and prep health.</p>
          </div>
          <span className="rounded-lg bg-accent/10 px-3 py-1 text-xs text-accent">Live</span>
        </div>
        <div className="mt-5 space-y-4">
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span>Weekly completion</span>
              <span>{analytics.weeklyCompletion}%</span>
            </div>
            <Progress value={analytics.weeklyCompletion} />
          </div>
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span>Placement prep</span>
              <span>{analytics.averagePrepProgress}%</span>
            </div>
            <Progress value={analytics.averagePrepProgress} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {upcoming.map((placement) => (
              <div key={placement.id} className="rounded-lg border border-white/8 bg-white/[0.04] p-3">
                <p className="truncate text-sm font-semibold">{placement.companyName}</p>
                <p className="mt-1 text-xs text-muted-foreground">OA {formatDate(placement.oaTestDate)}</p>
              </div>
            ))}
            <div className="rounded-lg border border-white/8 bg-white/[0.04] p-3">
              <p className="truncate text-sm font-semibold">{tasks.filter((task) => task.completed).length} completed</p>
              <p className="mt-1 text-xs text-muted-foreground">Today and recurring tasks</p>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
