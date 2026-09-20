"use client";

import { useEffect, useState } from "react";
import { getDecks, createDeck, deleteDeck } from "@/db/helpers";
import { db } from "@/db/schema";
import type { Deck } from "@/db/schema";

export default function Home() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [newName, setNewName] = useState("");
  const [counts, setCounts] = useState<Record<number, { total: number; due: number }>>({});

  const load = async () => {
    const d = await getDecks();
    setDecks(d);
    const c: Record<number, { total: number; due: number }> = {};
    const now = Date.now();
    for (const deck of d) {
      const cards = await db.cards.where("deckId").equals(deck.id!).toArray();
      c[deck.id!] = {
        total: cards.length,
        due: cards.filter((card) => card.fsrs.due <= now).length,
      };
    }
    setCounts(c);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createDeck(newName.trim());
    setNewName("");
    load();
  };

  const handleDelete = async (id: number) => {
    await deleteDeck(id);
    load();
  };

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1>Syntanki</h1>
      <p style={{ color: "#888" }}>
        Anki-for-code. Paste code, get atomic cloze cards, review with FSRS.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input
          type="text"
          placeholder="New deck name..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          style={{ padding: 8, borderRadius: 4, border: "1px solid #333", flex: 1 }}
        />
        <button
          onClick={handleCreate}
          style={{
            padding: "8px 16px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Create
        </button>
      </div>

      {decks.length === 0 ? (
        <p>No decks yet. Create one above.</p>
      ) : (
        <div>
          {decks.map((d) => (
            <div
              key={d.id}
              style={{
                border: "1px solid #333",
                borderRadius: 8,
                padding: 16,
                marginBottom: 8,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong>{d.name}</strong>
                <span style={{ color: "#888", marginLeft: 12 }}>
                  {counts[d.id!]?.total ?? 0} cards,
                  {" "}
                  {counts[d.id!]?.due ?? 0} due
                </span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <a
                  href={`/import?deck=${d.id}`}
                  style={{ color: "#2563eb", textDecoration: "none" }}
                >
                  Import
                </a>
                <a
                  href={`/review?deck=${d.id}`}
                  style={{ color: "#16a34a", textDecoration: "none" }}
                >
                  Review
                </a>
                <button
                  onClick={() => handleDelete(d.id!)}
                  style={{
                    color: "#dc2626",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <nav style={{ marginTop: 24 }}>
        <a href="/stats" style={{ marginRight: 16, color: "#888" }}>Stats</a>
        <a href="/settings" style={{ color: "#888" }}>Settings</a>
      </nav>
    </main>
  );
}
