import { ArrowDownUp, CalendarClock, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import { useLockedInStore } from "@/store/useLockedInStore";
import type { Placement, PlacementStatus } from "@/types";
import { daysUntil, formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";

const statuses: Array<PlacementStatus | "all"> = ["all", "wishlist", "applied", "oa-scheduled", "interview", "offer", "rejected"];

export function PlacementTracker() {
  const placements = useLockedInStore((state) => state.placements);
  const updatePlacement = useLockedInStore((state) => state.updatePlacement);
  const globalSearch = useLockedInStore((state) => state.search);
  const [localSearch, setLocalSearch] = useState("");
  const [status, setStatus] = useState<PlacementStatus | "all">("all");
  const [sort, setSort] = useState<keyof Placement>("applicationDeadline");
  const debounced = useDebounce(localSearch || globalSearch);

  const filtered = useMemo(() => {
    return placements
      .filter((placement) => {
        const haystack = [placement.companyName, placement.role, placement.platform, placement.notes].join(" ").toLowerCase();
        return haystack.includes(debounced.toLowerCase()) && (status === "all" || placement.status === status);
      })
      .sort((a, b) => String(a[sort]).localeCompare(String(b[sort])));
  }, [debounced, placements, sort, status]);

  const stats = {
    offers: placements.filter((placement) => placement.status === "offer").length,
    interviews: placements.filter((placement) => placement.status === "interview").length,
    deadlines: placements.filter(
      (placement) => daysUntil(placement.applicationDeadline) <= 7
    ).length,
  };

  return (
    <section className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
            Offers
          </p>

          <p className="mt-1 text-xl font-bold">
            {stats.offers}
          </p>
        </Card>

        <Card className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
            Interviews
          </p>

          <p className="mt-1 text-xl font-bold">
            {stats.interviews}
          </p>
        </Card>

        <Card className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
            Deadlines
          </p>

          <p className="mt-1 text-xl font-bold">
            {stats.deadlines}
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company applications</CardTitle>
          <div className="flex flex-wrap gap-2">
            <div className="flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.055] px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={localSearch}
                onChange={(event) => setLocalSearch(event.target.value)}
                placeholder="Search companies"
                className="w-44 bg-transparent text-sm outline-none"
              />
            </div>
            <Select className="w-40" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
              {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
            </Select>
            <Select className="w-44" value={sort} onChange={(event) => setSort(event.target.value as keyof Placement)}>
              <option value="applicationDeadline">Deadline</option>
              <option value="oaTestDate">OA date</option>
              <option value="companyName">Company</option>
              <option value="preparationProgress">Prep progress</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filtered.map((placement) => {
              const deadline = daysUntil(placement.applicationDeadline);
              return (
                <div key={placement.id} className="rounded-xl border border-white/8 bg-white/[0.035] p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold">{placement.companyName}</h3>
                        <span className="rounded-md bg-white/8 px-2 py-1 text-xs capitalize text-muted-foreground">{placement.status}</span>
                        <span className={cn("rounded-md px-2 py-1 text-xs", deadline <= 2 ? "bg-red-400/10 text-red-300" : "bg-primary/10 text-primary")}>
                          Deadline {deadline < 0 ? "passed" : `${deadline}d`}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{placement.role} / {placement.package} / {placement.platform}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        OA {formatDate(placement.oaTestDate)} / Apply by {formatDate(placement.applicationDeadline)} / {placement.testDuration}
                      </p>
                    </div>
                    <Select
                      className="w-44"
                      value={placement.status}
                      onChange={(event) => updatePlacement(placement.id, { status: event.target.value as PlacementStatus })}
                    >
                      {statuses.filter((item) => item !== "all").map((item) => <option key={item} value={item}>{item}</option>)}
                    </Select>
                  </div>
                  <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
                    <div>
                      <div className="mb-2 flex justify-between text-sm">
                        <span>Preparation progress</span>
                        <span>{placement.preparationProgress}%</span>
                      </div>
                      <Progress value={placement.preparationProgress} />
                      <div className="mt-3 flex flex-wrap gap-2">
                        {placement.dsaTopicsPrepared.map((topic) => (
                          <span key={topic} className="rounded-md bg-white/8 px-2 py-1 text-xs text-muted-foreground">{topic}</span>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg bg-white/[0.04] p-3">
                      <p className="text-xs text-muted-foreground">Resume</p>
                      <p className="mt-1 text-sm font-semibold">{placement.resumeVersionUsed}</p>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">{placement.externalRemarks || placement.notes}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <ArrowDownUp className="h-3.5 w-3.5" />
            Sorting, filtering, search, analytics, and deadline indicators are active.
            <CalendarClock className="h-3.5 w-3.5" />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
