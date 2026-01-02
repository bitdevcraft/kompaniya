import type { ComponentProps } from "react";

import { UiEditor } from "@kompaniya/ui-email-editor/editor";

export default async function Page() {
  const initialValue: ComponentProps<typeof UiEditor>["initialValue"] = {
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
            content: "MJML Component Applications",
          },
          {
            tagName: "mj-preview",
            attributes: {},
            children: [],
            content: "All MJML components separated by application.",
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
              name: "Inter",
              href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap",
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
              ".brand a { text-decoration: none !important; } .muted div { color: #666666 !important; }",
          },
          {
            tagName: "mj-attributes",
            attributes: {},
            children: [
              {
                tagName: "mj-all",
                attributes: {
                  "font-family": "Inter, Arial, sans-serif",
                  color: "#222222",
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
                  "background-color": "#111111",
                  color: "#ffffff",
                  "border-radius": "8px",
                  padding: "12px 18px",
                },
                children: [],
              },
              {
                tagName: "mj-class",
                attributes: {
                  name: "muted",
                  color: "#666666",
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
          "background-color": "#f5f5f5",
          "css-class": "body",
        },
        children: [
          {
            tagName: "mj-section",
            attributes: {
              "background-color": "#ffffff",
              padding: "24px 0 8px",
              "css-class": "s-intro",
            },
            children: [
              {
                tagName: "mj-column",
                attributes: {},
                children: [
                  {
                    tagName: "mj-text",
                    attributes: {
                      "font-size": "22px",
                      "font-weight": "700",
                      padding: "0 24px 6px",
                    },
                    children: [],
                    content: "MJML component applications",
                  },
                  {
                    tagName: "mj-text",
                    attributes: {
                      padding: "0 24px 8px",
                      "css-class": "muted",
                    },
                    children: [],
                    content:
                      "Each application below isolates a single MJML component or layout pattern.",
                  },
                ],
              },
            ],
          },
          {
            tagName: "mj-section",
            attributes: {
              "background-color": "#111111",
              padding: "12px 0",
              "css-class": "s-navbar",
            },
            children: [
              {
                tagName: "mj-column",
                attributes: {},
                children: [
                  {
                    tagName: "mj-text",
                    attributes: {
                      color: "#ffffff",
                      "font-size": "14px",
                      "text-transform": "uppercase",
                      "letter-spacing": "1px",
                      padding: "0 24px 6px",
                    },
                    children: [],
                    content: "Navigation application",
                  },
                  {
                    tagName: "mj-navbar",
                    attributes: {
                      "base-url": "https://example.com",
                      hamburger: "hamburger",
                      "ico-color": "#ffffff",
                    },
                    children: [
                      {
                        tagName: "mj-navbar-link",
                        attributes: {
                          href: "/home",
                          color: "#ffffff",
                          padding: "10px 12px",
                          "css-class": "brand",
                        },
                        children: [],
                        content: "Home",
                      },
                      {
                        tagName: "mj-navbar-link",
                        attributes: {
                          href: "/features",
                          color: "#ffffff",
                          padding: "10px 12px",
                        },
                        children: [],
                        content: "Features",
                      },
                      {
                        tagName: "mj-navbar-link",
                        attributes: {
                          href: "/pricing",
                          color: "#ffffff",
                          padding: "10px 12px",
                        },
                        children: [],
                        content: "Pricing",
                      },
                      {
                        tagName: "mj-navbar-link",
                        attributes: {
                          href: "/support",
                          color: "#ffffff",
                          padding: "10px 12px",
                        },
                        children: [],
                        content: "Support",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            tagName: "mj-hero",
            attributes: {
              mode: "fixed-height",
              height: "280px",
              "background-width": "600px",
              "background-height": "280px",
              "background-url":
                "https://images.unsplash.com/photo-1520975958225-6d3a6aa1c4f2?auto=format&fit=crop&w=1200&q=60",
              "background-color": "#2a3448",
              padding: "36px 0",
              "css-class": "s-hero",
            },
            children: [
              {
                tagName: "mj-text",
                attributes: {
                  align: "center",
                  "font-size": "16px",
                  "text-transform": "uppercase",
                  "letter-spacing": "1px",
                  color: "#ffffff",
                  padding: "0 24px 6px",
                },
                children: [],
                content: "Hero application",
              },
              {
                tagName: "mj-text",
                attributes: {
                  align: "center",
                  "font-size": "30px",
                  "font-weight": "800",
                  color: "#ffffff",
                  padding: "0 24px 10px",
                },
                children: [],
                content: "Hero headline",
              },
              {
                tagName: "mj-button",
                attributes: {
                  href: "https://example.com/hero",
                  align: "center",
                  "background-color": "#ffffff",
                  color: "#111111",
                },
                children: [],
                content: "Hero CTA",
              },
            ],
          },
          {
            tagName: "mj-wrapper",
            attributes: {
              "background-color": "#ffffff",
              padding: "0",
              "css-class": "s-layout",
            },
            children: [
              {
                tagName: "mj-section",
                attributes: {
                  padding: "24px 0",
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
                              "font-size": "18px",
                              "font-weight": "600",
                              padding: "0 24px 8px",
                            },
                            children: [],
                            content: "Layout application",
                          },
                          {
                            tagName: "mj-text",
                            attributes: {
                              padding: "0 24px",
                              "css-class": "muted",
                            },
                            children: [],
                            content:
                              "Wrapper, section, group, and columns work together here.",
                          },
                        ],
                      },
                      {
                        tagName: "mj-column",
                        attributes: {},
                        children: [
                          {
                            tagName: "mj-image",
                            attributes: {
                              src: "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1200&q=60",
                              alt: "Layout image",
                              padding: "0 24px",
                            },
                            children: [],
                          },
                        ],
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
              padding: "8px 0 20px",
              "css-class": "s-text",
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
                    content: "Text application",
                  },
                  {
                    tagName: "mj-text",
                    attributes: {
                      padding: "0 24px",
                      "css-class": "muted",
                    },
                    children: [],
                    content:
                      "Use text for long-form messaging and announcements.",
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
              "css-class": "s-image",
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
                      padding: "0 24px 10px",
                    },
                    children: [],
                    content: "Image application",
                  },
                  {
                    tagName: "mj-image",
                    attributes: {
                      src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=60",
                      alt: "Example image",
                      padding: "0 24px",
                    },
                    children: [],
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
              "css-class": "s-button",
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
                      padding: "0 24px 10px",
                    },
                    children: [],
                    content: "Button application",
                  },
                  {
                    tagName: "mj-button",
                    attributes: {
                      href: "https://example.com/action",
                      align: "left",
                      padding: "0 24px",
                    },
                    children: [],
                    content: "Primary action",
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
              "css-class": "s-divider",
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
                    content: "Divider application",
                  },
                  {
                    tagName: "mj-divider",
                    attributes: {
                      "border-color": "#e6e6e6",
                      padding: "0 24px",
                    },
                    children: [],
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
              "css-class": "s-spacer",
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
                    content: "Spacer application",
                  },
                  {
                    tagName: "mj-spacer",
                    attributes: {
                      height: "16px",
                    },
                    children: [],
                  },
                  {
                    tagName: "mj-text",
                    attributes: {
                      padding: "0 24px",
                      "css-class": "muted",
                    },
                    children: [],
                    content: "Spacing between blocks without extra content.",
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
              "css-class": "s-table",
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
                      padding: "0 24px 10px",
                    },
                    children: [],
                    content: "Table application",
                  },
                  {
                    tagName: "mj-table",
                    attributes: {
                      padding: "0 24px",
                    },
                    children: [
                      {
                        tagName: "tr",
                        attributes: {
                          "background-color": "#f2f2f2",
                        },
                        children: [
                          {
                            tagName: "th",
                            attributes: {
                              padding: "8px",
                              "font-size": "13px",
                            },
                            children: [],
                            content: "Plan",
                          },
                          {
                            tagName: "th",
                            attributes: {
                              padding: "8px",
                              "font-size": "13px",
                            },
                            children: [],
                            content: "Price",
                          },
                          {
                            tagName: "th",
                            attributes: {
                              padding: "8px",
                              "font-size": "13px",
                            },
                            children: [],
                            content: "Seats",
                          },
                        ],
                      },
                      {
                        tagName: "tr",
                        attributes: {},
                        children: [
                          {
                            tagName: "td",
                            attributes: {
                              padding: "8px",
                            },
                            children: [],
                            content: "Starter",
                          },
                          {
                            tagName: "td",
                            attributes: {
                              padding: "8px",
                            },
                            children: [],
                            content: "$19",
                          },
                          {
                            tagName: "td",
                            attributes: {
                              padding: "8px",
                            },
                            children: [],
                            content: "3",
                          },
                        ],
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
              padding: "0 0 20px",
              "css-class": "s-social",
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
                      padding: "0 24px 10px",
                    },
                    children: [],
                    content: "Social application",
                  },
                  {
                    tagName: "mj-social",
                    attributes: {
                      padding: "0 24px",
                      "font-size": "14px",
                      "icon-size": "20px",
                      mode: "horizontal",
                    },
                    children: [
                      {
                        tagName: "mj-social-element",
                        attributes: {
                          name: "facebook",
                          href: "https://example.com/facebook",
                        },
                        children: [],
                        content: "Facebook",
                      },
                      {
                        tagName: "mj-social-element",
                        attributes: {
                          name: "twitter",
                          href: "https://example.com/x",
                        },
                        children: [],
                        content: "X",
                      },
                      {
                        tagName: "mj-social-element",
                        attributes: {
                          name: "linkedin",
                          href: "https://example.com/linkedin",
                        },
                        children: [],
                        content: "LinkedIn",
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
              padding: "0 0 20px",
              "css-class": "s-accordion",
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
                      padding: "0 24px 10px",
                    },
                    children: [],
                    content: "Accordion application",
                  },
                  {
                    tagName: "mj-accordion",
                    attributes: {
                      border: "1px solid #e6e6e6",
                      padding: "0 24px",
                    },
                    children: [
                      {
                        tagName: "mj-accordion-element",
                        attributes: {},
                        children: [
                          {
                            tagName: "mj-accordion-title",
                            attributes: {
                              "font-size": "16px",
                              padding: "12px",
                            },
                            children: [],
                            content: "Accordion title",
                          },
                          {
                            tagName: "mj-accordion-text",
                            attributes: {
                              "font-size": "14px",
                              padding: "12px",
                              "css-class": "muted",
                            },
                            children: [],
                            content: "Accordion body text content.",
                          },
                        ],
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
              padding: "0 0 20px",
              "css-class": "s-carousel",
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
                      padding: "0 24px 10px",
                    },
                    children: [],
                    content: "Carousel application",
                  },
                  {
                    tagName: "mj-carousel",
                    attributes: {
                      padding: "0 24px",
                    },
                    children: [
                      {
                        tagName: "mj-carousel-image",
                        attributes: {
                          src: "https://images.unsplash.com/photo-1496307653780-42ee777d4833?auto=format&fit=crop&w=1200&q=60",
                          alt: "Slide 1",
                          href: "https://example.com/slide-1",
                        },
                        children: [],
                      },
                      {
                        tagName: "mj-carousel-image",
                        attributes: {
                          src: "https://images.unsplash.com/photo-1485217988980-11786ced9454?auto=format&fit=crop&w=1200&q=60",
                          alt: "Slide 2",
                          href: "https://example.com/slide-2",
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
              padding: "0 0 12px",
              "css-class": "s-raw",
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
                    content: "Raw HTML application",
                  },
                  {
                    tagName: "mj-text",
                    attributes: {
                      padding: "0 24px",
                      "css-class": "muted",
                    },
                    children: [],
                    content: "Raw HTML renders exactly as provided.",
                  },
                ],
              },
            ],
          },
          {
            tagName: "mj-raw",
            attributes: {},
            children: [],
            content:
              '<div style="padding:0 24px 24px;">Raw HTML block inside the body.</div>',
          },
        ],
      },
    ],
  };

  return (
    <div className="flex justify-center min-h-svh">
      <UiEditor initialValue={initialValue} />
    </div>
  );
}
