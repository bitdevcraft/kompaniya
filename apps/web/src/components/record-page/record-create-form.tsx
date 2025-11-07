"use client";

import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import { Button } from "@repo/shared-ui/components/common/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/shared-ui/components/common/card";
import { Form, FormField } from "@repo/shared-ui/components/common/form";
import { ScrollArea } from "@repo/shared-ui/components/common/scroll-area";
import { cn } from "@repo/shared-ui/lib/utils";
import { Loader2 } from "lucide-react";
import * as React from "react";

import type {
  RecordLayoutField,
  RecordLayoutSection,
  RecordPageLayout,
} from "./layout";

import { BooleanRecordField } from "./boolean-record-field";
import { DateRecordField } from "./date-record-field";
import { DatetimeRecordField } from "./datetime-record-field";
import { HtmlRecordField } from "./html-record-field";
import { getCreateLayoutFields } from "./layout-helpers";
import { LookupRecordField } from "./lookup-record-field";
import { MultipicklistRecordField } from "./multipicklist-record-field";
import { NumberRecordField } from "./number-record-field";
import { PhoneRecordField } from "./phone-record-field";
import { PicklistRecordField } from "./picklist-record-field";
import { TextRecordField } from "./text-record-field";
import { TextareaRecordField } from "./textarea-record-field";

type FieldComponent = (props: {
  description?: string;
  editing: boolean;
  fallback?: string;
  label: string;
  lookup?: RecordLayoutField["lookup"];
  name?: string;
  onBlur?: () => void;
  onChange?: (value: unknown) => void;
  placeholder?: string;
  options?: RecordLayoutField["options"];
  value?: unknown;
}) => JSX.Element | null;

const CREATE_FIELD_COMPONENTS: Record<
  RecordLayoutField["type"],
  FieldComponent
> = {
  boolean: BooleanRecordField as FieldComponent,
  date: DateRecordField as FieldComponent,
  datetime: DatetimeRecordField as FieldComponent,
  html: HtmlRecordField as FieldComponent,
  lookup: LookupRecordField as FieldComponent,
  multipicklist: MultipicklistRecordField as FieldComponent,
  number: NumberRecordField as FieldComponent,
  phone: PhoneRecordField as FieldComponent,
  picklist: PicklistRecordField as FieldComponent,
  text: TextRecordField as FieldComponent,
  textarea: TextareaRecordField as FieldComponent,
};

export interface RecordCreateFormProps<TFieldValues extends FieldValues> {
  cancelLabel?: string;
  form: UseFormReturn<TFieldValues>;
  isSubmitting?: boolean;
  layout: RecordPageLayout<TFieldValues>;
  mode?: "single-column" | "multi-step";
  onCancel?: () => void;
  onSubmit: (values: TFieldValues) => void;
  submitLabel?: string;
}

type StepConfig<TFieldValues extends FieldValues> = {
  fieldIds: Path<TFieldValues>[];
  id: string;
  sections: RecordLayoutSection<TFieldValues>[];
  title: string;
};

