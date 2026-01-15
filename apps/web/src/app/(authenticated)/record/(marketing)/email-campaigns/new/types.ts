export type MjmlJsonNode = {
  tagName: string;
  attributes?: Record<string, string>;
  children?: MjmlJsonNode[];
  content?: string;
};

export type PreviewRecipientsResponse = {
  count: number;
  sample: Array<{
    id?: string | null;
    name?: string | null;
    email?: string | null;
  }>;
};
