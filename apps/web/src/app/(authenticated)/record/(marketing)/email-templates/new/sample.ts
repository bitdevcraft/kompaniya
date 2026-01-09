export const defaultCss = `
/* Email-safe modern CSS baseline + small utility set (Tailwind-like) */

/* ----- Variables ----- */
:root {
  --bg: #f7fafc;
  --surface: #ffffff;
  --text: #111827;
  --muted: #6b7280;
  --border: #e5e7eb;
  --primary: #2563eb;
  --primary-contrast: #ffffff;
  --success: #16a34a;
  --warning: #d97706;
  --danger: #dc2626;
  --code-bg: #0b1020;
  --code-text: #e5e7eb;
}

/* ----- Client resets ----- */
html, body {
  margin: 0 !important;
  padding: 0 !important;
  height: 100% !important;
  width: 100% !important;
  background: var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -webkit-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
}

* {
  box-sizing: border-box;
}

img {
  border: 0;
  line-height: 100%;
  vertical-align: middle;
  -ms-interpolation-mode: bicubic;
  max-width: 100%;
  height: auto;
  display: block;
}

table {
  border-collapse: collapse !important;
  border-spacing: 0 !important;
  width: 100%;
  table-layout: fixed;
}

td, th {
  padding: 0;
  vertical-align: top;
}

a {
  color: var(--primary);
  text-decoration: underline;
  word-break: break-word;
}

a img {
  border: 0;
}

hr {
  border: 0;
  border-top: 1px solid var(--border);
  height: 0;
  margin: 24px 0;
}

/* Outlook.com / Office */
.ExternalClass { width: 100%; }
.ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; }
#outlook a { padding: 0; }

/* iOS auto-link overrides */
a[x-apple-data-detectors] {
  color: inherit !important;
  text-decoration: none !important;
  font-size: inherit !important;
  font-family: inherit !important;
  font-weight: inherit !important;
  line-height: inherit !important;
}

/* Gmail blue link fix */
u + #body a { color: var(--primary) !important; text-decoration: underline !important; }

/* ----- Typography (all core tags) ----- */
p {
  margin: 0 0 16px 0;
  color: var(--text);
  font-size: 16px;
}

small { font-size: 12px; color: var(--muted); }

h1, h2, h3, h4, h5, h6 {
  color: var(--text);
  line-height: 1.25;
  margin: 0 0 12px 0;
  font-weight: 700;
}

h1 { font-size: 30px; }
h2 { font-size: 24px; }
h3 { font-size: 20px; }
h4 { font-size: 18px; }
h5 { font-size: 16px; }
h6 { font-size: 14px; color: var(--muted); }

strong, b { font-weight: 700; }
em, i { font-style: italic; }
mark { background: #fff3cd; color: #8a6d3b; padding: 0 3px; }
sup { font-size: 12px; vertical-align: super; }
sub { font-size: 12px; vertical-align: sub; }
abbr[title] { text-decoration: underline dotted; }
address { font-style: normal; color: var(--muted); }

blockquote {
  margin: 0 0 16px 0;
  padding: 12px 16px;
  border-left: 4px solid var(--border);
  background: #f9fafb;
  color: #1f2937;
}

code, kbd, samp {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 14px;
  background: var(--code-bg);
  color: var(--code-text);
  border-radius: 4px;
  padding: 2px 6px;
}

pre {
  margin: 0 0 16px 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre;
  overflow: auto;
  background: var(--code-bg);
  color: var(--code-text);
  border-radius: 8px;
  padding: 16px;
}

ul, ol {
  margin: 0 0 16px 20px;
  padding: 0;
}

li { margin: 8px 0; }
dl { margin: 0 0 16px 0; }
dt { font-weight: 600; }
dd { margin-left: 0; color: var(--muted); }

/* ----- Tables ----- */
table.table {
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: 12px;
  overflow: hidden;
}

.table th, .table td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
  text-align: left;
  word-break: break-word;
  font-size: 14px;
}

.table thead th {
  background: #f3f4f6;
  color: #374151;
  font-weight: 700;
}

.table tbody tr:last-child td { border-bottom: 0; }

/* ----- Forms (email clients may not support submission) ----- */
label { display: block; font-weight: 600; margin: 0 0 6px 0; }
input, select, textarea {
  width: 100%;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  outline: none;
}
input::placeholder, textarea::placeholder { color: var(--muted); }

/* ----- Components ----- */
.container {
  width: 100% !important;
  max-width: 640px;
  margin: 0 auto;
  background: transparent;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 1px 2px rgba(17,24,39,0.04), 0 4px 12px rgba(17,24,39,0.06);
}

.badge {
  display: inline-block;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #eef2ff;
  color: #3730a3;
  border: 1px solid #e0e7ff;
}

.btn, .button, button {
  display: inline-block;
  background: var(--primary);
  color: var(--primary-contrast) !important;
  text-decoration: none;
  border-radius: 12px;
  padding: 10px 16px;
  font-weight: 700;
  font-size: 14px;
  border: 0;
  cursor: pointer;
}

.btn:hover, .button:hover, button:hover { opacity: 0.96; }
.btn:active, .button:active, button:active { opacity: 0.92; }

.btn-outline {
  background: transparent;
  color: var(--primary) !important;
  border: 1px solid var(--primary);
}

.kicker {
  text-transform: uppercase;
  letter-spacing: .08em;
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 8px;
}

/* ----- Utilities (safe subset) ----- */
/* spacing */
.mt-0{margin-top:0!important;} .mt-1{margin-top:4px!important;} .mt-2{margin-top:8px!important;} .mt-3{margin-top:12px!important;} .mt-4{margin-top:16px!important;} .mt-6{margin-top:24px!important;} .mt-8{margin-top:32px!important;}
.mb-0{margin-bottom:0!important;} .mb-1{margin-bottom:4px!important;} .mb-2{margin-bottom:8px!important;} .mb-3{margin-bottom:12px!important;} .mb-4{margin-bottom:16px!important;} .mb-6{margin-bottom:24px!important;} .mb-8{margin-bottom:32px!important;}
.pt-0{padding-top:0!important;} .pt-2{padding-top:8px!important;} .pt-4{padding-top:16px!important;} .pt-6{padding-top:24px!important;}
.pb-0{padding-bottom:0!important;} .pb-2{padding-bottom:8px!important;} .pb-4{padding-bottom:16px!important;} .pb-6{padding-bottom:24px!important;}
.px-0{padding-left:0!important;padding-right:0!important;} .px-2{padding-left:8px!important;padding-right:8px!important;} .px-4{padding-left:16px!important;padding-right:16px!important;} .px-6{padding-left:24px!important;padding-right:24px!important;}
.py-0{padding-top:0!important;padding-bottom:0!important;} .py-2{padding-top:8px!important;padding-bottom:8px!important;} .py-4{padding-top:16px!important;padding-bottom:16px!important;} .py-6{padding-top:24px!important;padding-bottom:24px!important;}

/* text */
.text-xs{font-size:12px!important;} .text-sm{font-size:14px!important;} .text-base{font-size:16px!important;} .text-lg{font-size:18px!important;} .text-xl{font-size:20px!important;} .text-2xl{font-size:24px!important;} .text-3xl{font-size:30px!important;}
.text-muted{color:var(--muted)!important;} .text-primary{color:var(--primary)!important;} .text-invert{color:var(--primary-contrast)!important;}
.leading-tight{line-height:1.25!important;} .leading-normal{line-height:1.6!important;} .leading-relaxed{line-height:1.8!important;}
.font-normal{font-weight:400!important;} .font-medium{font-weight:500!important;} .font-semibold{font-weight:600!important;} .font-bold{font-weight:700!important;}
.text-left{text-align:left!important;} .text-center{text-align:center!important;} .text-right{text-align:right!important;}

/* width */
.w-full{width:100%!important;}
.max-w-none{max-width:none!important;} .max-w-640{max-width:640px!important;} .max-w-480{max-width:480px!important;}

/* display */
.block{display:block!important;} .inline{display:inline!important;} .inline-block{display:inline-block!important;} .hidden{display:none!important;}

/* radius, border, shadow, bg */
.rounded{border-radius:10px!important;} .rounded-lg{border-radius:14px!important;} .rounded-full{border-radius:999px!important;}
.border{border:1px solid var(--border)!important;} .border-0{border:0!important;}
.shadow{box-shadow:0 1px 2px rgba(17,24,39,0.04),0 4px 12px rgba(17,24,39,0.06)!important;}
.bg-surface{background:var(--surface)!important;} .bg-muted{background:#f3f4f6!important;}
.bg-primary{background:var(--primary)!important;color:var(--primary-contrast)!important;}
.bg-success{background:#ecfdf5!important;color:#065f46!important;border:1px solid #a7f3d0!important;}
.bg-warning{background:#fffbeb!important;color:#92400e!important;border:1px solid #fde68a!important;}
.bg-danger{background:#fef2f2!important;color:#991b1b!important;border:1px solid #fecaca!important;}

/* alignment helpers */
.center { margin-left:auto!important; margin-right:auto!important; }
.stack > * + * { margin-top: 12px !important; }

/* visually hidden */
.sr-only {
  position:absolute !important; width:1px !important; height:1px !important;
  padding:0 !important; margin:-1px !important; overflow:hidden !important;
  clip:rect(0,0,0,0) !important; white-space:nowrap !important; border:0 !important;
}

/* ----- Dark mode ----- */
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0b0f14;
    --surface: #0f1622;
    --text: #e6edf3;
    --muted: #9aa4af;
    --border: #1f2a37;
    --primary: #60a5fa;
    --primary-contrast: #0b0f14;
    --code-bg: #0b1020;
    --code-text: #e6edf3;
  }
  .table thead th { background: #121a26; color: #cbd5e1; }
  blockquote { background:#0f1622; border-left-color:#1f2a37; color:#cbd5e1; }
  .badge { background:#0f1a2e; color:#bfdbfe; border-color:#0b2a55; }
  .card { box-shadow: 0 1px 2px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.35); }
}

/* ----- Mobile adjustments ----- */
@media only screen and (max-width: 600px) {
  .container { padding-left: 16px !important; padding-right: 16px !important; }
  .sm-w-full{ width:100% !important; }
  .sm-hidden{ display:none !important; }
  .text-3xl{ font-size:26px !important; }
}
`;

