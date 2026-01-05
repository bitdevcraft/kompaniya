export class CreateTemplateDto {
  body?: string;
  htmlContent?: string;
  mjmlContent?: string;
  mjmlJsonContent?: string;
  name!: string;
  subject?: string;
}