export function RecordCreateForm<TFieldValues extends FieldValues>({
  cancelLabel = "Cancel",
  form,
  isSubmitting,
  layout,
  mode = "single-column",
  onCancel,
  onSubmit,
  submitLabel = "Save",
}: RecordCreateFormProps<TFieldValues>) {
  const sections = React.useMemo(() => {
    return collectCreateSections(layout);
  }, [layout]);

  const steps = React.useMemo(() => {
    if (mode !== "multi-step") return [];
    return buildStepsForLayout(layout);
  }, [layout, mode]);

  const [activeStep, setActiveStep] = React.useState(0);

  const currentStep = mode === "multi-step" ? steps[activeStep] : undefined;

  React.useEffect(() => {
    if (mode === "multi-step" && activeStep >= steps.length) {
      setActiveStep(steps.length > 0 ? steps.length - 1 : 0);
    }
  }, [activeStep, mode, steps.length]);

  const handleNextStep = async () => {
    if (mode !== "multi-step") return;
    const step = steps[activeStep];
    if (!step) return;

    const isValid = await form.trigger(step.fieldIds);
    if (!isValid) {
      return;
    }

    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePreviousStep = () => {
    if (mode !== "multi-step") return;
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const renderSections = () => {
    if (mode === "multi-step") {
      if (!currentStep) return null;
      return (
        <div className="space-y-6">
          {currentStep.sections.map((section) => (
            <CreateSection form={form} key={section.id} section={section} />
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {sections.map((section) => (
          <CreateSection form={form} key={section.id} section={section} />
        ))}
      </div>
    );
  };

  const showStepControls = mode === "multi-step" && steps.length > 0;
  const isLastStep =
    mode === "multi-step" ? activeStep === steps.length - 1 : true;

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        {showStepControls ? (
          <StepIndicator activeStep={activeStep} steps={steps} />
        ) : null}

        <ScrollArea className="h-[70vh] px-4">{renderSections()}</ScrollArea>

        <div className="flex w-full flex-wrap justify-end gap-2">
          {onCancel ? (
            <Button
              disabled={isSubmitting}
              onClick={onCancel}
              type="button"
              variant="outline"
            >
              {cancelLabel}
            </Button>
          ) : null}
          {showStepControls && steps.length > 1 && activeStep > 0 ? (
            <Button
              disabled={isSubmitting}
              onClick={handlePreviousStep}
              type="button"
              variant="outline"
            >
              Back
            </Button>
          ) : null}
          {showStepControls && !isLastStep ? (
            <Button
              disabled={isSubmitting}
              onClick={handleNextStep}
              type="button"
            >
              Next
            </Button>
          ) : (
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                submitLabel
              )}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}

function buildStepsForLayout<TFieldValues extends FieldValues>(
  layout: RecordPageLayout<TFieldValues>,
) {
  const steps: StepConfig<TFieldValues>[] = [];

  const addStep = (
    id: string,
    sections: RecordLayoutSection<TFieldValues>[] | undefined,
  ) => {
    if (!sections || sections.length === 0) return;
    const filtered = sections
      .map((section) => filterSection(section))
      .filter((section): section is RecordLayoutSection<TFieldValues> =>
        Boolean(section),
      );

    if (filtered.length === 0) return;

    const title = filtered.find((section) => Boolean(section.title))?.title;
    const fieldIds = filtered.flatMap((section) =>
      section.fields.map((field) => field.id),
    );

    steps.push({
      fieldIds,
      id,
      sections: filtered,
      title: title ?? buildStepTitle(steps.length),
    });
  };

  if (layout.sectionColumns) {
    addStep("header", layout.sectionColumns.header?.sections);
    addStep("primary", layout.sectionColumns.firstColumn?.sections);
    addStep("secondary", layout.sectionColumns.secondColumn?.sections);
  }

  if (layout.sections) {
    layout.sections.forEach((section, index) => {
      addStep(`section-${index}`, [section]);
    });
  }

  if (steps.length === 0) {
    const fields = getCreateLayoutFields(layout);
    if (fields.length > 0) {
      steps.push({
        fieldIds: fields.map((field) => field.id),
        id: "default",
        sections: collectCreateSections(layout),
        title: buildStepTitle(0),
      });
    }
  }

  return steps;
}

function buildStepTitle(index: number) {
  return `Step ${index + 1}`;
}

function collectCreateSections<TFieldValues extends FieldValues>(
  layout: RecordPageLayout<TFieldValues>,
) {
  const sections: RecordLayoutSection<TFieldValues>[] = [];
  const pushSections = (
    entries: RecordLayoutSection<TFieldValues>[] | undefined,
  ) => {
    if (!entries) return;
    for (const section of entries) {
      const filtered = filterSection(section);
      if (filtered) {
        sections.push(filtered);
      }
    }
  };

  if (layout.sectionColumns) {
    pushSections(layout.sectionColumns.header?.sections);
    pushSections(layout.sectionColumns.firstColumn?.sections);
    pushSections(layout.sectionColumns.secondColumn?.sections);
  }

  pushSections(layout.sections);

  return sections;
}

function CreateField<TFieldValues extends FieldValues>({
  field,
  form,
}: {
  field: RecordLayoutField<TFieldValues>;
  form: UseFormReturn<TFieldValues>;
}) {
  const Component = CREATE_FIELD_COMPONENTS[field.type];
  if (!Component) return null;

  return (
    <FormField
      control={form.control}
      name={field.id}
      render={({ field: controllerField }) => (
        <Component
          description={field.description}
          editing
          label={field.label}
          lookup={field.lookup}
          name={field.id as string}
          onBlur={controllerField.onBlur}
          onChange={(value) => controllerField.onChange(value)}
          options={field.options}
          placeholder={field.placeholder}
          value={controllerField.value}
        />
      )}
    />
  );
}

function CreateSection<TFieldValues extends FieldValues>({
  form,
  section,
}: {
  form: UseFormReturn<TFieldValues>;
  section: RecordLayoutSection<TFieldValues>;
}) {
  const fields = section.fields.filter(
    (field) => field.availableOnCreate !== false && !field.readOnly,
  );

  if (fields.length === 0) {
    return null;
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="space-y-2">
        {section.title ? (
          <CardTitle className="text-lg">{section.title}</CardTitle>
        ) : null}
        {section.description ? (
          <CardDescription className="max-w-2xl text-sm text-muted-foreground">
            {section.description}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6">
          {fields.map((field) => (
            <div key={field.id as string}>
              <CreateField field={field} form={form} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function filterSection<TFieldValues extends FieldValues>(
  section: RecordLayoutSection<TFieldValues>,
) {
  const fields = section.fields.filter(
    (field) => field.availableOnCreate !== false && !field.readOnly,
  );

  if (fields.length === 0) {
    return null;
  }

  return {
    ...section,
    fields,
  } satisfies RecordLayoutSection<TFieldValues>;
}

function StepIndicator<TFieldValues extends FieldValues>({
  activeStep,
  steps,
}: {
  activeStep: number;
  steps: StepConfig<TFieldValues>[];
}) {
  if (steps.length === 0) return null;

  return (
    <ol className="flex flex-wrap items-center gap-3 text-sm font-medium">
      {steps.map((step, index) => {
        const isActive = index === activeStep;
        const isComplete = index < activeStep;

        return (
          <li
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1",
              isActive
                ? "border-primary bg-primary/10 text-primary"
                : isComplete
                  ? "border-muted-foreground/40 text-muted-foreground"
                  : "border-border text-muted-foreground",
            )}
            key={step.id}
          >
            <span className="flex size-6 items-center justify-center rounded-full border bg-background text-xs">
              {index + 1}
            </span>
            <span>{step.title}</span>
          </li>
        );
      })}
    </ol>
  );
}
