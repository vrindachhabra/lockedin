import { useState, useEffect } from "react";
import {
  BriefcaseBusiness,
  CalendarCheck2,
  FolderKanban,
  LogOut,
  Menu,
  Moon,
  Plus,
  Search,
  Sun,
  Pencil,
  Trash2
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

  const [tabLabels, setTabLabels] = useState({
    "daily-goals": "Daily Goals",
    "placement-tracker": "Placement Tracker"
  });
  const [editingTabId, setEditingTabId] = useState<"daily-goals" | "placement-tracker" | null>(null);
  const [editingTabValue, setEditingTabValue] = useState("");
  const [editingWorkspaceId, setEditingWorkspaceId] = useState<string | null>(null);
  const [editingWorkspaceValue, setEditingWorkspaceValue] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("lockedin-tab-labels");
    if (stored) {
      try {
        setTabLabels(JSON.parse(stored));
      } catch {
        // ignore invalid storage
      }
    }
  }, []);

  const saveTabLabel = (id: "daily-goals" | "placement-tracker", value: string) => {
    const next = { ...tabLabels, [id]: value.trim() };
    setTabLabels(next);
    localStorage.setItem("lockedin-tab-labels", JSON.stringify(next));
  };

  const finishTabEdit = () => {
    if (editingTabId && editingTabValue.trim().length > 0) {
      saveTabLabel(editingTabId, editingTabValue);
    }
    setEditingTabId(null);
    setEditingTabValue("");
  };

  const cancelTabEdit = () => {
    setEditingTabId(null);
    setEditingTabValue("");
  };

  const finishWorkspaceEdit = () => {
    if (editingWorkspaceId && editingWorkspaceValue.trim().length > 0) {
      const updateWorkspace = useLockedInStore.getState().updateWorkspace;
      void updateWorkspace(editingWorkspaceId, { name: editingWorkspaceValue.trim() });
    }
    setEditingWorkspaceId(null);
    setEditingWorkspaceValue("");
  };

  const cancelWorkspaceEdit = () => {
    setEditingWorkspaceId(null);
    setEditingWorkspaceValue("");
  };

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('light') ? 'light' : 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
      setTheme('light');
    } else {
      document.documentElement.classList.remove('light');
      setTheme('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    }
  };

  const tabs = [
    { id: "daily-goals" as const, label: "Daily Goals", icon: CalendarCheck2 },
    { id: "placement-tracker" as const, label: "Placement Tracker", icon: BriefcaseBusiness }
  ];

  return (
    <main className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="surface-line absolute inset-0 opacity-80" />
        {activeTab !== "workspace-generator" && (
          <div className="absolute left-1/2 top-0 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-primary/12 blur-3xl" />
        )}
      </div>
      <div className="relative flex min-h-screen">
        {/* Mobile Menu Backdrop */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen w-72 shrink-0 flex-col border-r border-white/8 bg-background/95 p-5 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="LockedIn Logo" className="h-16 w-16 object-contain rounded-xl shadow-lg border border-white/10" />
            <div>
              <p className="text-lg font-bold">LockedIn</p>
              <p className="text-xs text-muted-foreground">Your life. Organized.</p>
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={() => { setActiveTab("workspace-generator"); setMobileMenuOpen(false); }}
              className="flex h-11 w-full items-center gap-3 rounded-full bg-slate-800/90 px-4 text-left text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              <Plus className="h-4 w-4" />
              Create Workspace
            </button>
          </div>

          <nav className="mt-4 flex flex-col flex-1 min-h-0 overflow-hidden">
            {tabs.map((tab) => (
              <div key={tab.id} className="group relative">
                <button
                  onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                  className={cn(
                    "flex h-11 w-full items-center gap-3 rounded-lg px-3 pr-14 text-left text-sm font-semibold text-muted-foreground transition hover:bg-white/8 hover:text-foreground",
                    activeTab === tab.id && "bg-white/10 text-foreground"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {editingTabId === tab.id ? (
                    <input
                      autoFocus
                      value={editingTabValue}
                      onChange={(event) => setEditingTabValue(event.target.value)}
                      onBlur={finishTabEdit}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          finishTabEdit();
                        }
                        if (event.key === "Escape") {
                          cancelTabEdit();
                        }
                      }}
                      className="w-full bg-transparent text-left text-sm font-semibold text-foreground outline-none"
                    />
                  ) : (
                    <span className="truncate">{tabLabels[tab.id]}</span>
                  )}
                </button>
                {editingTabId !== tab.id && (
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      setEditingTabId(tab.id);
                      setEditingTabValue(tabLabels[tab.id]);
                    }}
                    aria-label={`Rename ${tabLabels[tab.id]}`}
                    className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded p-2 text-muted-foreground transition hover:text-foreground group-hover:inline-flex"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}

            <div className="mt-2 flex-1 min-h-0 overflow-y-auto pr-1 pb-4 space-y-2">
              {workspaces.map((workspace) => (
                <div key={workspace.id} className="group relative">
                  <button
                    onClick={() => { setActiveTab(`workspace:${workspace.id}`); setMobileMenuOpen(false); }}
                    className={cn(
                      "flex h-11 w-full items-center gap-3 rounded-lg px-3 pr-14 text-left text-sm font-semibold text-muted-foreground transition hover:bg-white/8 hover:text-foreground",
                      activeTab === `workspace:${workspace.id}` && "bg-white/10 text-foreground"
                    )}
                  >
                    <FolderKanban className="h-4 w-4" />
                    {editingWorkspaceId === workspace.id ? (
                      <input
                        autoFocus
                        value={editingWorkspaceValue}
                        onChange={(event) => setEditingWorkspaceValue(event.target.value)}
                        onBlur={finishWorkspaceEdit}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            finishWorkspaceEdit();
                          }
                          if (event.key === "Escape") {
                            cancelWorkspaceEdit();
                          }
                        }}
                        className="w-full bg-transparent text-left text-sm font-semibold text-foreground outline-none"
                      />
                    ) : (
                      <span className="truncate">{workspace.name}</span>
                    )}
                  </button>
                  <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                    {editingWorkspaceId !== workspace.id && (
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          setEditingWorkspaceId(workspace.id);
                          setEditingWorkspaceValue(workspace.name);
                        }}
                        aria-label="Rename workspace"
                        className="pointer-events-auto rounded p-2 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        if (window.confirm(`Delete workspace '${workspace.name}'? This cannot be undone.`)) {
                          const deleteWorkspace = useLockedInStore.getState().deleteWorkspace;
                          void deleteWorkspace(workspace.id);
                        }
                      }}
                      aria-label="Delete workspace"
                      className="pointer-events-auto rounded p-2 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </nav>

          <div className="mt-auto pt-4 border-t border-white/8">
            <Button variant="ghost" className="w-full justify-start" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          </div>
        </aside>

        <section className="min-w-0 flex-1 lg:ml-72">
          <header className="sticky top-0 z-30 border-b border-white/8 bg-background/75 px-4 py-4 backdrop-blur-xl md:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button variant="secondary" size="icon" className="lg:hidden" aria-label="Open navigation" onClick={() => setMobileMenuOpen(true)}>
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
              <div className="flex items-center gap-2">
                {activeTab !== "workspace-generator" && (
                  <div className="hidden h-10 min-w-80 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.055] px-3 text-sm text-muted-foreground md:flex">
                    <Search className="h-4 w-4" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      className="w-full bg-transparent outline-none"
                      placeholder={activeTab === "placement-tracker" ? "Search companies, roles, platforms" : "Search tasks"}
                    />
                  </div>
                )}
                {activeTab !== "daily-goals" && activeTab !== "placement-tracker" && activeTab !== "workspace-generator" && (
                  <Button
                    onClick={() => setActiveTab("workspace-generator")}
                    size="icon"
                    aria-label="Quick add"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="secondary" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
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
              <Button
                variant={activeTab === "workspace-generator" ? "default" : "secondary"}
                size="sm"
                onClick={() => setActiveTab("workspace-generator")}
              >
                <Plus className="h-4 w-4" />
                Create Workspace
              </Button>
            </div>
          </header>
          <div className={cn(activeTab === "workspace-generator" ? "w-full" : "container py-6 md:py-8")}>
            {children}
          </div>
        </section>
      </div>

      <button
        onClick={() => {
          if (activeTab === "daily-goals") {
            setModal("task");
          } else if (activeTab === "placement-tracker") {
            setModal("placement");
          } else if (activeTab !== "workspace-generator") {
            setActiveTab("workspace-generator");
          }
        }}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow transition hover:scale-105 md:hidden"
        aria-label="Quick add"
      >
        <Plus className="h-5 w-5" />
      </button>
    </main>
  );
}
