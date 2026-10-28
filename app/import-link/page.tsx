"use client";

import { useState } from "react";
import { parseSnippet, type RawCard } from "@/parser/cloze";
import { createDeck, addCardsBulk } from "@/db/helpers";

function extractCodeBlocks(markdown: string): { lang: string; code: string }[] {
  const blocks: { lang: string; code: string }[] = [];
  const regex = /```(\w+)?\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    const lang = (match[1] || "javascript").toLowerCase();
    const code = match[2].trim();
    if (code.length > 0) {
      blocks.push({ lang, code });
    }
  }
  return blocks;
}

export default function ImportLinkPage() {
  const [url, setUrl] = useState("");
  const [deckName, setDeckName] = useState("");
  const [preview, setPreview] = useState<RawCard[]>([]);
  const [status, setStatus] = useState<"idle" | "fetching" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  const handleImport = async () => {
    if (!url.trim()) return;
    setStatus("fetching");
    setError("");
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch URL: ${res.status}`);
      const markdown = await res.text();
      const blocks = extractCodeBlocks(markdown);
      if (blocks.length === 0) {
        setError("No code blocks found in the document.");
        setStatus("error");
        return;
      }
      const cards: RawCard[] = [];
      for (const block of blocks) {
        const parsed = parseSnippet(block.code, block.lang);
        cards.push(...parsed);
      }
      setPreview(cards);
      setStatus("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
      setStatus("error");
    }
  };

  const handleSave = async () => {
    if (!deckName.trim() || preview.length === 0) return;
    const deckId = await createDeck(deckName.trim());
    await addCardsBulk(deckId, preview);
    setStatus("saved");
  };

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ color: "var(--ink)", marginBottom: 8 }}>Import from Link</h1>
      <p style={{ color: "var(--mute)", marginBottom: 24 }}>
        Paste a URL to a markdown doc. Code blocks become atomic cloze cards.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/docs/page.md"
          style={{
            padding: 10,
            borderRadius: 6,
            border: "1px solid var(--hairline)",
            width: 420,
            background: "var(--surface-card)",
            color: "var(--ink)",
            fontSize: 14,
          }}
        />
        <button
          onClick={handleImport}
          disabled={status === "fetching" || !url.trim()}
          style={{
            padding: "10px 24px",
            background: "var(--primary)",
            color: "var(--ink)",
            border: "none",
            borderRadius: 6,
            cursor: status === "fetching" || !url.trim() ? "not-allowed" : "pointer",
            fontWeight: 500,
            fontSize: 14,
            opacity: status === "fetching" || !url.trim() ? 0.5 : 1,
          }}
        >
          {status === "fetching" ? "Fetching..." : "Import"}
        </button>
      </div>

      {error && (
        <p style={{ color: "var(--ash)", marginBottom: 16 }}>{error}</p>
      )}

      {preview.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ color: "var(--ink)", marginBottom: 8 }}>{preview.length} cards generated</h2>
          <input
            type="text"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            placeholder="Deck name..."
            style={{
              padding: 10,
              borderRadius: 6,
              border: "1px solid var(--hairline)",
              width: "100%",
              background: "var(--surface-card)",
              color: "var(--ink)",
              fontSize: 14,
              marginBottom: 12,
            }}
          />
          <button
            onClick={handleSave}
            disabled={status === "saved" || !deckName.trim()}
            style={{
              padding: "10px 24px",
              background: status === "saved" ? "var(--surface-soft)" : "var(--primary)",
              color: "var(--ink)",
              border: "none",
              borderRadius: 6,
              cursor: status === "saved" || !deckName.trim() ? "not-allowed" : "pointer",
              fontWeight: 500,
              fontSize: 14,
              opacity: status === "saved" || !deckName.trim() ? 0.5 : 1,
            }}
          >
            {status === "saved" ? "Saved!" : "Save to Deck"}
          </button>
          {status === "saved" && <span style={{ marginLeft: 8, color: "var(--mute)", fontSize: 14 }}>Deck created.</span>}
        </div>
      )}

      {preview.length > 0 && (
        <div style={{ marginTop: 24, border: "1px solid var(--hairline)", borderRadius: 6, padding: 16, background: "var(--surface-card)" }}>
          <h3 style={{ color: "var(--ink)", marginBottom: 8 }}>Preview</h3>
          {preview.slice(0, 10).map((card, i) => (
            <div key={i} style={{ marginBottom: 8, padding: 8, background: "var(--surface-soft)", borderRadius: 4, fontSize: 13 }}>
              <div style={{ color: "var(--ink)", fontWeight: 500, marginBottom: 2 }}>Q: {card.front}</div>
              <div style={{ color: "var(--body)" }}>A: {card.back}</div>
            </div>
          ))}
          {preview.length > 10 && <p style={{ color: "var(--mute)", fontSize: 12, marginTop: 8 }}>{preview.length - 10} more cards...</p>}
        </div>
      )}

      <p style={{ marginTop: 24 }}>
        <a href="/" style={{ color: "var(--link-blue)", textDecoration: "none" }}>Back to decks</a>
      </p>
    </main>
  );
}
