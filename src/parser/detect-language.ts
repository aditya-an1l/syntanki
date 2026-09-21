type Language =
  | "python"
  | "javascript"
  | "typescript"
  | "rust"
  | "go"
  | "java"
  | "ruby"
  | "css"
  | "html"
  | "sql"
  | "bash"
  | "text";

interface Pattern {
  regex: RegExp;
  weight: number;
}

const patterns: Record<Language, Pattern[]> = {
  python: [
    { regex: /\bdef\s+\w+\s*\(/, weight: 3 },
    { regex: /\bimport\s+\w+/, weight: 2 },
    { regex: /\bfrom\s+\w+\s+import/, weight: 3 },
    { regex: /\bprint\s*\(/, weight: 2 },
    { regex: /if\s+__name__\s*==/, weight: 4 },
    { regex: /\bclass\s+\w+\s*:/, weight: 2 },
    { regex: /\belif\b/, weight: 3 },
    { regex: /\bself\./, weight: 3 },
  ],
  javascript: [
    { regex: /\bfunction\s+\w+\s*\(/, weight: 2 },
    { regex: /\bconst\s+\w+\s*=/, weight: 2 },
    { regex: /\blet\s+\w+\s*=/, weight: 2 },
    { regex: /\bvar\s+\w+\s*=/, weight: 2 },
    { regex: /\bimport\s+.*from\s+['"]/, weight: 3 },
    { regex: /\bexport\s+(default|const|function|class)/, weight: 3 },
    { regex: /console\.log\s*\(/, weight: 3 },
    { regex: /=>\s*{/, weight: 2 },
    { regex: /\basync\s+function/, weight: 3 },
    { regex: /\bawait\s+/, weight: 3 },
  ],
  typescript: [
    { regex: /\bfunction\s+\w+\s*\(/, weight: 2 },
    { regex: /\bconst\s+\w+\s*:/, weight: 3 },
    { regex: /\blet\s+\w+\s*:/, weight: 3 },
    { regex: /\bimport\s+.*from\s+['"]/, weight: 3 },
    { regex: /\bexport\s+(default|const|function|class|interface|type)/, weight: 3 },
    { regex: /\binterface\s+\w+/, weight: 4 },
    { regex: /\btype\s+\w+\s*=/, weight: 4 },
    { regex: /:\s*(string|number|boolean|void|any|unknown)\b/, weight: 3 },
    { regex: /\bas\s+\w+/, weight: 2 },
  ],
  rust: [
    { regex: /\bfn\s+\w+\s*\(/, weight: 4 },
    { regex: /\blet\s+mut\s+/, weight: 3 },
    { regex: /\blet\s+\w+\s*=/, weight: 2 },
    { regex: /\bpub\s+(fn|struct|enum|mod)/, weight: 3 },
    { regex: /\buse\s+\w+::/, weight: 3 },
    { regex: /println!\s*\(/, weight: 4 },
    { regex: /\bimpl\s+\w+/, weight: 3 },
    { regex: /\bmatch\s+\w+/, weight: 3 },
    { regex: /\bOption<|Result</, weight: 3 },
    { regex: /\bSome\(|None\b|Ok\(|Err\(/, weight: 3 },
  ],
  go: [
    { regex: /\bfunc\s+\w+\s*\(/, weight: 4 },
    { regex: /\bpackage\s+\w+/, weight: 4 },
    { regex: /\bimport\s+\(/, weight: 3 },
    { regex: /\bfmt\.\w+/, weight: 4 },
    { regex: /\b:=\s*/, weight: 3 },
    { regex: /\bgoroutine\b/, weight: 4 },
    { regex: /\bchan\s+\w+/, weight: 4 },
    { regex: /\bfunc\s*\(/, weight: 3 },
  ],
  java: [
    { regex: /\bpublic\s+class\s+/, weight: 4 },
    { regex: /\bpublic\s+static\s+void\s+main/, weight: 5 },
    { regex: /\bSystem\.out\.println/, weight: 4 },
    { regex: /\bprivate\s+\w+\s+\w+/, weight: 3 },
    { regex: /\bnew\s+\w+\(/, weight: 2 },
    { regex: /\binterface\s+\w+/, weight: 3 },
    { regex: /\bimplements\s+\w+/, weight: 3 },
    { regex: /\bextends\s+\w+/, weight: 3 },
  ],
  ruby: [
    { regex: /\bdef\s+\w+/, weight: 3 },
    { regex: /\bend\b/, weight: 2 },
    { regex: /\bputs\s+/, weight: 3 },
    { regex: /\brequire\s+['"]/, weight: 3 },
    { regex: /\bclass\s+\w+\s*</, weight: 3 },
    { regex: /\bdo\s*\|/, weight: 3 },
    { regex: /\battr_accessor\b/, weight: 4 },
    { regex: /\bnil\b/, weight: 2 },
  ],
  css: [
    { regex: /\.[a-zA-Z][\w-]*\s*\{/, weight: 3 },
    { regex: /#[a-zA-Z][\w-]*\s*\{/, weight: 3 },
    { regex: /\b@media\s+/, weight: 3 },
    { regex: /\bdisplay\s*:\s*(flex|grid)/, weight: 3 },
    { regex: /\b(margin|padding)\s*:/, weight: 2 },
    { regex: /:\s*(hover|focus|before|after)\b/, weight: 3 },
  ],
  html: [
    { regex: /<!DOCTYPE\s+html>/i, weight: 5 },
    { regex: /<html[\s>]/i, weight: 4 },
    { regex: /<head[\s>]/i, weight: 3 },
    { regex: /<body[\s>]/i, weight: 3 },
    { regex: /<div[\s>]/i, weight: 2 },
    { regex: /<script[\s>]/i, weight: 2 },
    { regex: /<style[\s>]/i, weight: 3 },
  ],
  sql: [
    { regex: /\bSELECT\s+/i, weight: 4 },
    { regex: /\bINSERT\s+INTO/i, weight: 4 },
    { regex: /\bUPDATE\s+\w+\s+SET/i, weight: 4 },
    { regex: /\bDELETE\s+FROM/i, weight: 4 },
    { regex: /\bCREATE\s+TABLE/i, weight: 4 },
    { regex: /\bWHERE\s+/i, weight: 3 },
    { regex: /\bJOIN\s+/i, weight: 3 },
  ],
  bash: [
    { regex: /^#!/, weight: 5 },
    { regex: /\becho\s+/, weight: 3 },
    { regex: /\bif\s*\[/, weight: 3 },
    { regex: /\bthen\b/, weight: 2 },
    { regex: /\bfi\b/, weight: 3 },
    { regex: /\bfor\s+\w+\s+in\b/, weight: 3 },
    { regex: /\bdone\b/, weight: 2 },
    { regex: /\$\(.*\)/, weight: 2 },
  ],
  text: [],
};

export function detectLanguage(code: string): Language {
  const trimmed = code.trim();
  if (!trimmed) return "text";

  const scores: Record<Language, number> = {
    python: 0,
    javascript: 0,
    typescript: 0,
    rust: 0,
    go: 0,
    java: 0,
    ruby: 0,
    css: 0,
    html: 0,
    sql: 0,
    bash: 0,
    text: 0,
  };

  for (const [lang, langPatterns] of Object.entries(patterns)) {
    for (const { regex, weight } of langPatterns) {
      const matches = trimmed.match(new RegExp(regex, "gm"));
      if (matches) {
        scores[lang as Language] += matches.length * weight;
      }
    }
  }

  let bestLang: Language = "text";
  let bestScore = 0;

  for (const [lang, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestLang = lang as Language;
    }
  }

  return bestLang;
}

export function languageDisplayName(lang: Language): string {
  const names: Record<Language, string> = {
    python: "Python",
    javascript: "JavaScript",
    typescript: "TypeScript",
    rust: "Rust",
    go: "Go",
    java: "Java",
    ruby: "Ruby",
    css: "CSS",
    html: "HTML",
    sql: "SQL",
    bash: "Bash",
    text: "Text",
  };
  return names[lang];
}

export type { Language };
