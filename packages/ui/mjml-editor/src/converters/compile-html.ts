export interface CompileHtmlOptions {
  endpoint?: string;
}

export interface CompileHtmlResult {
  html: string;
  errors: Array<{ message: string }>;
}

export const compileHtml = async (
  mjml: string,
  options: CompileHtmlOptions = {},
): Promise<CompileHtmlResult> => {
  const endpoint = options.endpoint ?? "/api/mjml/compile";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mjml }),
  });

  if (!response.ok) {
    const message = await response.text();
    return {
      html: "",
      errors: [{ message: message || "Failed to compile MJML." }],
    };
  }

  const data = (await response.json()) as {
    html?: string;
    errors?: Array<{ message: string }>;
  };

  return {
    html: data.html ?? "",
    errors: data.errors ?? [],
  };
};
