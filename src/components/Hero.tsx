import { ReactNode } from "react";

interface HeroProps {
  children?: ReactNode;
}

export default function Hero({ children }: HeroProps) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h1
        style={{
          fontSize: 36,
          fontWeight: 700,
          lineHeight: 1.5,
          color: "var(--ink)",
          marginBottom: 4,
        }}
      >
        Syntanki
      </h1>
      <p
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: "var(--ink)",
          marginBottom: 16,
        }}
      >
        Anki for Code
      </p>
      <p
        style={{
          fontSize: 16,
          lineHeight: 1.5,
          color: "var(--body)",
          marginBottom: 24,
          maxWidth: 480,
        }}
      >
        Paste code, generate flashcards, and master programming concepts with
        spaced repetition. All offline, all local.
      </p>

      <div
        style={{
          background: "var(--surface-soft)",
          border: "1px solid var(--hairline)",
          borderRadius: 6,
          padding: 16,
          marginBottom: 24,
        }}
      >
        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--ink)",
            marginBottom: 8,
          }}
        >
          How to use
        </p>
        <ol
          style={{
            fontSize: 14,
            color: "var(--body)",
            paddingLeft: 20,
            margin: 0,
          }}
        >
          <li>Create a deck for a topic or repository</li>
          <li>Paste your code, docs, or notes</li>
          <li>Review with smart scheduling that adapts to you</li>
        </ol>
      </div>

      {children}
    </section>
  );
}
