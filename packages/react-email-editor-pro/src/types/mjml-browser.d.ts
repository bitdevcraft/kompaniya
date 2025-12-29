declare module "mjml-browser" {
  interface MjmlOutput {
    html: string;
    errors: Array<{
      line: number;
      message: string;
      tagName?: string;
    }>;
  }

  export default function mjml2html(mjml: string): MjmlOutput;
}
