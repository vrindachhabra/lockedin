import { GripVertical, Send, Sparkles, Pencil } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useLockedInStore } from "@/store/useLockedInStore";
import type { WorkspaceConfig, WorkspaceSection, WorkspaceWidget } from "@/types";
import { cn } from "@/lib/utils";

function EditableValue({ value }: { value?: string | number | boolean }) {
  const [local, setLocal] = useState(String(value ?? ""));
  return <Input value={local} onChange={(event) => setLocal(event.target.value)} />;
}

function WidgetCard({ widget }: { widget: WorkspaceWidget }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.04] p-4">
      <div className="mb-3">
        <p className="text-sm font-semibold">{widget.title}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{widget.description}</p>
      </div>
      {widget.type === "metric" && (
        <div>
          <p className="text-xs text-muted-foreground">{widget.metricLabel ?? "Metric"}</p>
          <p className="mt-2 text-3xl font-bold">{String(widget.value ?? 0)}</p>
        </div>
      )}
      {widget.type === "progress" && <Progress value={widget.progress ?? Number(widget.value ?? 0)} />}
      {widget.type === "notes" && <Textarea defaultValue={String(widget.value ?? "")} />}
      {widget.type === "tags" && (
        <div className="flex flex-wrap gap-2">
          {(widget.tags ?? []).map((tag) => <span key={tag} className="rounded-md bg-white/8 px-2 py-1 text-xs">{tag}</span>)}
        </div>
      )}
      {widget.type === "checklist" && (
        <div className="space-y-2">
          {(widget.items ?? []).map((item, index) => (
            <label key={`${widget.id}-${index}`} className="flex items-center gap-2 text-sm">
              <input type="checkbox" defaultChecked={Boolean(item.done)} className="accent-sky-400" />
              <span>{String(item.title ?? item.item ?? "Checklist item")}</span>
            </label>
          ))}
        </div>
      )}
      {widget.type === "deadline" && <EditableValue value={widget.value ?? "This week"} />}
      {(widget.type === "table" || widget.type === "chart") && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>{(widget.fields ?? []).map((field) => <th key={field.id} className="pb-2 pr-3">{field.label}</th>)}</tr>
            </thead>
            <tbody>
              {(widget.items ?? []).map((item, index) => (
                <tr key={`${widget.id}-row-${index}`} className="border-t border-white/8">
                  {(widget.fields ?? []).map((field) => (
                    <td key={field.id} className="py-2 pr-3">
                      {field.type === "progress" ? (
                        <div className="min-w-24"><Progress value={Number(item[field.id] ?? item.progress ?? 0)} /></div>
                      ) : (
                        <EditableValue value={item[field.id] as string | number | boolean | undefined} />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SectionCard({
  section,
  draggable,
  onDragStart,
  onDrop
}: {
  section: WorkspaceSection;
  draggable: boolean;
  onDragStart: () => void;
  onDrop: () => void;
}) {
  return (
    <Card
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
      className="overflow-hidden"
    >
      <CardHeader>
        <div>
          <CardTitle>{section.title}</CardTitle>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{section.description}</p>
        </div>
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={cn("grid gap-3", section.layout === "grid" ? "md:grid-cols-2" : "grid-cols-1")}>
          {section.widgets.map((widget) => <WidgetCard key={widget.id} widget={widget} />)}
        </div>
      </CardContent>
    </Card>
  );
}

export function WorkspaceRenderer({ workspace }: { workspace: WorkspaceConfig }) {
  const refineWorkspace = useLockedInStore((state) => state.refineWorkspace);
  const updateWorkspaceSections = useLockedInStore((state) => state.updateWorkspaceSections);
  const isLoading = useLockedInStore((state) => state.isLoading);
  const [instruction, setInstruction] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const orderedSections = useMemo(() => workspace.sections, [workspace.sections]);

  const moveSection = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    const next = [...orderedSections];
    const [moved] = next.splice(draggedIndex, 1);
    next.splice(targetIndex, 0, moved);
    setDraggedIndex(null);
    void updateWorkspaceSections(workspace.id, next);
  };

  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_23rem]">
      <div className="space-y-4">
        <Card className="p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase">AI generated workspace</span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <h2 className="text-3xl font-bold">{workspace.name}</h2>
                <button
                  className="rounded p-1 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    const newName = window.prompt("Rename workspace", workspace.name);
                    if (newName && newName.trim().length > 0) {
                      const updateWorkspace = useLockedInStore.getState().updateWorkspace;
                      void updateWorkspace(workspace.id, { name: newName.trim() });
                    }
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{workspace.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {workspace.tags.map((tag) => <span key={tag} className="rounded-md bg-white/8 px-2 py-1 text-xs">{tag}</span>)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {workspace.analytics.filter((m) => !/upcoming\s*tests?/i.test(m.label)).map((metric) => (
                <div key={metric.id} className="rounded-lg border border-white/8 bg-white/[0.04] p-3">
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                  <p className="mt-1 text-xl font-bold">{metric.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{metric.trend}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
        {orderedSections.map((section, index) => (
          <SectionCard
            key={section.id}
            section={section}
            draggable
            onDragStart={() => setDraggedIndex(index)}
            onDrop={() => moveSection(index)}
          />
        ))}
      </div>
      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>AI assistant</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">
              Refine this workspace with instructions like "add weekly revision tracking" or "track consistency streaks."
            </p>
            <Textarea
              value={instruction}
              onChange={(event) => setInstruction(event.target.value)}
              className="mt-4"
              placeholder="Add weekly revision tracking..."
            />
            <Button
              className="mt-3 w-full"
              disabled={isLoading || instruction.trim().length < 4}
              onClick={() => {
                void refineWorkspace(workspace.id, instruction);
                setInstruction("");
              }}
            >
              <Send className="h-4 w-4" />
              {isLoading ? "Refining..." : "Refine workspace"}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Generated database schema</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Collection: {workspace.schema.collectionName}</p>
            <div className="mt-3 space-y-2">
              {workspace.schema.fields.map((field) => (
                <div key={field.id} className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2 text-xs">
                  <span>{field.label}</span>
                  <span className="text-muted-foreground">{field.type}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </aside>
    </section>
  );
}
