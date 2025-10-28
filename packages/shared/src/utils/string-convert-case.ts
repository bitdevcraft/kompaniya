// Case conversion utility with strict unions for input/output styles.
export type CaseStyle =
  | "camel" // camelCase
  | "pascal" // PascalCase
  | "snake" // snake_case
  | "kebab" // kebab-case
  | "constant" // SCREAMING_SNAKE_CASE
  | "space" // space separated, lower
  | "dot" // dot.separated
  | "title" // Title Case (words separated by space)
  | "sentence"; // Sentence case (first word capped, rest lower, space separated

export function convertCase(
  inputString: string,
  inputStringCase: CaseStyle,
  outputStringCase: CaseStyle,
): string {
  const tokens = tokenize(inputString, inputStringCase);
  return format(tokens, outputStringCase);
}

function format(tokens: string[], style: CaseStyle): string {
  const cap = (w: string) =>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    w ? w[0]!.toUpperCase() + w.slice(1).toLowerCase() : "";
  const lower = (w: string) => w.toLowerCase();

  switch (style) {
    case "camel":
      if (tokens.length === 0) return "";
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return tokens[0]!.toLowerCase() + tokens.slice(1).map(cap).join("");
    case "pascal":
      return tokens.map(cap).join("");
    case "snake":
      return tokens.map(lower).join("_");
    case "kebab":
      return tokens.map(lower).join("-");
    case "constant":
      return tokens.map((t) => t.toUpperCase()).join("_");
    case "space":
      return tokens.map(lower).join(" ");
    case "dot":
      return tokens.map(lower).join(".");
    case "title":
      return tokens.map(cap).join(" ");
    case "sentence":
      if (tokens.length === 0) return "";
      return (
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        cap(tokens[0]!) +
        (tokens.length > 1 ? " " + tokens.slice(1).map(lower).join(" ") : "")
      );
    default:
      return tokens.join(" ");
  }
}

function tokenize(value: string, style: CaseStyle): string[] {
  if (!value) return [];

  const splitBy = (s: string, sep: RegExp | string) =>
    s
      .split(sep)
      .map((t) => t.trim())
      .filter(Boolean);

  const breakCamel = (s: string) =>
    s
      // JSONData -> JSON Data (break before Capital followed by lowercase)
      .replace(/([A-Z]+)([A-Z][a-z0-9]+)/g, "$1 $2")
      // fooBar -> foo Bar ; a2B -> a2 B
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/[_\-.\s]+/g, " ")
      .trim();

  let raw: string[];

  switch (style) {
    case "camel":
    case "pascal":
      raw = splitBy(breakCamel(value), " ");
      break;
    case "snake":
      raw = splitBy(value, "_");
      break;
    case "constant":
      raw = splitBy(value, "_").map((t) => t.toLowerCase());
      break;
    case "kebab":
      raw = splitBy(value, "-");
      break;
    case "dot":
      raw = splitBy(value, ".");
      break;
    case "space":
    case "title":
    case "sentence":
      raw = splitBy(value.replace(/[_\-.\s]+/g, " "), " ");
      break;
    default:
      raw = splitBy(breakCamel(value), " ");
  }

  return raw.map((t) => t.toLowerCase());
}
