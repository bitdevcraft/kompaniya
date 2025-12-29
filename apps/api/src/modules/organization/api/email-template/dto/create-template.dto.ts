export class CreateTemplateDto {
  html!: string;
  jsonSchema!: Record<string, unknown>;
  mjml!: string;
  name!: string;
  version?: number;
}
