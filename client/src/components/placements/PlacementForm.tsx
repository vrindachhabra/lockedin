import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAutosaveDraft } from "@/hooks/useAutosaveDraft";
import { useLockedInStore } from "@/store/useLockedInStore";
import { toInputDate } from "@/lib/date";

const schema = z.object({
  companyName: z.string().min(2),
  role: z.string().min(2),
  package: z.string().min(1),
  oaTestDate: z.string().min(1),
  applicationDeadline: z.string().min(1),
  interviewDates: z.string().optional(),
  platform: z.string().min(1),
  testDuration: z.string().min(1),
  status: z.enum(["wishlist", "applied", "oa-scheduled", "interview", "offer", "rejected"]),
  notes: z.string(),
  preparationProgress: z.coerce.number().min(0).max(100),
  dsaTopicsPrepared: z.string(),
  resumeVersionUsed: z.string(),
  externalRemarks: z.string()
});

type Values = z.infer<typeof schema>;

const defaults: Values = {
  companyName: "",
  role: "",
  package: "",
  oaTestDate: toInputDate(new Date()),
  applicationDeadline: toInputDate(new Date()),
  interviewDates: "",
  platform: "HackerRank",
  testDuration: "90 minutes",
  status: "wishlist",
  notes: "",
  preparationProgress: 0,
  dsaTopicsPrepared: "",
  resumeVersionUsed: "resume-v1",
  externalRemarks: ""
};

export function PlacementForm() {
  const addPlacement = useLockedInStore((state) => state.addPlacement);
  const setModal = useLockedInStore((state) => state.setModal);
  const { draft, setDraft, clearDraft } = useAutosaveDraft<Values>("lockedin.placement-draft", defaults);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: draft });
  const watched = useWatch({ control: form.control });

  useEffect(() => setDraft({ ...defaults, ...watched }), [setDraft, watched]);

  const onSubmit = async (values: Values) => {
    await addPlacement({
      ...values,
      oaTestDate: new Date(values.oaTestDate).toISOString(),
      applicationDeadline: new Date(values.applicationDeadline).toISOString(),
      interviewDates: values.interviewDates
        ? values.interviewDates.split(",").map((date) => new Date(date.trim()).toISOString())
        : [],
      dsaTopicsPrepared: values.dsaTopicsPrepared.split(",").map((topic) => topic.trim()).filter(Boolean)
    });
    clearDraft();
    setModal(null);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input placeholder="Company" {...form.register("companyName")} />
        <Input placeholder="Role" {...form.register("role")} />
        <Input placeholder="Package" {...form.register("package")} />
        <Input placeholder="Platform" {...form.register("platform")} />
        <Input type="date" {...form.register("oaTestDate")} />
        <Input type="date" {...form.register("applicationDeadline")} />
        <Input placeholder="Interview dates, comma separated" {...form.register("interviewDates")} />
        <Input placeholder="Test duration" {...form.register("testDuration")} />
        <Select {...form.register("status")}>
          <option value="wishlist">Wishlist</option>
          <option value="applied">Applied</option>
          <option value="oa-scheduled">OA scheduled</option>
          <option value="interview">Interview</option>
          <option value="offer">Offer</option>
          <option value="rejected">Rejected</option>
        </Select>
        <Input type="number" placeholder="Preparation progress" {...form.register("preparationProgress")} />
        <Input placeholder="Resume version used" {...form.register("resumeVersionUsed")} />
        <Input placeholder="DSA topics, comma separated" {...form.register("dsaTopicsPrepared")} />
      </div>
      <Textarea placeholder="Notes" {...form.register("notes")} />
      <Textarea placeholder="External remarks" {...form.register("externalRemarks")} />
      {form.formState.errors.companyName && <p className="text-xs text-red-300">Company and role are required.</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
        <Button type="submit">Add company</Button>
      </div>
    </form>
  );
}
