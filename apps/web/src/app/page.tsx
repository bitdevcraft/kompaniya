import type { ComponentProps } from "react";

import { EmailEditorForm } from "./email-editor-form";

export default async function Page() {
  const initialValue: ComponentProps<typeof EmailEditorForm>["initialValue"] = {
    tagName: "mjml",
    attributes: {
      lang: "en",
    },
    children: [
      {
        tagName: "mj-raw",
        attributes: {
          position: "file-start",
        },
        children: [],
        content:
          "<!-- htmlmin:ignore -->\\n<!-- file-start raw (eg: templating prelude) -->\\n<!-- htmlmin:ignore -->",
      },
      {
        tagName: "mj-head",
        attributes: {},
        children: [
          {
            tagName: "mj-title",
            attributes: {},
            children: [],
            content: "Kompaniya Email Editor",
          },
          {
            tagName: "mj-preview",
            attributes: {},
            children: [],
            content:
              "Launch a modern promo email in minutes with drag-and-drop.",
          },
          {
            tagName: "mj-breakpoint",
            attributes: {
              width: "480px",
            },
            children: [],
          },
          {
            tagName: "mj-font",
            attributes: {
              name: "Space Grotesk",
              href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap",
            },
            children: [],
          },
          {
            tagName: "mj-style",
            attributes: {
              inline: "inline",
            },
            children: [],
            content:
              ".brand div { color: #0f172a !important; } .brand a { text-decoration: none !important; color: #0f172a !important; } .muted div { color: #667085 !important; } .eyebrow div { letter-spacing: 2px !important; text-transform: uppercase !important; } .cta-secondary a { background: transparent !important; color: #0f172a !important; border: 1px solid #0f172a !important; } .pill span { background: #e0f2fe !important; color: #0369a1 !important; padding: 4px 10px !important; border-radius: 999px !important; display: inline-block !important; font-size: 12px !important; } .card td { background: #ffffff !important; border: 1px solid #e5e7eb !important; border-radius: 14px !important; } .shadow td { box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08) !important; }",
          },
          {
            tagName: "mj-attributes",
            attributes: {},
            children: [
              {
                tagName: "mj-all",
                attributes: {
                  "font-family": "Space Grotesk, Arial, sans-serif",
                  color: "#0f172a",
                  "line-height": "1.6",
                },
                children: [],
              },
              {
                tagName: "mj-text",
                attributes: {
                  "font-size": "16px",
                  padding: "0",
                },
                children: [],
              },
              {
                tagName: "mj-button",
                attributes: {
                  "background-color": "#0f172a",
                  color: "#ffffff",
                  "border-radius": "10px",
                  "font-size": "15px",
                  "font-weight": "600",
                  padding: "12px 20px",
                },
                children: [],
              },
              {
                tagName: "mj-class",
                attributes: {
                  name: "muted",
                  color: "#667085",
                },
                children: [],
              },
              {
                tagName: "mj-class",
                attributes: {
                  name: "eyebrow",
                  color: "#0ea5e9",
                  "font-size": "12px",
                  "font-weight": "600",
                },
                children: [],
              },
            ],
          },
          {
            tagName: "mj-html-attributes",
            attributes: {},
            children: [
              {
                tagName: "mj-selector",
                attributes: {
                  path: ".editable div",
                },
                children: [
                  {
                    tagName: "mj-html-attribute",
                    attributes: {
                      name: "data-editable",
                    },
                    children: [],
                    content: "true",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        tagName: "mj-body",
        attributes: {
          width: "600px",
          "background-color": "#f3f4f6",
        },
        children: [
          {
            tagName: "mj-section",
            attributes: {
              "background-color": "#ffffff",
              padding: "20px 0",
            },
            children: [
              {
                tagName: "mj-column",
                attributes: {},
                children: [
                  {
                    tagName: "mj-text",
                    attributes: {
                      "font-size": "20px",
                      "font-weight": "700",
                      padding: "0 24px 4px",
                      "css-class": "brand",
                    },
                    children: [],
                    content: "Kompaniya Email Editor",
                  },
                  {
                    tagName: "mj-text",
                    attributes: {
                      padding: "0 24px",
                      "font-size": "13px",
                      "css-class": "muted",
                    },
                    children: [],
                    content:
                      "Design, preview, and publish promo emails without touching code.",
                  },
                ],
              },
              {
                tagName: "mj-column",
                attributes: {},
                children: [
                  {
                    tagName: "mj-button",
                    attributes: {
                      href: "https://example.com/start",
                      align: "right",
                      padding: "0 24px",
                    },
                    children: [],
                    content: "Start free",
                  },
                ],
              },
            ],
          },
          {
            tagName: "mj-section",
            attributes: {
              "background-color": "#ffffff",
              padding: "12px 0 24px",
            },
            children: [
              {
                tagName: "mj-group",
                attributes: {},
                children: [
                  {
                    tagName: "mj-column",
                    attributes: {
                      width: "55%",
                    },
                    children: [
                      {
                        tagName: "mj-text",
                        attributes: {
                          padding: "0 24px 6px",
                          "css-class": "eyebrow",
                        },
                        children: [],
                        content: "Promo-ready UI",
                      },
                      {
                        tagName: "mj-text",
                        attributes: {
                          "font-size": "32px",
                          "font-weight": "700",
                          padding: "0 24px 10px",
                        },
                        children: [],
                        content: "Launch a modern promo email in minutes.",
                      },
                      {
                        tagName: "mj-text",
                        attributes: {
                          padding: "0 24px 16px",
                          "css-class": "muted",
                        },
                        children: [],
                        content:
                          "Drag blocks into place, update copy in-line, and see every device preview instantly.",
                      },
                      {
                        tagName: "mj-button",
                        attributes: {
                          href: "https://example.com/editor",
                          align: "left",
                          padding: "0 24px 10px",
                        },
                        children: [],
                        content: "Open the editor",
                      },
                      {
                        tagName: "mj-button",
                        attributes: {
                          href: "https://example.com/templates",
                          align: "left",
                          padding: "0 24px",
                          "css-class": "cta-secondary",
                        },
                        children: [],
                        content: "Browse templates",
                      },
                      {
                        tagName: "mj-text",
                        attributes: {
                          "font-size": "12px",
                          padding: "10px 24px 0",
                          "css-class": "muted",
                        },
                        children: [],
                        content:
                          "Free plan available. No credit card required.",
                      },
                    ],
                  },
                  {
                    tagName: "mj-column",
                    attributes: {
                      width: "45%",
                    },
                    children: [
                      {
                        tagName: "mj-image",
                        attributes: {
                          src: "https://images.unsplash.com/photo-1556155092-8707de31f9c4?auto=format&fit=crop&w=1200&q=60",
                          alt: "Email editor preview",
                          padding: "0 24px 12px",
                          "border-radius": "12px",
                        },
                        children: [],
                      },
                      {
                        tagName: "mj-text",
                        attributes: {
                          "font-size": "13px",
                          padding: "0 24px",
                          "css-class": "muted",
                        },
                        children: [],
                        content:
                          "Live preview, smart spacing, and brand tokens built in.",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            tagName: "mj-section",
            attributes: {
              "background-color": "#ffffff",
              padding: "8px 0 24px",
              "css-class": "card shadow",
            },
            children: [
              {
                tagName: "mj-column",
                attributes: {},
                children: [
                  {
                    tagName: "mj-text",
                    attributes: {
                      align: "center",
                      "font-size": "12px",
                      padding: "14px 12px 6px",
                      "css-class": "pill",
                    },
                    children: [],
                    content: "<span>NEW PROMO MODE</span>",
                  },
                  {
                    tagName: "mj-text",
                    attributes: {
                      align: "center",
                      "font-size": "20px",
                      "font-weight": "600",
                      padding: "0 24px 8px",
                    },
                    children: [],
                    content: "Build a conversion-first layout in three clicks.",
                  },
                  {
                    tagName: "mj-text",
                    attributes: {
                      align: "center",
                      "font-size": "14px",
                      padding: "0 24px 16px",
                      "css-class": "muted",
                    },
                    children: [],
                    content:
                      "Swap hero images, add countdown blocks, and export clean MJML instantly.",
                  },
                ],
              },
            ],
          },
          {
            tagName: "mj-section",
            attributes: {
              "background-color": "#ffffff",
              padding: "0 0 20px",
            },
            children: [
              {
                tagName: "mj-group",
                attributes: {},
                children: [
                  {
                    tagName: "mj-column",
                    attributes: {},
                    children: [
                      {
                        tagName: "mj-text",
                        attributes: {
                          align: "center",
                          "font-size": "24px",
                          "font-weight": "700",
                          padding: "0 24px 4px",
                        },
                        children: [],
                        content: "3x",
                      },
                      {
                        tagName: "mj-text",
                        attributes: {
                          align: "center",
                          "font-size": "13px",
                          "css-class": "muted",
                          padding: "0 24px",
                        },
                        children: [],
                        content: "faster build time",
                      },
                    ],
                  },
                  {
                    tagName: "mj-column",
                    attributes: {},
                    children: [
                      {
                        tagName: "mj-text",
                        attributes: {
                          align: "center",
                          "font-size": "24px",
                          "font-weight": "700",
                          padding: "0 24px 4px",
                        },
                        children: [],
                        content: "40+",
                      },
                      {
                        tagName: "mj-text",
                        attributes: {
                          align: "center",
                          "font-size": "13px",
                          "css-class": "muted",
                          padding: "0 24px",
                        },
                        children: [],
                        content: "drag-and-drop blocks",
                      },
                    ],
                  },
                  {
                    tagName: "mj-column",
                    attributes: {},
                    children: [
                      {
                        tagName: "mj-text",
                        attributes: {
                          align: "center",
                          "font-size": "24px",
                          "font-weight": "700",
                          padding: "0 24px 4px",
                        },
                        children: [],
                        content: "1",
                      },
                      {
                        tagName: "mj-text",
                        attributes: {
                          align: "center",
                          "font-size": "13px",
                          "css-class": "muted",
                          padding: "0 24px",
                        },
                        children: [],
                        content: "click publish flow",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            tagName: "mj-section",
            attributes: {
              "background-color": "#ffffff",
              padding: "8px 0 24px",
            },
            children: [
              {
                tagName: "mj-group",
                attributes: {},
                children: [
                  {
                    tagName: "mj-column",
                    attributes: {
                      width: "33.33%",
                    },
                    children: [
                      {
                        tagName: "mj-text",
                        attributes: {
                          "font-size": "16px",
                          "font-weight": "600",
                          padding: "0 24px 6px",
                        },
                        children: [],
                        content: "Visual building blocks",
                      },
                      {
                        tagName: "mj-text",
                        attributes: {
                          padding: "0 24px",
                          "css-class": "muted",
                        },
                        children: [],
                        content:
                          "Hero, gallery, product grid, countdown, and CTA blocks ready to drop in.",
                      },
                    ],
                  },
                  {
                    tagName: "mj-column",
                    attributes: {
                      width: "33.33%",
                    },
                    children: [
                      {
                        tagName: "mj-text",
                        attributes: {
                          "font-size": "16px",
                          "font-weight": "600",
                          padding: "0 24px 6px",
                        },
                        children: [],
                        content: "Brand-safe presets",
                      },
                      {
                        tagName: "mj-text",
                        attributes: {
                          padding: "0 24px",
                          "css-class": "muted",
                        },
                        children: [],
                        content:
                          "Lock fonts, colors, and spacing so every campaign feels consistent.",
                      },
                    ],
                  },
                  {
                    tagName: "mj-column",
                    attributes: {
                      width: "33.33%",
                    },
                    children: [
                      {
                        tagName: "mj-text",
                        attributes: {
                          "font-size": "16px",
                          "font-weight": "600",
                          padding: "0 24px 6px",
                        },
                        children: [],
                        content: "Instant previews",
                      },
                      {
                        tagName: "mj-text",
                        attributes: {
                          padding: "0 24px",
                          "css-class": "muted",
                        },
                        children: [],
                        content:
                          "Mobile, tablet, and desktop views update as you edit.",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            tagName: "mj-section",
            attributes: {
              "background-color": "#ffffff",
              padding: "0 0 24px",
            },
            children: [
              {
                tagName: "mj-group",
                attributes: {},
                children: [
                  {
                    tagName: "mj-column",
                    attributes: {
                      width: "55%",
                    },
                    children: [
                      {
                        tagName: "mj-text",
                        attributes: {
                          "font-size": "18px",
                          "font-weight": "600",
                          padding: "0 24px 6px",
                        },
                        children: [],
                        content: "Build a promo in four simple steps",
                      },
                      {
                        tagName: "mj-text",
                        attributes: {
                          padding: "0 24px",
                          "css-class": "muted",
                        },
                        children: [],
                        content:
                          "1. Pick a promo template.<br />2. Drag blocks into place.<br />3. Swap copy and images.<br />4. Publish or export clean HTML.",
                      },
                    ],
                  },
                  {
                    tagName: "mj-column",
                    attributes: {
                      width: "45%",
                    },
                    children: [
                      {
                        tagName: "mj-image",
                        attributes: {
                          src: "https://images.unsplash.com/photo-1529119368496-2dfda6ec2804?auto=format&fit=crop&w=1200&q=60",
                          alt: "Email editor workflow",
                          padding: "0 24px",
                          "border-radius": "12px",
                        },
                        children: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            tagName: "mj-section",
            attributes: {
              "background-color": "#ffffff",
              padding: "0 0 24px",
            },
            children: [
              {
                tagName: "mj-column",
                attributes: {},
                children: [
                  {
                    tagName: "mj-text",
                    attributes: {
                      "font-size": "18px",
                      "font-weight": "600",
                      padding: "0 24px 6px",
                    },
                    children: [],
                    content: "Preview the landing-style layout",
                  },
                  {
                    tagName: "mj-text",
                    attributes: {
                      padding: "0 24px 12px",
                      "css-class": "muted",
                    },
                    children: [],
                    content:
                      "See how the editor builds a bold promo email with stacked sections and clear calls to action.",
                  },
                  {
                    tagName: "mj-image",
                    attributes: {
                      src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=60",
                      alt: "Promo template preview",
                      padding: "0 24px 12px",
                      "border-radius": "12px",
                    },
                    children: [],
                  },
                  {
                    tagName: "mj-button",
                    attributes: {
                      href: "https://example.com/preview",
                      align: "left",
                      padding: "0 24px",
                    },
                    children: [],
                    content: "Open interactive preview",
                  },
                ],
              },
            ],
          },
          {
            tagName: "mj-section",
            attributes: {
              "background-color": "#ffffff",
              padding: "0 0 24px",
            },
            children: [
              {
                tagName: "mj-column",
                attributes: {},
                children: [
                  {
                    tagName: "mj-text",
                    attributes: {
                      "font-size": "18px",
                      "font-weight": "600",
                      padding: "0 24px 8px",
                    },
                    children: [],
                    content: "Teams ship faster with Kompaniya",
                  },
                  {
                    tagName: "mj-text",
                    attributes: {
                      padding: "0 24px",
                      "css-class": "muted",
                    },
                    children: [],
                    content:
                      "We went from 2 days to 2 hours for our seasonal promo. The editor made it simple for marketing to own the build.",
                  },
                  {
                    tagName: "mj-text",
                    attributes: {
                      padding: "8px 24px 0",
                      "font-size": "14px",
                    },
                    children: [],
                    content: "Jordan Lee, Lifecycle Marketing Lead",
                  },
                ],
              },
            ],
          },
          {
            tagName: "mj-section",
            attributes: {
              "background-color": "#0f172a",
              padding: "24px 0 28px",
            },
            children: [
              {
                tagName: "mj-column",
                attributes: {},
                children: [
                  {
                    tagName: "mj-text",
                    attributes: {
                      align: "center",
                      "font-size": "22px",
                      "font-weight": "700",
                      color: "#ffffff",
                      padding: "0 24px 8px",
                    },
                    children: [],
                    content: "Ready to launch your next promo?",
                  },
                  {
                    tagName: "mj-text",
                    attributes: {
                      align: "center",
                      "font-size": "14px",
                      color: "#e2e8f0",
                      padding: "0 24px 16px",
                    },
                    children: [],
                    content:
                      "Start with a template or import your HTML. We handle the layout.",
                  },
                  {
                    tagName: "mj-button",
                    attributes: {
                      href: "https://example.com/start",
                      align: "center",
                      padding: "0 24px",
                      "background-color": "#ffffff",
                      color: "#0f172a",
                    },
                    children: [],
                    content: "Start a free build",
                  },
                ],
              },
            ],
          },
          {
            tagName: "mj-section",
            attributes: {
              "background-color": "#f3f4f6",
              padding: "20px 0 12px",
            },
            children: [
              {
                tagName: "mj-column",
                attributes: {},
                children: [
                  {
                    tagName: "mj-text",
                    attributes: {
                      align: "center",
                      "font-size": "13px",
                      "css-class": "muted",
                      padding: "0 24px 6px",
                    },
                    children: [],
                    content:
                      "Need help? Reply to this email or visit example.com/support",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  return <EmailEditorForm initialValue={initialValue} />;
}
