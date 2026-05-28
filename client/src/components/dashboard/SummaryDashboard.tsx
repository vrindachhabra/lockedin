import {
  BriefcaseBusiness,
  CalendarClock
} from "lucide-react";

import { Card } from "@/components/ui/card";

import { useLockedInStore } from "@/store/useLockedInStore";

export function SummaryDashboard() {
  const analytics = useLockedInStore(
    (state) => state.analytics
  );

  const stats = [
    {
      label: "Upcoming tests",
      value: analytics.upcomingTests,
      icon: CalendarClock,
      detail: "OA and interviews"
    },

    {
      label: "Applications",
      value: analytics.activeApplications,
      icon: BriefcaseBusiness,
      detail: "Active placement pipeline"
    }
  ];

  return (
    <section className="mb-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {stat.label}
                </p>

                <p className="mt-3 text-3xl font-bold">
                  {stat.value}
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                  {stat.detail}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}