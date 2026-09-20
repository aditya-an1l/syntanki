"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { parseSnippet, type RawCard } from "@/parser/cloze";
import { createDeck, getDecks, addCardsBulk } from "@/db/helpers";
import type { Deck } from "@/db/schema";
import { Suspense } from "react";

const LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "tsx",
  "jsx",
  "go",
  "rust",
  "java",
  "ruby",
  "css",
  "html",
  "sql",
  "bash",
  "json",
  "yaml",
];

function ImportInner() {
  const searchParams = useSearchParams();
  const deckParam = searchParams.get("deck") ? Number(searchParams.get("deck")) : null;

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<number | null>(deckParam);
  const [newDeckName, setNewDeckName] = useState("");
  const [preview, setPreview] = useState<RawCard[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getDecks().then((d) => {
      setDecks(d);
      if (deckParam) {
        setSelectedDeck(deckParam);
      } else if (d.length > 0 && !selectedDeck) {
        setSelectedDeck(d[0].id!);
      }
    });
  }, [deckParam]);

  const handleParse = () => {
    if (!code.trim()) return;
    const cards = parseSnippet(code, language);
    setPreview(cards);
    setSaved(false);
  };

  const handleSave = async () => {
    if (preview.length === 0) return;

    let deckId = selectedDeck;
    if (!deckId && newDeckName.trim()) {
      deckId = await createDeck(newDeckName.trim());
      const d = await getDecks();
      setDecks(d);
      setSelectedDeck(deckId);
    }
    if (!deckId) return;

    await addCardsBulk(deckId, preview);
    setSaved(true);
    setCode("");
    setPreview([]);
  };

  const handleCodeChange = async (value: string) => {
    setCode(value);
    if (value.trim()) {
      const cards = parseSnippet(value, language);
      setPreview(cards);
      setSaved(false);
    } else {
      setPreview([]);
    }
  };

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1>Import</h1>
      <p style={{ color: "#888" }}>
        Paste code. Get atomic cloze cards. No AI needed.
      </p>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{ padding: 8, borderRadius: 4, border: "1px solid #333" }}
        >
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        <select
          value={selectedDeck ?? ""}
          onChange={(e) => setSelectedDeck(Number(e.target.value))}
          style={{ padding: 8, borderRadius: 4, border: "1px solid #333" }}
        >
          {decks.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Or create new deck..."
          value={newDeckName}
          onChange={(e) => setNewDeckName(e.target.value)}
          style={{ padding: 8, borderRadius: 4, border: "1px solid #333", flex: 1 }}
        />
      </div>

      <textarea
        value={code}
        onChange={(e) => handleCodeChange(e.target.value)}
        placeholder={`Paste your ${language} code here...`}
        rows={12}
        style={{
          width: "100%",
          fontFamily: "monospace",
          fontSize: 14,
          padding: 12,
          borderRadius: 4,
          border: "1px solid #333",
          background: "#0d1117",
          color: "#c9d1d9",
          resize: "vertical",
        }}
      />

      {preview.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h2>{preview.length} cards generated</h2>
          {preview.map((card, i) => (
            <div
              key={i}
              style={{
                border: "1px solid #333",
                borderRadius: 8,
                padding: 12,
                marginBottom: 8,
                background: "#1a1a2e",
              }}
            >
              <div><strong>Q:</strong> {card.front}</div>
              <div style={{ marginTop: 4 }}><strong>A:</strong> {card.back}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <button
          onClick={handleParse}
          disabled={!code.trim()}
          style={{
            padding: "8px 24px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            opacity: code.trim() ? 1 : 0.5,
          }}
        >
          Parse
        </button>
        <button
          onClick={handleSave}
          disabled={preview.length === 0}
          style={{
            padding: "8px 24px",
            background: "#16a34a",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            opacity: preview.length > 0 ? 1 : 0.5,
          }}
        >
          Save to Deck
        </button>
      </div>

      {saved && <p style={{ color: "#16a34a", marginTop: 8 }}>Cards saved.</p>}

      <p style={{ marginTop: 16 }}>
        <a href="/">Back to decks</a>
      </p>
    </main>
  );
}

export default function ImportPage() {
  return (
    <Suspense fallback={<main style={{ padding: 24 }}>Loading...</main>}>
      <ImportInner />
    </Suspense>
  );
}
