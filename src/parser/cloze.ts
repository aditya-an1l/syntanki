// Deterministic cloze-code parser. Zero AI calls by design.
// Extracts atomic cards: one fact per card, 10-second rule enforced.
// Question patterns inspired by sample Anki decks (conceptual, not just syntactic).

export interface RawCard {
  front: string;
  back: string;
  language: string;
  source: string;
}

function dedup(cards: RawCard[]): RawCard[] {
  const seen = new Set<string>();
  return cards.filter((c) => {
    if (seen.has(c.front)) return false;
    seen.add(c.front);
    return true;
  });
}

function extractKeywords(code: string, language: string): RawCard[] {
  const cards: RawCard[] = [];
  const lines = code.split("\n").filter((l) => l.trim());

  for (const line of lines) {
    const trimmed = line.trim();

    // Rust: fn, let mut, pub, use, impl, match, Option, Result
    if (language === "rust") {
      if (/^\bfn\s+/.test(trimmed)) {
        const name = trimmed.match(/fn\s+(\w+)/)?.[1];
        cards.push({
          front: `What keyword is used to declare a function in Rust?`,
          back: `fn`,
          language,
          source: code,
        });
        if (name) {
          cards.push({
            front: `What is the name of this function?\n\n\`\`\`rust\n${trimmed}\n\`\`\``,
            back: name,
            language,
            source: code,
          });
        }
      }
      if (/\blet\s+mut\b/.test(trimmed)) {
        cards.push({
          front: `What keyword makes a variable mutable in Rust?`,
          back: `mut`,
          language,
          source: code,
        });
      }
      if (/\bpub\s+(fn|struct|enum|mod)\b/.test(trimmed)) {
        cards.push({
          front: `What keyword makes an item public in Rust?`,
          back: `pub`,
          language,
          source: code,
        });
      }
      if (/\bimpl\s+\w+/.test(trimmed)) {
        const trait = trimmed.match(/impl\s+(\w+)/)?.[1];
        cards.push({
          front: `What keyword is used to implement methods for a type?`,
          back: `impl`,
          language,
          source: code,
        });
        if (trait) {
          cards.push({
            front: `What type is being implemented in this block?\n\n\`\`\`rust\n${trimmed}\n\`\`\``,
            back: trait,
            language,
            source: code,
          });
        }
      }
      if (/\bmatch\s+\w+/.test(trimmed)) {
        cards.push({
          front: `What keyword is used for pattern matching in Rust?`,
          back: `match`,
          language,
          source: code,
        });
      }
      if (/println!\s*\(/.test(trimmed)) {
        cards.push({
          front: `What macro is used to print to stdout in Rust?`,
          back: `println!`,
          language,
          source: code,
        });
      }
      if (/Some\(|None\b/.test(trimmed)) {
        cards.push({
          front: `What are the variants of Option in Rust?`,
          back: `Some and None`,
          language,
          source: code,
        });
      }
      if (/Ok\(|Err\(/.test(trimmed)) {
        cards.push({
          front: `What are the variants of Result in Rust?`,
          back: `Ok and Err`,
          language,
          source: code,
        });
      }
    }

    // Python: def, import, from, print, if __name__, self, class, elif
    if (language === "python") {
      if (/^\bdef\s+/.test(trimmed)) {
        const name = trimmed.match(/def\s+(\w+)/)?.[1];
        cards.push({
          front: `What keyword is used to define a function in Python?`,
          back: `def`,
          language,
          source: code,
        });
        if (name) {
          cards.push({
            front: `What is the name of this function?\n\n\`\`\`python\n${trimmed}\n\`\`\``,
            back: name,
            language,
            source: code,
          });
        }
      }
      if (/\bfrom\s+\w+\s+import\b/.test(trimmed)) {
        const module = trimmed.match(/from\s+(\w+)\s+import/)?.[1];
        cards.push({
          front: `What module is being imported from?`,
          back: module || "unknown",
          language,
          source: code,
        });
      }
      if (/\bif\s+__name__\s*==/.test(trimmed)) {
        cards.push({
          front: `What does this condition check?\n\n\`\`\`python\n${trimmed}\n\`\`\``,
          back: `Whether the script is being run directly (not imported)`,
          language,
          source: code,
        });
      }
      if (/\bself\.\w+/.test(trimmed)) {
        const attr = trimmed.match(/self\.(\w+)/)?.[1];
        cards.push({
          front: `What does \`self\` refer to in a Python class method?`,
          back: `The instance of the class`,
          language,
          source: code,
        });
        if (attr) {
          cards.push({
            front: `What attribute is accessed via \`self\`?\n\n\`\`\`python\n${trimmed}\n\`\`\``,
            back: attr,
            language,
            source: code,
          });
        }
      }
      if (/print\s*\(/.test(trimmed)) {
        const arg = trimmed.match(/print\s*\((.+)\)/)?.[1];
        cards.push({
          front: `What does this print?\n\n\`\`\`python\n${trimmed}\n\`\`\``,
          back: arg || "[output]",
          language,
          source: code,
        });
      }
      if (/\bclass\s+\w+/.test(trimmed)) {
        const name = trimmed.match(/class\s+(\w+)/)?.[1];
        cards.push({
          front: `What keyword defines a class in Python?`,
          back: `class`,
          language,
          source: code,
        });
        if (name) {
          cards.push({
            front: `What is the name of this class?\n\n\`\`\`python\n${trimmed}\n\`\`\``,
            back: name,
            language,
            source: code,
          });
        }
      }
      if (/\belif\b/.test(trimmed)) {
        cards.push({
          front: `What keyword is used for else-if conditions in Python?`,
          back: `elif`,
          language,
          source: code,
        });
      }
    }

    // JavaScript/TypeScript: function, const, let, import, export, console.log, async, await
    if (language === "javascript" || language === "typescript" || language === "tsx" || language === "jsx") {
      if (/^\bfunction\s+/.test(trimmed)) {
        const name = trimmed.match(/function\s+(\w+)/)?.[1];
        cards.push({
          front: `What keyword is used to declare a function?`,
          back: `function`,
          language,
          source: code,
        });
        if (name) {
          cards.push({
            front: `What is the name of this function?\n\n\`\`\`${language}\n${trimmed}\n\`\`\``,
            back: name,
            language,
            source: code,
          });
        }
      }
      if (/\bimport\s+.*from\s+['"]/.test(trimmed)) {
        const from = trimmed.match(/from\s+['"]([^'"]+)['"]/)?.[1];
        cards.push({
          front: `What module is being imported from?`,
          back: from || "unknown",
          language,
          source: code,
        });
      }
      if (/\bexport\s+(default|const|function|class|interface|type)\b/.test(trimmed)) {
        const kind = trimmed.match(/export\s+(\w+)/)?.[1];
        cards.push({
          front: `What does the \`export\` keyword do?`,
          back: `Makes a value available for import in other modules`,
          language,
          source: code,
        });
        if (kind) {
          cards.push({
            front: `What kind of export is this?\n\n\`\`\`${language}\n${trimmed}\n\`\`\``,
            back: `${kind} export`,
            language,
            source: code,
          });
        }
      }
      if (/\bconst\s+\w+\s*=/.test(trimmed)) {
        const name = trimmed.match(/const\s+(\w+)/)?.[1];
        cards.push({
          front: `What keyword declares a constant variable?`,
          back: `const`,
          language,
          source: code,
        });
        if (name) {
          cards.push({
            front: `What is the name of this constant?\n\n\`\`\`${language}\n${trimmed}\n\`\`\``,
            back: name,
            language,
            source: code,
          });
        }
      }
      if (/\blet\s+\w+\s*=/.test(trimmed)) {
        cards.push({
          front: `What keyword declares a block-scoped variable?`,
          back: `let`,
          language,
          source: code,
        });
      }
      if (/\basync\s+function/.test(trimmed)) {
        cards.push({
          front: `What two keywords define an asynchronous function?`,
          back: `async function`,
          language,
          source: code,
        });
      }
      if (/\bawait\s+/.test(trimmed)) {
        cards.push({
          front: `What keyword pauses until a Promise resolves?`,
          back: `await`,
          language,
          source: code,
        });
      }
      if (/console\.log\s*\(/.test(trimmed)) {
        const arg = trimmed.match(/console\.log\s*\((.+)\)/)?.[1];
        cards.push({
          front: `What does this log?\n\n\`\`\`${language}\n${trimmed}\n\`\`\``,
          back: arg || "[output]",
          language,
          source: code,
        });
      }
      if (/\binterface\s+\w+/.test(trimmed)) {
        const name = trimmed.match(/interface\s+(\w+)/)?.[1];
        cards.push({
          front: `What keyword defines a TypeScript interface?`,
          back: `interface`,
          language,
          source: code,
        });
        if (name) {
          cards.push({
            front: `What is the name of this interface?\n\n\`\`\`${language}\n${trimmed}\n\`\`\``,
            back: name,
            language,
            source: code,
          });
        }
      }
    }

    // Go: func, package, import, fmt, :=
    if (language === "go") {
      if (/^\bfunc\s+/.test(trimmed)) {
        cards.push({
          front: `What keyword is used to declare a function in Go?`,
          back: `func`,
          language,
          source: code,
        });
      }
      if (/\bpackage\s+\w+/.test(trimmed)) {
        const pkg = trimmed.match(/package\s+(\w+)/)?.[1];
        cards.push({
          front: `What keyword declares the package name?`,
          back: `package`,
          language,
          source: code,
        });
        if (pkg) {
          cards.push({
            front: `What is the package name in this file?`,
            back: pkg,
            language,
            source: code,
          });
        }
      }
      if (/\bfmt\.\w+/.test(trimmed)) {
        const fn = trimmed.match(/fmt\.(\w+)/)?.[1];
        cards.push({
          front: `What package is \`fmt\` used for?`,
          back: `Formatted I/O (input/output)`,
          language,
          source: code,
        });
        if (fn) {
          cards.push({
            front: `What function of the \`fmt\` package is called?\n\n\`\`\`go\n${trimmed}\n\`\`\``,
            back: fn,
            language,
            source: code,
          });
        }
      }
      if (/\b:=\s*/.test(trimmed)) {
        cards.push({
          front: `What operator declares and initializes a variable in Go?`,
          back: `:= (short variable declaration)`,
          language,
          source: code,
        });
      }
    }

    // Java: public, class, static, void, new, interface, extends, implements
    if (language === "java") {
      if (/\bpublic\s+class\s+/.test(trimmed)) {
        const name = trimmed.match(/class\s+(\w+)/)?.[1];
        cards.push({
          front: `What keyword makes a class public?`,
          back: `public`,
          language,
          source: code,
        });
        if (name) {
          cards.push({
            front: `What is the name of this class?\n\n\`\`\`java\n${trimmed}\n\`\`\``,
            back: name,
            language,
            source: code,
          });
        }
      }
      if (/\bpublic\s+static\s+void\s+main/.test(trimmed)) {
        cards.push({
          front: `What is the entry point of a Java application?`,
          back: `public static void main(String[] args)`,
          language,
          source: code,
        });
      }
      if (/\bSystem\.out\.println/.test(trimmed)) {
        cards.push({
          front: `What method prints to stdout in Java?`,
          back: `System.out.println()`,
          language,
          source: code,
        });
      }
      if (/\bnew\s+\w+\(/.test(trimmed)) {
        const cls = trimmed.match(/new\s+(\w+)\(/)?.[1];
        cards.push({
          front: `What keyword creates a new object instance?`,
          back: `new`,
          language,
          source: code,
        });
        if (cls) {
          cards.push({
            front: `What class is being instantiated?\n\n\`\`\`java\n${trimmed}\n\`\`\``,
            back: cls,
            language,
            source: code,
          });
        }
      }
    }

    // Ruby: def, end, puts, require, class, do, attr_accessor, nil
    if (language === "ruby") {
      if (/^\bdef\s+/.test(trimmed)) {
        cards.push({
          front: `What keyword defines a method in Ruby?`,
          back: `def`,
          language,
          source: code,
        });
      }
      if (/\bend\b/.test(trimmed)) {
        cards.push({
          front: `What keyword closes a method or block in Ruby?`,
          back: `end`,
          language,
          source: code,
        });
      }
      if (/\bputs\s+/.test(trimmed)) {
        cards.push({
          front: `What method prints to stdout in Ruby?`,
          back: `puts`,
          language,
          source: code,
        });
      }
      if (/\brequire\s+['"]/.test(trimmed)) {
        cards.push({
          front: `What keyword loads a library in Ruby?`,
          back: `require`,
          language,
          source: code,
        });
      }
      if (/\battr_accessor\b/.test(trimmed)) {
        cards.push({
          front: `What macro creates getter and setter methods?`,
          back: `attr_accessor`,
          language,
          source: code,
        });
      }
      if (/\bnil\b/.test(trimmed)) {
        cards.push({
          front: `What is Ruby's equivalent of null?`,
          back: `nil`,
          language,
          source: code,
        });
      }
    }

    // CSS: selectors, properties, media queries
    if (language === "css") {
      if (/\.[a-zA-Z][\w-]*\s*\{/.test(trimmed)) {
        const cls = trimmed.match(/\.([\w-]+)/)?.[1];
        cards.push({
          front: `What does the dot (\`.\`) prefix mean in CSS?`,
          back: `It selects elements by class name`,
          language,
          source: code,
        });
        if (cls) {
          cards.push({
            front: `What class is being selected?\n\n\`\`\`css\n${trimmed}\n\`\`\``,
            back: cls,
            language,
            source: code,
          });
        }
      }
      if (/#[a-zA-Z][\w-]*\s*\{/.test(trimmed)) {
        const id = trimmed.match(/#([\w-]+)/)?.[1];
        cards.push({
          front: `What does the hash (\`#\`) prefix mean in CSS?`,
          back: `It selects an element by ID`,
          language,
          source: code,
        });
        if (id) {
          cards.push({
            front: `What ID is being selected?\n\n\`\`\`css\n${trimmed}\n\`\`\``,
            back: id,
            language,
            source: code,
          });
        }
      }
      if (/\bdisplay\s*:\s*(flex|grid)\b/.test(trimmed)) {
        const value = trimmed.match(/display\s*:\s*(\w+)/)?.[1];
        cards.push({
          front: `What CSS property creates a flex or grid container?`,
          back: `display`,
          language,
          source: code,
        });
      }
    }

    // SQL: SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, WHERE, JOIN
    if (language === "sql") {
      if (/\bSELECT\s+/i.test(trimmed)) {
        cards.push({
          front: `What SQL statement queries data?`,
          back: `SELECT`,
          language,
          source: code,
        });
      }
      if (/\bINSERT\s+INTO/i.test(trimmed)) {
        cards.push({
          front: `What SQL statement adds new rows?`,
          back: `INSERT INTO`,
          language,
          source: code,
        });
      }
      if (/\bUPDATE\s+\w+\s+SET/i.test(trimmed)) {
        cards.push({
          front: `What SQL statement modifies existing rows?`,
          back: `UPDATE`,
          language,
          source: code,
        });
      }
      if (/\bDELETE\s+FROM/i.test(trimmed)) {
        cards.push({
          front: `What SQL statement removes rows?`,
          back: `DELETE FROM`,
          language,
          source: code,
        });
      }
      if (/\bCREATE\s+TABLE/i.test(trimmed)) {
        cards.push({
          front: `What SQL statement creates a new table?`,
          back: `CREATE TABLE`,
          language,
          source: code,
        });
      }
      if (/\bWHERE\s+/i.test(trimmed)) {
        cards.push({
          front: `What clause filters rows in SQL?`,
          back: `WHERE`,
          language,
          source: code,
        });
      }
      if (/\bJOIN\s+/i.test(trimmed)) {
        cards.push({
          front: `What clause combines rows from two tables?`,
          back: `JOIN`,
          language,
          source: code,
        });
      }
    }

    // Bash: #!/bin/bash, echo, if, then, fi, for, done
    if (language === "bash") {
      if (/^#!\/bin\/(ba)?sh/.test(trimmed)) {
        cards.push({
          front: `What is the shebang line for a bash script?`,
          back: `#!/bin/bash`,
          language,
          source: code,
        });
      }
      if (/\becho\s+/.test(trimmed)) {
        cards.push({
          front: `What command prints text in bash?`,
          back: `echo`,
          language,
          source: code,
        });
      }
      if (/\bif\s*\[/.test(trimmed)) {
        cards.push({
          front: `What keyword starts a conditional in bash?`,
          back: `if`,
          language,
          source: code,
        });
      }
      if (/\bthen\b/.test(trimmed)) {
        cards.push({
          front: `What keyword follows the condition in an if statement?`,
          back: `then`,
          language,
          source: code,
        });
      }
      if (/\bfi\b/.test(trimmed)) {
        cards.push({
          front: `What keyword closes an if statement in bash?`,
          back: `fi`,
          language,
          source: code,
        });
      }
      if (/\bfor\s+\w+\s+in\b/.test(trimmed)) {
        cards.push({
          front: `What keyword starts a for loop in bash?`,
          back: `for`,
          language,
          source: code,
        });
      }
    }

    // C++: class, virtual, template, #include, cout, namespace, new, delete
    if (language === "cpp") {
      if (/\bclass\s+\w+/.test(trimmed)) {
        cards.push({
          front: `What keyword defines a class in C++?`,
          back: `class`,
          language,
          source: code,
        });
      }
      if (/\bvirtual\b/.test(trimmed)) {
        cards.push({
          front: `What keyword declares a virtual function in C++?`,
          back: `virtual`,
          language,
          source: code,
        });
      }
      if (/\btemplate\s*</.test(trimmed)) {
        cards.push({
          front: `What keyword starts a template declaration in C++?`,
          back: `template`,
          language,
          source: code,
        });
      }
      if (/^#include/.test(trimmed)) {
        cards.push({
          front: `What directive includes a header in C++?`,
          back: `#include`,
          language,
          source: code,
        });
      }
      if (/\bstd::cout/.test(trimmed)) {
        cards.push({
          front: `What object prints to stdout in C++?`,
          back: `std::cout`,
          language,
          source: code,
        });
      }
      if (/\bnamespace\s+\w+/.test(trimmed)) {
        cards.push({
          front: `What keyword defines a namespace in C++?`,
          back: `namespace`,
          language,
          source: code,
        });
      }
      if (/\bnew\s+\w+/.test(trimmed)) {
        cards.push({
          front: `What keyword allocates memory in C++?`,
          back: `new`,
          language,
          source: code,
        });
      }
      if (/\bdelete\s+\w+/.test(trimmed)) {
        cards.push({
          front: `What keyword deallocates memory in C++?`,
          back: `delete`,
          language,
          source: code,
        });
      }
    }
  }

  return dedup(cards);
}

function extractRelationships(code: string, language: string): RawCard[] {
  const cards: RawCard[] = [];

  // Method calls: obj.method(
  const methodCalls = code.matchAll(/\.(\w+)\s*\(/g);
  const seenMethods = new Set<string>();
  for (const m of methodCalls) {
    const method = m[1];
    if (!seenMethods.has(method) && !["length", "toString", "valueOf", "hasOwnProperty"].includes(method)) {
      seenMethods.add(method);
      cards.push({
        front: `What method is being called?\n\n\`\`\`${language}\n...${m[0]}...\n\`\`\``,
        back: method,
        language,
        source: code,
      });
    }
  }

  // Function params
  const funcParams = code.matchAll(/(?:function|def|fn|func)\s+\w+\s*\(([^)]+)\)/g);
  for (const m of funcParams) {
    const params = m[1].split(",").map((p: string) => p.trim().split(":")[0].split("=")[0].split(" ")[0]).filter(Boolean);
    const fnMatch = m[0].match(/(?:function|def|fn|func)\s+(\w+)/);
    const fnName = fnMatch ? fnMatch[1] : "this function";
    for (const param of params) {
      if (param && param !== "self" && param !== "cls") {
        cards.push({
          front: `What is a parameter of \`${fnName}\`?`,
          back: param,
          language,
          source: code,
        });
      }
    }
  }

  return dedup(cards);
}

export function parseSnippet(code: string, language: string): RawCard[] {
  const all: RawCard[] = [
    ...extractKeywords(code, language),
    ...extractRelationships(code, language),
  ];

  return dedup(all);
}
