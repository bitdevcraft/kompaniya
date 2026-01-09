"use client";

import type {
  OrgEmailDomain,
  OrgEmailTemplate,
  OrgEmailTestReceiver,
} from "@repo/database/schema";

import { zodResolver } from "@hookform/resolvers/zod";
import { AsyncSelect } from "@kompaniya/ui-common/components/async-select";
import { Button } from "@kompaniya/ui-common/components/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@kompaniya/ui-common/components/form";
import { Input } from "@kompaniya/ui-common/components/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@kompaniya/ui-common/components/tabs";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@kompaniya/ui-common/components/toggle-group";
import {
  type EmailEditorOutputs,
  UiEditor,
} from "@kompaniya/ui-email-editor/editor";
import { HtmlEditor } from "@kompaniya/ui-monaco-editor/components/html-editor";
import { HtmlLivePreview } from "@kompaniya/ui-monaco-editor/components/html-live-preview";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import z from "zod";

import { env } from "@/env/client";
import { authClient } from "@/lib/auth/client";

import { dictTranslation, model, modelEndpoint } from "../config";

type MjmlJsonNode = {
  tagName: string;
  attributes?: Record<string, string>;
  children?: MjmlJsonNode[];
  content?: string;
};

const PREVIEW_STYLES = `body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  padding: 1.5rem;
  background-color: #ffffff;
  color: #0f172a;
}`;

const FormSchema = z.object({
  name: z.string().min(1, "Campaign name is missing"),
  subject: z.string().min(1, "Email subject is missing"),
  orgEmailDomainId: z.string().optional(),
  orgEmailTemplateId: z.string().optional(),
  orgEmailTestReceiverId: z.string().optional(),
  body: z.string().min(1, "Email content is required"),
  htmlContent: z.string().optional(),
  mjmlContent: z.string().optional(),
  mjmlJsonContent: z.string().optional(),
});

type FormValue = z.infer<typeof FormSchema>;