export const body = `
<div>
        <p class="kicker">Release note</p>
        <h1 class="text-3xl leading-tight mb-2">Modern Email UI Showcase</h1>
        <p class="text-muted mb-4">A compact demonstration of elements, components, and utility classes in an email-safe CSS set.</p>
        <img src="https://picsum.photos/200/300" alt="Header banner" class="rounded-lg shadow mb-4">
        <div class="stack">
          <span class="badge">New</span>
          <span class="badge">Beta</span>
          <span class="badge">Email-safe</span>
        </div>
      </div>

      <hr>

      <div class="stack">
        <h2 class="text-2xl">Typography</h2>
        <p>Base paragraph with <strong>strong</strong>, <em>emphasis</em>, <mark>highlight</mark>, inline <code>code()</code>, H<sub>2</sub>O and E=mc<sup>2</sup>, plus <abbr title="Cascading Style Sheets">CSS</abbr>.</p>
        <h3>Headings</h3>
        <h4>Subsection</h4>
        <h5>Minor heading</h5>
        <h6>Caption heading</h6>
        <blockquote>Design for the worst email client; delight in the best.</blockquote>
        <pre><samp>// Preformatted block
const msg = "Hello email!";
console.log(msg);</samp></pre>
        <p><small>Small print. Address and meta:</small></p>
        <address>Acme, Inc. · 123 Example St · City</address>
      </div>

      <hr>

      <div class="stack">
        <h2 class="text-2xl">Lists</h2>
        <h3>Unordered</h3>
        <ul>
          <li>Zero-config base</li>
          <li>Utility classes</li>
          <li>Dark mode aware</li>
        </ul>
        <h3>Ordered</h3>
        <ol>
          <li>Compose layout</li>
          <li>Add content</li>
          <li>Ship email</li>
        </ol>
        <h3>Definition</h3>
        <dl>
          <dt>Badge</dt><dd>Inline status label.</dd>
          <dt>Card</dt><dd>Framed content container.</dd>
        </dl>
      </div>

      <hr>

      <div class="stack">
        <h2 class="text-2xl">Table</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Typography</td>
              <td><span class="badge">Stable</span></td>
              <td>Headings, paragraphs, inline elements</td>
            </tr>
            <tr>
              <td>Utilities</td>
              <td><span class="badge">Stable</span></td>
              <td>Spacing, text, display, backgrounds</td>
            </tr>
            <tr>
              <td>Components</td>
              <td><span class="badge">Beta</span></td>
              <td>Card, button, badge</td>
            </tr>
          </tbody>
        </table>
      </div>

      <hr>

      <div class="stack">
        <h2 class="text-2xl">Buttons</h2>
        <div class="stack">
          <a href="#" class="btn inline-block">Primary Button</a>
          <a href="#" class="btn btn-outline inline-block">Outline Button</a>
        </div>
      </div>

      <hr>

      <div class="stack">
        <h2 class="text-2xl">Alerts</h2>
        <p class="bg-success rounded px-4 py-2">Success — configuration saved.</p>
        <p class="bg-warning rounded px-4 py-2">Warning — incomplete profile.</p>
        <p class="bg-danger rounded px-4 py-2">Error — action failed.</p>
      </div>

      <hr>

      <div class="stack">
        <h2 class="text-2xl">Form elements</h2>
        <label for="name">Name</label>
        <input id="name" placeholder="Jane Doe">

        <label for="role" class="mt-3">Role</label>
        <select id="role">
          <option>Developer</option>
          <option>Designer</option>
          <option>Manager</option>
        </select>

        <label for="msg" class="mt-3">Message</label>
        <textarea id="msg" rows="3" placeholder="Write a short note…"></textarea>
      </div>

      <hr>

      <div class="stack">
        <h2 class="text-2xl">Utilities in action</h2>
        <p class="text-center mb-2">Centered text</p>
        <p class="text-right text-sm text-muted">Right-aligned, small, muted</p>
        <div class="bg-muted rounded px-4 py-2">Muted surface with padding and rounded corners</div>
        <div class="border rounded px-4 py-2 mt-2 shadow">Border + shadow utility</div>
      </div>

      <hr>

      <div class="stack">
        <h2 class="text-2xl">Footer</h2>
        <p class="text-sm text-muted">You received this email because you opted in at our website.</p>
        <p class="text-sm"><a href="#">Unsubscribe</a> · <a href="#">Manage preferences</a></p>
      </div>
`;

export const defaultHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sample Email — Modern CSS + Utilities</title>
  <style>
${defaultCss}
  </style>
</head>

<body id="body">
  <span class="sr-only">Preview: Modern email components, utilities, and base elements.</span>

  <div class="container py-6">
    <div class="card stack">
      ${body}
    </div>
  </div>

  <u class="hidden">Gmail link fix spacer</u>
</body>
</html>
`;
