import type { TemplateDoc } from "../schema/types";

import { compileHtml, type CompileHtmlOptions } from "./compile-html";
import { jsonToMjml } from "./json-to-mjml";

export const exportJSON = (doc: TemplateDoc) => doc;

export const exportMJML = (doc: TemplateDoc) => jsonToMjml(doc);

export const exportHTML = async (mjml: string, options?: CompileHtmlOptions) =>
  compileHtml(mjml, options);

export { compileHtml, jsonToMjml };
export type { CompileHtmlOptions, CompileHtmlResult } from "./compile-html";
