import {
  Bell,
  BriefcaseBusiness,
  CalendarCheck2,
  FolderKanban,
  LogOut,
  Menu,
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLockedInStore } from "@/store/useLockedInStore";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const activeTab = useLockedInStore((state) => state.activeTab);
  const setActiveTab = useLockedInStore((state) => state.setActiveTab);
  const setModal = useLockedInStore((state) => state.setModal);
  const search = useLockedInStore((state) => state.search);
  const setSearch = useLockedInStore((state) => state.setSearch);
  const workspaces = useLockedInStore((state) => state.workspaces);
  const logout = useLockedInStore((state) => state.logout);

  const tabs = [
    { id: "daily-goals" as const, label: "Daily Goals", icon: CalendarCheck2 },
    { id: "placement-tracker" as const, label: "Placement Tracker", icon: BriefcaseBusiness },
    { id: "workspace-generator" as const, label: "Create Workspace", icon: Plus }
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="surface-line pointer-events-none absolute inset-0 opacity-80" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-primary/12 blur-3xl" />
      <div className="relative flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/8 bg-black/25 p-5 backdrop-blur-xl lg:block">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-base font-black text-primary-foreground">
              L
            </div>
            <div>
              <p className="text-lg font-bold">LockedIn</p>
              <p className="text-xs text-muted-foreground">Your life. Organized.</p>
            </div>
          </div>
          <nav className="mt-10 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold text-muted-foreground transition hover:bg-white/8 hover:text-foreground",
                  activeTab === tab.id && "bg-white/10 text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                onClick={() => setActiveTab(`workspace:${workspace.id}`)}
                className={cn(
                  "flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold text-muted-foreground transition hover:bg-white/8 hover:text-foreground",
                  activeTab === `workspace:${workspace.id}` && "bg-white/10 text-foreground"
                )}
              >
                <FolderKanban className="h-4 w-4" />
                <span className="truncate">{workspace.name}</span>
              </button>
            ))}
          </nav>
          <Button variant="ghost" className="mt-6 w-full justify-start" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-white/8 bg-background/75 px-4 py-4 backdrop-blur-xl md:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button variant="secondary" size="icon" className="lg:hidden" aria-label="Open navigation">
                  <Menu className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-xl font-bold md:text-2xl">
                    {activeTab === "daily-goals"
                      ? "Daily Goals"
                      : activeTab === "placement-tracker"
                        ? "Placement Tracker"
                        : activeTab === "workspace-generator"
                          ? "Create Workspace"
                          : (workspaces.find((workspace) => activeTab === `workspace:${workspace.id}`)?.name ?? "Workspace")}
                  </h1>
                </div>
              </div>
              <div className="hidden h-10 min-w-80 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.055] px-3 text-sm text-muted-foreground md:flex">
                <Search className="h-4 w-4" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full bg-transparent outline-none"
                  placeholder="Search companies, roles, platforms"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() =>
                    setModal(
                      activeTab === "daily-goals"
                        ? "task"
                        : activeTab === "placement-tracker"
                          ? "placement"
                          : "workspace"
                    )
                  }
                  size="icon"
                  aria-label="Quick add"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="icon" aria-label="Notifications">
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto lg:hidden">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              ))}
              {workspaces.map((workspace) => (
                <Button
                  key={workspace.id}
                  variant={activeTab === `workspace:${workspace.id}` ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setActiveTab(`workspace:${workspace.id}`)}
                >
                  <FolderKanban className="h-4 w-4" />
                  {workspace.name}
                </Button>
              ))}
            </div>
          </header>
          <div className="container py-6 md:py-8">
            {children}
          </div>
        </section>
      </div>

      <button
        onClick={() =>
          setModal(activeTab === "daily-goals" ? "task" : activeTab === "placement-tracker" ? "placement" : "workspace")
        }
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow transition hover:scale-105 md:hidden"
        aria-label="Quick add"
      >
        <Plus className="h-5 w-5" />
      </button>
    </main>
  );
}
