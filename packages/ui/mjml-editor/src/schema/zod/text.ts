import { z } from "zod";

export const TextPropsSchema = z.object({
  content: z.string().default("Edit me"),
  align: z.enum(["left", "center", "right"]).default("left"),
  color: z.string().default("#111827"),
  fontFamily: z.string().default("Inter, Arial"),
  fontSize: z.string().default("14px"),
  lineHeight: z.string().default("20px"),
  padding: z.string().default("12px 0"),
});

export type TextProps = z.infer<typeof TextPropsSchema>;
