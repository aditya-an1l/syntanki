"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { parseSnippet, type RawCard } from "@/parser/cloze";
import { createDeck, getDecks, addCardsBulk } from "@/db/helpers";
import type { Deck } from "@/db/schema";
import { detectLanguage, languageDisplayName, type Language } from "@/parser/detect-language";
import { Suspense } from "react";

function ImportInner() {
  const searchParams = useSearchParams();
  const deckParam = searchParams.get("deck") ? Number(searchParams.get("deck")) : null;

  const [code, setCode] = useState("");
  const [detectedLang, setDetectedLang] = useState<Language>("text");
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
    const lang = detectLanguage(code);
    setDetectedLang(lang);
    const cards = parseSnippet(code, lang === "text" ? "javascript" : lang);
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
    setDetectedLang("text");
  };

  const handleCodeChange = async (value: string) => {
    setCode(value);
    if (value.trim()) {
      const lang = detectLanguage(value);
      setDetectedLang(lang);
      const cards = parseSnippet(value, lang === "text" ? "javascript" : lang);
      setPreview(cards);
      setSaved(false);
    } else {
      setPreview([]);
      setDetectedLang("text");
    }
  };

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ color: "var(--ink)", marginBottom: 4 }}>Import</h1>
      <p style={{ color: "var(--mute)", marginBottom: 24 }}>
        Paste code. Get atomic cloze cards. Language auto-detected.
      </p>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        {detectedLang !== "text" && (
          <span
            style={{
              padding: "6px 12px",
              background: "var(--surface-soft)",
              border: "1px solid var(--hairline)",
              borderRadius: 6,
              fontSize: 14,
              color: "var(--ink)",
              fontWeight: 500,
            }}
          >
            {languageDisplayName(detectedLang)}
          </span>
        )}

        <select
          value={selectedDeck ?? ""}
          onChange={(e) => setSelectedDeck(Number(e.target.value))}
          style={{
            padding: 8,
            borderRadius: 6,
            border: "1px solid var(--hairline)",
            background: "var(--surface-card)",
            color: "var(--ink)",
          }}
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
          style={{
            padding: 8,
            borderRadius: 6,
            border: "1px solid var(--hairline)",
            background: "var(--surface-card)",
            color: "var(--ink)",
            flex: 1,
          }}
        />
      </div>

      <textarea
        value={code}
        onChange={(e) => handleCodeChange(e.target.value)}
        placeholder="Paste your code here..."
        rows={12}
        style={{
          width: "100%",
          fontFamily: "var(--font-mono)",
          fontSize: 14,
          padding: 12,
          borderRadius: 6,
          border: "1px solid var(--hairline)",
          background: "var(--surface-card)",
          color: "var(--ink)",
          resize: "vertical",
        }}
      />

      {preview.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h2 style={{ color: "var(--ink)", marginBottom: 8 }}>{preview.length} cards generated</h2>
          {preview.map((card, i) => (
            <div
              key={i}
              style={{
                border: "1px solid var(--hairline)",
                borderRadius: 6,
                padding: 12,
                marginBottom: 8,
                background: "var(--surface-card)",
              }}
            >
              <div style={{ color: "var(--ink)" }}><strong>Q:</strong> {card.front}</div>
              <div style={{ marginTop: 4, color: "var(--body)" }}><strong>A:</strong> {card.back}</div>
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
            background: "var(--primary)",
            color: "var(--ink)",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: 500,
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
            background: "var(--surface-soft)",
            color: "var(--ink)",
            border: "1px solid var(--hairline)",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: 500,
            opacity: preview.length > 0 ? 1 : 0.5,
          }}
        >
          Save to Deck
        </button>
      </div>

      {saved && <p style={{ color: "var(--mute)", marginTop: 8 }}>Cards saved.</p>}

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
