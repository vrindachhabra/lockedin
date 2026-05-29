import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { useLockedInStore } from "@/store/useLockedInStore";
import type { Placement, PlacementStatus } from "@/types";
import { daysUntil, formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";

const statuses: Array<PlacementStatus | "all"> = ["all", "shortlisted", "applied", "oa-scheduled", "interview", "offer", "rejected"];

export function PlacementTracker() {
  const placements = useLockedInStore((state) => state.placements);
  const updatePlacement = useLockedInStore((state) => state.updatePlacement);
  const deletePlacement = useLockedInStore(
    (state) => state.deletePlacement
  );
  const setModal = useLockedInStore(
  (state) => state.setModal
);
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
          <div className="flex flex-wrap gap-2 items-center">
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
            <Button
              onClick={() => setModal("placement")}
              size="icon"
              aria-label="Add company"
              className="shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
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
                      <p className="mt-1 text-sm text-muted-foreground">
                        {[placement.role, placement.package, placement.platform]
                          .filter((item) => item && item !== "-")
                          .join(" / ")}
                      </p>

                      <p className="mt-2 text-xs text-muted-foreground">
                        {placement.oaTestDate &&
                          `OA ${formatDate(placement.oaTestDate)}`}

                        {placement.applicationDeadline &&
                          placement.applicationDeadline !== placement.oaTestDate &&
                          ` / Apply by ${formatDate(
                            placement.applicationDeadline
                          )}`}

                        {placement.testDuration &&
                          placement.testDuration !== "-" &&
                          ` / ${placement.testDuration}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Select
                        className="w-40"
                        value={placement.status}
                        onChange={(event) =>
                          updatePlacement(placement.id, {
                            status: event.target.value as PlacementStatus
                          })
                        }
                      >
                        {statuses
                          .filter((item) => item !== "all")
                          .map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                      </Select>

                      <button
                        className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-muted-foreground transition hover:bg-white/[0.08] hover:text-foreground"
                        onClick={() =>
                          setModal({
                            type: "edit-placement",
                            placement
                          })
                        }
                        aria-label="Edit placement"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 transition hover:bg-red-500/25 hover:text-red-300"
                        onClick={() => deletePlacement(placement.id)}
                        aria-label="Delete placement"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