interface NewRecordFormProps {
  onFinish?: () => void;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isUuid = (value?: string) =>
  typeof value === "string" && UUID_REGEX.test(value);

const buildUrl = (endpoint: string) => {
  if (typeof window === "undefined") return endpoint;
  try {
    return new URL(endpoint, window.location.origin).toString();
  } catch {
    return endpoint;
  }
};

const normalizeEndpoint = (endpoint: string) => endpoint.replace(/\/$/, "");

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toArray = <T,>(data: unknown): T[] => {
  if (Array.isArray(data)) {
    return data.filter((entry): entry is T => isRecord(entry));
  }
  if (isRecord(data)) {
    if (Array.isArray(data.data)) {
      return data.data.filter((entry): entry is T => isRecord(entry));
    }
    if (isRecord(data.data)) {
      return [data.data as T];
    }
    return [data as T];
  }
  return [];
};

const fetchRecords = async <T,>(
  endpoint: string,
  query?: string,
): Promise<T[]> => {
  const base = normalizeEndpoint(buildUrl(endpoint));
  const trimmed = query?.trim();

  if (trimmed && isUuid(trimmed)) {
    const response = await axios.get(`${base}/r/${trimmed}`, {
      withCredentials: true,
    });
    return toArray<T>(response.data);
  }

  const url = new URL(`${base}/paginated`);
  if (trimmed) {
    url.searchParams.set("name", trimmed);
  }
  const response = await axios.get(url.toString(), { withCredentials: true });
  return toArray<T>(response.data);
};

const fetchRecordById = async <T,>(
  endpoint: string,
  id: string,
): Promise<T | null> => {
  if (!id) return null;
  const base = normalizeEndpoint(buildUrl(endpoint));
  const response = await axios.get(`${base}/r/${id}`, {
    withCredentials: true,
  });
  const [record] = toArray<T>(response.data);
  return record ?? null;
};

const useSubmit = () => {
  return useMutation({
    mutationFn: async (payload: FormValue) => {
      const res = await axios.post(`${modelEndpoint}`, payload, {
        withCredentials: true,
      });

      return res.data;
    },
  });
};

const stepMeta = [
  {
    title: "Campaign details",
    description: "Name and subject for your email campaign.",
  },
  {
    title: "Sending setup",
    description: "Choose the email domain and test receiver.",
  },
  {
    title: "Email content",
    description: "Pick a template and edit the message content.",
  },
];

export function NewRecordForm({ onFinish }: NewRecordFormProps) {
  const t = useTranslations(dictTranslation);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const form = useForm<FormValue>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      body: "",
      htmlContent: "",
      mjmlContent: "",
      mjmlJsonContent: "",
      name: "",
      orgEmailDomainId: "",
      orgEmailTemplateId: "",
      orgEmailTestReceiverId: "",
      subject: "",
    },
  });

  const submit = useSubmit();

  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] =
    useState<OrgEmailTemplate | null>(null);
  const [editorMode, setEditorMode] = useState<"mjml" | "html">("mjml");
  const [initialMjml, setInitialMjml] = useState<MjmlJsonNode | null>(null);
  const [templateLoading, setTemplateLoading] = useState(false);
  const htmlBody = useWatch({ control: form.control, name: "body" }) ?? "";

  const editorKey = useMemo(() => {
    const templateKey = selectedTemplate?.id ?? "new";
    return `${editorMode}-${templateKey}`;
  }, [editorMode, selectedTemplate?.id]);

  const domainEndpoint = `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/domain`;
  const templateEndpoint = `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/email-template`;
  const testReceiverEndpoint = `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/email-test-receiver`;

  const handleOutputsChange = useCallback(
    (outputs: EmailEditorOutputs) => {
      form.setValue("mjmlContent", outputs.mjmlOutput, { shouldDirty: true });
      form.setValue("mjmlJsonContent", outputs.jsonOutput, {
        shouldDirty: true,
      });
      form.setValue("htmlContent", outputs.htmlOutput, { shouldDirty: true });
      form.setValue("body", outputs.htmlOutput, { shouldDirty: true });
    },
    [form],
  );

  const handleHtmlChange = useCallback(
    (value: string) => {
      form.setValue("body", value, { shouldDirty: true });
      form.setValue("htmlContent", value, { shouldDirty: true });
    },
    [form],
  );

  const loadTemplate = useCallback(
    async (templateId: string) => {
      setTemplateLoading(true);
      try {
        const record = await fetchRecordById<OrgEmailTemplate>(
          templateEndpoint,
          templateId,
        );
        setSelectedTemplate(record);
      } finally {
        setTemplateLoading(false);
      }
    },
    [templateEndpoint],
  );

  useEffect(() => {
    if (!selectedTemplate) {
      setEditorMode("mjml");
      setInitialMjml(null);
      return;
    }

    const mjmlJson = selectedTemplate.mjmlJsonContent?.trim();
    const html = selectedTemplate.htmlContent?.trim();

    if (mjmlJson) {
      try {
        setInitialMjml(JSON.parse(mjmlJson) as MjmlJsonNode);
        setEditorMode("mjml");
      } catch {
        setInitialMjml(null);
        setEditorMode(html ? "html" : "mjml");
      }
    } else {
      setEditorMode("html");
      setInitialMjml(null);
    }

    form.setValue("mjmlContent", selectedTemplate.mjmlContent ?? "", {
      shouldDirty: true,
    });
    form.setValue("mjmlJsonContent", selectedTemplate.mjmlJsonContent ?? "", {
      shouldDirty: true,
    });
    form.setValue("htmlContent", selectedTemplate.htmlContent ?? "", {
      shouldDirty: true,
    });
    form.setValue("body", selectedTemplate.htmlContent ?? "", {
      shouldDirty: true,
    });
  }, [form, selectedTemplate]);

  useEffect(() => {
    if (editorMode !== "html") return;
    form.setValue("mjmlContent", "", { shouldDirty: true });
    form.setValue("mjmlJsonContent", "", { shouldDirty: true });
  }, [editorMode, form]);

  const stepFields: Record<number, Array<keyof FormValue>> = {
    1: ["name", "subject"],
    2: ["orgEmailDomainId", "orgEmailTestReceiverId"],
    3: ["body"],
  };

  const handleNext = async () => {
    const fields = stepFields[step] ?? [];
    const isValid = await form.trigger(fields);
    if (!isValid) return;
    setStep((current) => Math.min(current + 1, stepMeta.length));
  };

  const handleBack = () => {
    setStep((current) => Math.max(current - 1, 1));
  };

  const handleFinish = () => {
    if (onFinish) {
      onFinish();
      return;
    }
    router.push("/record/email-campaigns");
  };

  const onSubmit: SubmitHandler<FormValue> = (data) => {
    const payload: FormValue = {
      ...data,
      name: data.name.trim(),
      subject: data.subject.trim(),
      orgEmailDomainId: data.orgEmailDomainId?.trim() || undefined,
      orgEmailTemplateId: data.orgEmailTemplateId?.trim() || undefined,
      orgEmailTestReceiverId: data.orgEmailTestReceiverId?.trim() || undefined,
    };

    submit.mutate(payload, {
      onSuccess: () => {
        handleFinish();
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          form.setError("name", {
            type: "custom",
            message: error.response?.data?.message || error.message,
          });
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: [`${model.plural}-${activeOrganization?.id}`],
        });
      },
    });
  };

  const currentStep = stepMeta[step - 1];

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <input type="hidden" {...form.register("body")} />
        <input type="hidden" {...form.register("htmlContent")} />
        <input type="hidden" {...form.register("mjmlContent")} />
        <input type="hidden" {...form.register("mjmlJsonContent")} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Step {step} of {stepMeta.length}
            </p>
            <div className="text-lg font-semibold">{currentStep?.title}</div>
            <div className="text-sm text-muted-foreground">
              {currentStep?.description}
            </div>
          </div>
          <StepIndicator currentStep={step} totalSteps={stepMeta.length} />
        </div>

        {step === 1 && (
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign name</FormLabel>
                  <FormControl>
                    <Input placeholder="Spring launch" {...field} />
                  </FormControl>
                  <FormDescription>
                    Use an internal label to find this campaign later.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email subject</FormLabel>
                  <FormControl>
                    <Input placeholder="New product updates" {...field} />
                  </FormControl>
                  <FormDescription>
                    This line appears as the subject in the recipient inbox.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="orgEmailDomainId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email domain</FormLabel>
                  <AsyncSelect<OrgEmailDomain>
                    fetcher={(query) =>
                      fetchRecords<OrgEmailDomain>(domainEndpoint, query)
                    }
                    getDisplayValue={(option) => option.name ?? option.id}
                    getOptionValue={(option) => option.id}
                    label="domain"
                    onChange={(value) => field.onChange(value || "")}
                    placeholder="Select a sending domain"
                    renderOption={(option) => (
                      <div className="flex flex-col">
                        <span>{option.name ?? option.id}</span>
                        {option.email ? (
                          <span className="text-xs text-muted-foreground">
                            {option.email}
                          </span>
                        ) : null}
                      </div>
                    )}
                    triggerClassName="w-full justify-between"
                    value={field.value ?? ""}
                    width="100%"
                  />
                  <FormDescription>
                    The verified domain used to send this campaign.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="orgEmailTestReceiverId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test receiver list</FormLabel>
                  <AsyncSelect<OrgEmailTestReceiver>
                    fetcher={(query) =>
                      fetchRecords<OrgEmailTestReceiver>(
                        testReceiverEndpoint,
                        query,
                      )
                    }
                    getDisplayValue={(option) => option.name ?? option.id}
                    getOptionValue={(option) => option.id}
                    label="test receiver"
                    onChange={(value) => field.onChange(value || "")}
                    placeholder="Select a test recipient list"
                    renderOption={(option) => (
                      <div className="flex flex-col">
                        <span>{option.name ?? option.id}</span>
                        {option.emails?.length ? (
                          <span className="text-xs text-muted-foreground">
                            {option.emails.join(", ")}
                          </span>
                        ) : null}
                      </div>
                    )}
                    triggerClassName="w-full justify-between"
                    value={field.value ?? ""}
                    width="100%"
                  />
                  <FormDescription>
                    Send test emails to validate the message before launch.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="orgEmailTemplateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template</FormLabel>
                  <AsyncSelect<OrgEmailTemplate>
                    fetcher={(query) =>
                      fetchRecords<OrgEmailTemplate>(templateEndpoint, query)
                    }
                    getDisplayValue={(option) => option.name ?? option.id}
                    getOptionValue={(option) => option.id}
                    label="template"
                    onChange={(value) => {
                      const nextValue = value || "";
                      field.onChange(nextValue);
                      if (!nextValue) {
                        setSelectedTemplate(null);
                        return;
                      }
                      void loadTemplate(nextValue);
                    }}
                    placeholder="Select an email template"
                    renderOption={(option) => (
                      <div className="flex flex-col">
                        <span>{option.name ?? option.id}</span>
                        {option.subject ? (
                          <span className="text-xs text-muted-foreground">
                            {option.subject}
                          </span>
                        ) : null}
                      </div>
                    )}
                    triggerClassName="w-full justify-between"
                    value={field.value ?? ""}
                    width="100%"
                  />
                  <FormDescription>
                    Selecting a template will prefill the editor content.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {templateLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading template content...
              </div>
            )}

            {!selectedTemplate && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/10 px-3 py-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Editor mode
                </div>
                <ToggleGroup
                  aria-label="Choose editor mode"
                  onValueChange={(value) => {
                    if (!value) return;
                    setEditorMode(value as "mjml" | "html");
                  }}
                  size="sm"
                  type="single"
                  value={editorMode}
                  variant="outline"
                >
                  <ToggleGroupItem className="px-4" value="mjml">
                    Visual
                  </ToggleGroupItem>
                  <ToggleGroupItem className="px-4" value="html">
                    HTML
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            )}

            {editorMode === "html" ? (
              <Tabs className="space-y-3" defaultValue="code">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="code">Code</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent className="space-y-3" value="code">
                  <div className="rounded-md border">
                    <HtmlEditor
                      editorClassName="h-[360px]"
                      height={360}
                      onValueChange={handleHtmlChange}
                      options={{ minimap: { enabled: false }, wordWrap: "on" }}
                      value={htmlBody}
                    />
                  </div>
                </TabsContent>
                <TabsContent className="space-y-3" value="preview">
                  <HtmlLivePreview
                    frameClassName="min-h-[360px]"
                    header="Live preview"
                    html={htmlBody}
                    previewStyles={PREVIEW_STYLES}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="min-h-svh">
                <UiEditor
                  initialValue={initialMjml}
                  key={editorKey}
                  onOutputsChange={handleOutputsChange}
                />
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          {step === 1 ? (
            <Button
              className="w-full sm:w-auto"
              onClick={handleFinish}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
          ) : (
            <Button
              className="w-full sm:w-auto"
              onClick={handleBack}
              type="button"
              variant="outline"
            >
              Back
            </Button>
          )}

          {step < stepMeta.length ? (
            <Button
              className="w-full sm:w-auto"
              onClick={handleNext}
              type="button"
            >
              Next
            </Button>
          ) : (
            <Button
              className="w-full sm:w-auto"
              disabled={submit.isPending}
              type="submit"
            >
              {submit.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>{t("form.new.submit")}</>
              )}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}

function StepIndicator({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            index + 1 === currentStep
              ? "w-8 bg-foreground"
              : index + 1 < currentStep
                ? "w-2 bg-foreground"
                : "w-2 bg-muted"
          }`}
          key={index}
        />
      ))}
    </div>
  );
}
