// Deterministic cloze-code parser. Zero AI calls by design.
// Extracts atomic cards: one fact per card, 10-second rule enforced.

export interface RawCard {
  front: string;
  back: string;
  language: string;
  source: string;
}

function lines(code: string): string[] {
  return code.split("\n").map((l) => l.trim()).filter(Boolean);
}

function extractIdentifiers(code: string, language: string): RawCard[] {
  const cards: RawCard[] = [];
  const seen = new Set<string>();

  // JS/TS patterns
  if (language === "javascript" || language === "typescript" || language === "tsx" || language === "jsx") {
    // function declarations: function foo() {}
    for (const m of code.matchAll(/function\s+(\w+)\s*\(/g)) {
      const name = m[1];
      if (!seen.has(name)) {
        seen.add(name);
        cards.push({
          front: `What is the name of this function?\n\n\`\`\`${language}\n${m[0]}\n\`\`\``,
          back: name,
          language,
          source: code,
        });
      }
    }

    // const/let/var arrow or assignment: const foo = ...
    for (const m of code.matchAll(/(?:const|let|var)\s+(\w+)\s*=/g)) {
      const name = m[1];
      if (!seen.has(name) && name.length > 1) {
        seen.add(name);
        // Try to find the assigned value
        const assignMatch = code.match(new RegExp(`(?:const|let|var)\\s+${name}\\s*=\\s*(.+?)(?:;|$)`, "m"));
        const value = assignMatch ? assignMatch[1].trim() : "??";
        cards.push({
          front: `What value is assigned to \`${name}\`?\n\n\`\`\`${language}\n${m[0]} ...\n\`\`\``,
          back: value,
          language,
          source: code,
        });
      }
    }

    // method calls: obj.method(
    for (const m of code.matchAll(/\.(\w+)\s*\(/g)) {
      const method = m[1];
      if (!seen.has(method) && !["length", "toString", "valueOf"].includes(method)) {
        seen.add(method);
        cards.push({
          front: `What method is being called?\n\n\`\`\`${language}\n...${m[0]}...\n\`\`\``,
          back: method,
          language,
          source: code,
        });
      }
    }

    // imports: import { foo } from 'bar' or import foo from 'bar'
    for (const m of code.matchAll(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g)) {
      const names = m[1].split(",").map((n: string) => n.trim()).filter(Boolean);
      const from = m[2];
      for (const name of names) {
        if (!seen.has(name)) {
          seen.add(name);
          cards.push({
            front: `What is imported from \`${from}\`?\n\n\`\`\`${language}\n${m[0]}\n\`\`\``,
            back: name,
            language,
            source: code,
          });
        }
      }
    }
  }

  // Python patterns
  if (language === "python") {
    // def foo():
    for (const m of code.matchAll(/def\s+(\w+)\s*\(/g)) {
      const name = m[1];
      if (!seen.has(name)) {
        seen.add(name);
        cards.push({
          front: `What is the name of this function?\n\n\`\`\`python\n${m[0]}\n\`\`\``,
          back: name,
          language,
          source: code,
        });
      }
    }

    // import/from: import foo / from bar import baz
    for (const m of code.matchAll(/from\s+(\S+)\s+import\s+(\w+)/g)) {
      const name = m[2];
      const from = m[1];
      if (!seen.has(name)) {
        seen.add(name);
        cards.push({
          front: `What is imported from \`${from}\`?\n\n\`\`\`python\n${m[0]}\n\`\`\``,
          back: name,
          language,
          source: code,
        });
      }
    }

    // variable assignment: foo = value
    for (const m of code.matchAll(/^(\w+)\s*=\s*(.+)$/gm)) {
      const name = m[1];
      if (!seen.has(name) && name.length > 1 && !["self", "cls"].includes(name)) {
        seen.add(name);
        cards.push({
          front: `What value is assigned to \`${name}\`?`,
          back: m[2].trim(),
          language,
          source: code,
        });
      }
    }
  }

  return cards;
}

function extractOutputs(code: string, language: string): RawCard[] {
  const cards: RawCard[] = [];

  // console.log statements
  for (const m of code.matchAll(/console\.log\s*\((.+?)\)/g)) {
    cards.push({
      front: `What does this log?\n\n\`\`\`${language}\nconsole.log(${m[1]});\n\`\`\``,
      back: `[output of console.log(${m[1]})]`,
      language,
      source: code,
    });
  }

  // Python print statements
  if (language === "python") {
    for (const m of code.matchAll(/print\s*\((.+?)\)/g)) {
      cards.push({
        front: `What does this print?\n\n\`\`\`python\nprint(${m[1]})\n\`\`\``,
        back: `[output of print(${m[1]})]`,
        language,
        source: code,
      });
    }
  }

  return cards;
}

function extractArgs(code: string, language: string): RawCard[] {
  const cards: RawCard[] = [];
  const seen = new Set<string>();

  // JS/TS function params
  if (language === "javascript" || language === "typescript" || language === "tsx" || language === "jsx") {
    for (const m of code.matchAll(/function\s+\w+\s*\(([^)]+)\)/g)) {
      const params = m[1].split(",").map((p: string) => p.trim().split(":")[0].split("=")[0]).filter(Boolean);
      const fnMatch = code.match(/function\s+(\w+)/);
      const fnName = fnMatch ? fnMatch[1] : "this function";
      for (const param of params) {
        if (!seen.has(param)) {
          seen.add(param);
          cards.push({
            front: `What is a parameter of \`${fnName}\`?`,
            back: param,
            language,
            source: code,
          });
        }
      }
    }
  }

  // Python function params
  if (language === "python") {
    for (const m of code.matchAll(/def\s+(\w+)\s*\(([^)]*)\)/g)) {
      const fnName = m[1];
      const params = m[2].split(",").map((p: string) => p.trim().split(":")[0].split("=")[0]).filter(Boolean);
      for (const param of params) {
        if (!seen.has(param) && !["self", "cls"].includes(param)) {
          seen.add(param);
          cards.push({
            front: `What is a parameter of \`${fnName}\`?`,
            back: param,
            language,
            source: code,
          });
        }
      }
    }
  }

  return cards;
}

export function parseSnippet(code: string, language: string): RawCard[] {
  const all: RawCard[] = [
    ...extractIdentifiers(code, language),
    ...extractOutputs(code, language),
    ...extractArgs(code, language),
  ];

  // Deduplicate by front
  const seen = new Set<string>();
  return all.filter((c) => {
    if (seen.has(c.front)) return false;
    seen.add(c.front);
    return true;
  });
}
