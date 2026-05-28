import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { useAutosaveDraft } from "@/hooks/useAutosaveDraft";
import { useLockedInStore } from "@/store/useLockedInStore";
import { toInputDate } from "@/lib/date";
import type { Placement, PlacementStatus } from "@/types";

const schema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  oaTestDate: z.string().min(1, "Date is required"),

  role: z.string().optional(),
  package: z.string().optional(),
  platform: z.string().optional(),
  testDuration: z.string().optional(),
  externalRemarks: z.string().optional()
});

type Values = z.infer<typeof schema>;

const defaults: Values = {
  companyName: "",
  oaTestDate: toInputDate(new Date()),

  role: "",
  package: "",
  platform: "",
  testDuration: "",
  externalRemarks: ""
};

export function PlacementForm({
    placement
  }: {
    placement?: Placement;
  }) {
  const addPlacement = useLockedInStore(
    (state) => state.addPlacement
  );
  const updatePlacement = useLockedInStore(
    (state) => state.updatePlacement
  );
  const deletePlacement = useLockedInStore(
    (state) => state.deletePlacement
  );
  const setModal = useLockedInStore(
    (state) => state.setModal
  );

  const { draft, setDraft, clearDraft } =
    useAutosaveDraft<Values>(
      "lockedin.placement-draft",
      defaults
    );

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: placement
  ? {
      companyName: placement.companyName,
      oaTestDate: toInputDate(
        new Date(placement.oaTestDate)
      ),

      role:
        placement.role === "-"
          ? ""
          : placement.role,

      package:
        placement.package === "-"
          ? ""
          : placement.package,

      platform:
        placement.platform === "-"
          ? ""
          : placement.platform,

      testDuration:
        placement.testDuration === "-"
          ? ""
          : placement.testDuration,

      externalRemarks:
        placement.externalRemarks || ""
    }
  : draft
  });

  const watched = useWatch({
    control: form.control
  });

  useEffect(() => {
    setDraft({
      ...defaults,
      ...watched
    });
  }, [setDraft, watched]);

  const onSubmit = async (values: Values) => {
    const placementData = {
      companyName: values.companyName,

      role: values.role || "-",

      package: values.package || "-",

      platform: values.platform || "-",

      testDuration:
        values.testDuration || "-",

      oaTestDate: new Date(
        values.oaTestDate
      ).toISOString(),

      applicationDeadline: new Date(
        values.oaTestDate
      ).toISOString(),

      externalRemarks:
        values.externalRemarks || "",

      status: (
        placement?.status || "oa-scheduled"
      ) as PlacementStatus,

      interviewDates: [],

      notes: "",

      preparationProgress: 0,

      dsaTopicsPrepared: [],

      resumeVersionUsed: ""
    };

    if (placement) {
      await updatePlacement(
        placement.id,
        placementData
      );
    } else {
      await addPlacement(placementData);
    }

    clearDraft();
    form.reset(defaults);
    setModal(null);
  };
  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          placeholder="Company *"
          {...form.register("companyName")}
        />

        <Input
          type="date"
          {...form.register("oaTestDate")}
        />

        <Input
          placeholder="Role"
          {...form.register("role")}
        />

        <Input
          placeholder="Package"
          {...form.register("package")}
        />

        <Input
          placeholder="Platform"
          {...form.register("platform")}
        />

        <Input
          placeholder="Test duration"
          {...form.register("testDuration")}
        />
      </div>

      <Textarea
        placeholder="External remarks"
        className="min-h-[90px]"
        {...form.register("externalRemarks")}
      />

      {(form.formState.errors.companyName ||
        form.formState.errors.oaTestDate) && (
        <p className="text-xs text-red-300">
          Company name and date are required.
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        {placement ? (
          <Button
            type="button"
            className="bg-red-500/20 text-red-300 hover:bg-red-500/30"
            onClick={async () => {
              await deletePlacement(placement.id);
              setModal(null);
            }}
          >
            Delete
          </Button>
        ) : (
          <div />
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setModal(null)}
          >
            Cancel
          </Button>

          <Button type="submit">
            {placement
              ? "Save changes"
              : "Add company"}
          </Button>
        </div>
      </div>
    </form>
  );
}