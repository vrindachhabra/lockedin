import { Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useLockedInStore } from "@/store/useLockedInStore";

const examples = [
  "Track my DSA preparation, daily coding questions solved, OS/DBMS/OOP completion, and revision progress.",
  "Create a gym tracker with workouts, progressive overload, body measurements, weekly consistency, and nutrition notes.",
  "Build a startup management board for product roadmap, experiments, user feedback, metrics, and investor follow-ups."
];

export function WorkspaceGenerator() {
  const [prompt, setPrompt] = useState(examples[0]);
  const generateWorkspace = useLockedInStore((state) => state.generateWorkspace);
  const isLoading = useLockedInStore((state) => state.isLoading);

  return (
    <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
      <Card>
        <CardHeader>
          <CardTitle>AI workspace generator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <p className="mt-3 text-sm font-semibold">Describe what you want to organize.</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              LockedIn converts your prompt into a schema-backed dashboard with sections, widgets, fields,
              analytics, sample entries, and editable layouts.
            </p>
          </div>
          <Textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            className="mt-4 min-h-44"
            placeholder="I want to track..."
          />
          <div className="mt-4 flex justify-end">
            <Button disabled={isLoading || prompt.trim().length < 10} onClick={() => generateWorkspace(prompt)}>
              <Sparkles className="h-4 w-4" />
              {isLoading ? "Generating..." : "Generate workspace"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Prompt starters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {examples.map((example) => (
              <button
                key={example}
                onClick={() => setPrompt(example)}
                className="w-full rounded-xl border border-white/8 bg-white/[0.04] p-4 text-left text-sm leading-6 text-muted-foreground transition hover:bg-white/[0.07] hover:text-foreground"
              >
                {example}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
