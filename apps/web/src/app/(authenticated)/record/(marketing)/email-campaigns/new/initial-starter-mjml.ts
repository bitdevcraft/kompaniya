import { MjmlJsonNode } from "./types";

export const initialMjmlValue: MjmlJsonNode = {
  tagName: "mjml",
  attributes: {},
  children: [
    {
      tagName: "mj-head",
      attributes: {},
      children: [
        { tagName: "mj-title", content: "New arrivals — {{brand_name}}" },
        {
          tagName: "mj-preview",
          content: "A quick highlight + an offer you can use today.",
        },
        {
          tagName: "mj-font",
          attributes: {
            name: "Inter",
            href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap",
          },
        },
        {
          tagName: "mj-attributes",
          children: [
            {
              tagName: "mj-all",
              attributes: {
                "font-family": "Inter, Arial, sans-serif",
                "line-height": "1.6",
                color: "#111827",
              },
            },
            {
              tagName: "mj-text",
              attributes: {
                "font-size": "16px",
                padding: "0px",
                color: "#111827",
              },
            },
            {
              tagName: "mj-button",
              attributes: {
                "background-color": "#4F46E5",
                color: "#FFFFFF",
                "border-radius": "999px",
                "font-size": "16px",
                "font-weight": "600",
                "inner-padding": "14px 22px",
                padding: "0px",
                align: "left",
              },
            },
            {
              tagName: "mj-image",
              attributes: {
                padding: "0px",
                "border-radius": "16px",
              },
            },
          ],
        },
        {
          tagName: "mj-class",
          attributes: {
            name: "h1",
            "font-size": "32px",
            "font-weight": "700",
            "line-height": "1.2",
            color: "#FFFFFF",
          },
        },
        {
          tagName: "mj-class",
          attributes: {
            name: "subtle",
            "font-size": "14px",
            color: "#6B7280",
          },
        },
        {
          tagName: "mj-style",
          attributes: { inline: "inline" },
          content:
            ".card{background:#FFFFFF;border:1px solid #E5E7EB;border-radius:18px}.muted{color:#6B7280}.link{color:#4F46E5;text-decoration:none;font-weight:600}",
        },
      ],
    },
    {
      tagName: "mj-body",
      attributes: {
        "background-color": "#F5F7FB",
        width: "600px",
      },
      children: [
        {
          tagName: "mj-section",
          attributes: {
            padding: "18px 0",
            "background-color": "#F5F7FB",
          },
          children: [
            {
              tagName: "mj-column",
              attributes: { width: "100%" },
              children: [
                {
                  tagName: "mj-text",
                  attributes: {
                    align: "center",
                    "font-size": "12px",
                    color: "#6B7280",
                  },
                  content:
                    'Not displaying well? <a class="link" href="{{view_in_browser_url}}">View in browser</a>',
                },
              ],
            },
          ],
        },
        {
          tagName: "mj-section",
          attributes: {
            "background-color": "#FFFFFF",
            padding: "22px 22px 18px 22px",
            "border-radius": "18px",
          },
          children: [
            {
              tagName: "mj-column",
              attributes: { width: "50%" },
              children: [
                {
                  tagName: "mj-image",
                  attributes: {
                    src: "{{logo_url}}",
                    alt: "{{brand_name}}",
                    width: "120px",
                    href: "{{brand_url}}",
                    align: "left",
                  },
                },
              ],
            },
            {
              tagName: "mj-column",
              attributes: { width: "50%" },
              children: [
                {
                  tagName: "mj-text",
                  attributes: {
                    align: "right",
                    "font-size": "14px",
                    color: "#6B7280",
                  },
                  content:
                    '<span class="muted">{{send_month}} {{send_year}}</span><br/><a class="link" href="{{shop_url}}">Shop</a>&nbsp;&nbsp;•&nbsp;&nbsp;<a class="link" href="{{support_url}}">Support</a>',
                },
              ],
            },
          ],
        },
        {
          tagName: "mj-section",
          attributes: {
            "background-color": "#111827",
            padding: "34px 22px",
            "border-radius": "18px",
            "padding-bottom": "28px",
          },
          children: [
            {
              tagName: "mj-column",
              attributes: { width: "100%" },
              children: [
                {
                  tagName: "mj-text",
                  attributes: { "mj-class": "h1", padding: "0 0 10px 0" },
                  content:
                    "A smarter way to get more from {{product_category}}",
                },
                {
                  tagName: "mj-text",
                  attributes: {
                    "font-size": "16px",
                    color: "#E5E7EB",
                    padding: "0 0 18px 0",
                  },
                  content:
                    "Hi {{first_name}}, here’s what’s new this week — built to save you time and look great doing it.",
                },
                {
                  tagName: "mj-button",
                  attributes: {
                    href: "{{primary_cta_url}}",
                    align: "left",
                    "background-color": "#4F46E5",
                  },
                  content: "Get the new drop",
                },
                {
                  tagName: "mj-text",
                  attributes: {
                    "font-size": "13px",
                    color: "#9CA3AF",
                    padding: "14px 0 0 0",
                  },
                  content:
                    "Use code <strong>{{promo_code}}</strong> for <strong>{{promo_value}}</strong> off • Ends {{promo_end_date}}",
                },
              ],
            },
          ],
        },
        {
          tagName: "mj-section",
          attributes: { padding: "18px 0", "background-color": "#F5F7FB" },
          children: [
            {
              tagName: "mj-column",
              attributes: { width: "100%" },
              children: [
                {
                  tagName: "mj-wrapper",
                  attributes: { "css-class": "card", padding: "20px 22px" },
                  children: [
                    {
                      tagName: "mj-section",
                      attributes: { padding: "0px" },
                      children: [
                        {
                          tagName: "mj-column",
                          attributes: {
                            width: "33.33%",
                            padding: "10px",
                            "background-color": "#F9FAFB",
                            "border-radius": "14px",
                          },
                          children: [
                            {
                              tagName: "mj-image",
                              attributes: {
                                src: "{{feature1_icon_url}}",
                                alt: "Feature 1",
                                width: "40px",
                                align: "left",
                                "border-radius": "10px",
                              },
                            },
                            {
                              tagName: "mj-text",
                              attributes: {
                                "font-weight": "700",
                                "font-size": "15px",
                                padding: "10px 0 4px 0",
                              },
                              content: "{{feature1_title}}",
                            },
                            {
                              tagName: "mj-text",
                              attributes: {
                                "mj-class": "subtle",
                                padding: "0px",
                              },
                              content: "{{feature1_desc}}",
                            },
                          ],
                        },
                        {
                          tagName: "mj-column",
                          attributes: {
                            width: "33.33%",
                            padding: "10px",
                            "background-color": "#F9FAFB",
                            "border-radius": "14px",
                          },
                          children: [
                            {
                              tagName: "mj-image",
                              attributes: {
                                src: "{{feature2_icon_url}}",
                                alt: "Feature 2",
                                width: "40px",
                                align: "left",
                                "border-radius": "10px",
                              },
                            },
                            {
                              tagName: "mj-text",
                              attributes: {
                                "font-weight": "700",
                                "font-size": "15px",
                                padding: "10px 0 4px 0",
                              },
                              content: "{{feature2_title}}",
                            },
                            {
                              tagName: "mj-text",
                              attributes: {
                                "mj-class": "subtle",
                                padding: "0px",
                              },
                              content: "{{feature2_desc}}",
                            },
                          ],
                        },
                        {
                          tagName: "mj-column",
                          attributes: {
                            width: "33.33%",
                            padding: "10px",
                            "background-color": "#F9FAFB",
                            "border-radius": "14px",
                          },
                          children: [
                            {
                              tagName: "mj-image",
                              attributes: {
                                src: "{{feature3_icon_url}}",
                                alt: "Feature 3",
                                width: "40px",
                                align: "left",
                                "border-radius": "10px",
                              },
                            },
                            {
                              tagName: "mj-text",
                              attributes: {
                                "font-weight": "700",
                                "font-size": "15px",
                                padding: "10px 0 4px 0",
                              },
                              content: "{{feature3_title}}",
                            },
                            {
                              tagName: "mj-text",
                              attributes: {
                                "mj-class": "subtle",
                                padding: "0px",
                              },
                              content: "{{feature3_desc}}",
                            },
                          ],
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
            "background-color": "#FFFFFF",
            padding: "22px",
            "border-radius": "18px",
          },
          children: [
            {
              tagName: "mj-column",
              attributes: { width: "46%" },
              children: [
                {
                  tagName: "mj-image",
                  attributes: {
                    src: "{{product_image_url}}",
                    alt: "{{product_name}}",
                    href: "{{product_url}}",
                    "border-radius": "16px",
                  },
                },
              ],
            },
            {
              tagName: "mj-column",
              attributes: { width: "54%" },
              children: [
                {
                  tagName: "mj-text",
                  attributes: {
                    "font-size": "22px",
                    "font-weight": "800",
                    padding: "0 0 8px 0",
                  },
                  content: "{{product_name}}",
                },
                {
                  tagName: "mj-text",
                  attributes: { color: "#374151", padding: "0 0 14px 0" },
                  content: "{{product_short_pitch}}",
                },
                {
                  tagName: "mj-text",
                  attributes: {
                    "font-size": "14px",
                    color: "#6B7280",
                    padding: "0 0 16px 0",
                  },
                  content:
                    "Starting at <strong>{{product_price}}</strong> • Free returns • Ships in {{ship_time}}",
                },
                {
                  tagName: "mj-button",
                  attributes: { href: "{{secondary_cta_url}}" },
                  content: "See details",
                },
                {
                  tagName: "mj-text",
                  attributes: {
                    "font-size": "13px",
                    color: "#6B7280",
                    padding: "12px 0 0 0",
                  },
                  content:
                    '<a class="link" href="{{product_url}}">Or open in your browser</a>',
                },
              ],
            },
          ],
        },
        {
          tagName: "mj-section",
          attributes: {
            "background-color": "#EEF2FF",
            padding: "22px",
            "border-radius": "18px",
          },
          children: [
            {
              tagName: "mj-column",
              attributes: { width: "100%" },
              children: [
                {
                  tagName: "mj-text",
                  attributes: {
                    "font-size": "16px",
                    color: "#111827",
                    padding: "0 0 10px 0",
                  },
                  content: "“{{testimonial_quote}}”",
                },
                {
                  tagName: "mj-text",
                  attributes: {
                    "font-size": "14px",
                    color: "#4338CA",
                    "font-weight": "700",
                    padding: "0px",
                  },
                  content: "— {{testimonial_name}}, {{testimonial_title}}",
                },
              ],
            },
          ],
        },
        {
          tagName: "mj-section",
          attributes: {
            padding: "18px 0 8px 0",
            "background-color": "#F5F7FB",
          },
          children: [
            {
              tagName: "mj-column",
              attributes: { width: "100%" },
              children: [
                {
                  tagName: "mj-divider",
                  attributes: {
                    "border-width": "1px",
                    "border-style": "solid",
                    "border-color": "#E5E7EB",
                    padding: "0px",
                  },
                },
              ],
            },
          ],
        },
        {
          tagName: "mj-section",
          attributes: {
            "background-color": "#FFFFFF",
            padding: "18px 22px",
            "border-radius": "18px",
          },
          children: [
            {
              tagName: "mj-column",
              attributes: { width: "60%" },
              children: [
                {
                  tagName: "mj-text",
                  attributes: { "font-size": "14px", color: "#6B7280" },
                  content:
                    '<strong>Need help?</strong><br/>Reply to this email or reach us at <a class="link" href="mailto:{{support_email}}">{{support_email}}</a>.',
                },
              ],
            },
            {
              tagName: "mj-column",
              attributes: { width: "40%" },
              children: [
                {
                  tagName: "mj-social",
                  attributes: {
                    align: "right",
                    "icon-size": "22px",
                    mode: "horizontal",
                    padding: "0px",
                  },
                  children: [
                    {
                      tagName: "mj-social-element",
                      attributes: {
                        name: "instagram",
                        href: "{{instagram_url}}",
                      },
                    },
                    {
                      tagName: "mj-social-element",
                      attributes: {
                        name: "facebook",
                        href: "{{facebook_url}}",
                      },
                    },
                    {
                      tagName: "mj-social-element",
                      attributes: { name: "twitter", href: "{{twitter_url}}" },
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
            "background-color": "#F5F7FB",
            padding: "18px 0 30px 0",
          },
          children: [
            {
              tagName: "mj-column",
              attributes: { width: "100%" },
              children: [
                {
                  tagName: "mj-text",
                  attributes: {
                    align: "center",
                    "font-size": "12px",
                    color: "#6B7280",
                  },
                  content:
                    'You’re receiving this because you signed up at {{brand_url}}.<br/>{{brand_name}} • {{brand_address_line1}} • {{brand_address_line2}}<br/><a class="link" href="{{preferences_url}}">Preferences</a> &nbsp;•&nbsp; <a class="link" href="{{unsubscribe_url}}">Unsubscribe</a>',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
