import type { TemplateDoc, TemplateMeta } from "../schema/types";

export interface ImageUploadAdapter {
  upload: (file: File) => Promise<ImageUploadResult>;
}

export interface ImageUploadResult {
  url: string;
  width?: number;
  height?: number;
}

export interface StorageAdapter {
  delete?: (id: string) => Promise<void>;
  list?: (q?: { search?: string }) => Promise<TemplateMeta[]>;
  load: (id: string) => Promise<TemplateDoc>;
  save: (doc: TemplateDoc) => Promise<{ id: string; version: number }>;
}

export class LocalStorageAdapter implements StorageAdapter {
  private readonly prefix: string;

  constructor(prefix = "mjml:doc") {
    this.prefix = prefix;
  }

  async delete(id: string) {
    if (typeof window === "undefined" || !window.localStorage) {
      throw new Error("LocalStorage is not available in this environment.");
    }
    window.localStorage.removeItem(this.key(id));
  }

  async list(q?: { search?: string }) {
    if (typeof window === "undefined" || !window.localStorage) {
      throw new Error("LocalStorage is not available in this environment.");
    }
    const entries = Object.keys(window.localStorage)
      .filter((key) => key.startsWith(`${this.prefix}:`))
      .map((key) => window.localStorage.getItem(key))
      .filter((value): value is string => Boolean(value))
      .map((value) => JSON.parse(value) as TemplateDoc)
      .map((doc) => doc.meta);

    if (!q?.search) {
      return entries;
    }

    const search = q.search.toLowerCase();
    return entries.filter((meta) => meta.name.toLowerCase().includes(search));
  }

  async load(id: string) {
    if (typeof window === "undefined" || !window.localStorage) {
      throw new Error("LocalStorage is not available in this environment.");
    }
    const key = this.key(id);
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      throw new Error("Template not found.");
    }
    return JSON.parse(raw) as TemplateDoc;
  }

  async save(doc: TemplateDoc) {
    if (typeof window === "undefined" || !window.localStorage) {
      throw new Error("LocalStorage is not available in this environment.");
    }
    const key = this.key(doc.meta.id);
    window.localStorage.setItem(key, JSON.stringify(doc));
    return { id: doc.meta.id, version: doc.meta.version };
  }

  private key(id: string) {
    return `${this.prefix}:${id}`;
  }
}
