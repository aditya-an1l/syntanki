"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDecks, createDeck, deleteDeck } from "@/db/helpers";
import { db } from "@/db/schema";
import type { Deck } from "@/db/schema";
import Hero from "@/components/Hero";
import DeckCard from "@/components/DeckCard";

export default function Home() {
  const router = useRouter();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [newName, setNewName] = useState("");
  const [counts, setCounts] = useState<Record<number, { total: number; due: number }>>({});
  const [showCreate, setShowCreate] = useState(false);

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
    setShowCreate(false);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this deck and all its cards?")) return;
    await deleteDeck(id);
    load();
  };

  const handleReview = (id: number) => {
    router.push(`/review?deck=${id}`);
  };

  return (
    <main style={{ padding: "48px 24px", maxWidth: 720, margin: "0 auto" }}>
      <Hero>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => setShowCreate(!showCreate)}
            style={{
              padding: "8px 16px",
              background: "var(--primary)",
              color: "var(--ink)",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            Add Deck
          </button>
          <a
            href="/stats"
            style={{
              padding: "8px 16px",
              background: "var(--surface-soft)",
              color: "var(--ink)",
              border: "1px solid var(--hairline)",
              borderRadius: 6,
              textDecoration: "none",
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            Stats
          </a>
          <a
            href="/settings"
            style={{
              padding: "8px 16px",
              background: "var(--surface-soft)",
              color: "var(--ink)",
              border: "1px solid var(--hairline)",
              borderRadius: 6,
              textDecoration: "none",
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            Settings
          </a>
        </div>
      </Hero>

      {showCreate && (
        <div
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--hairline)",
            borderRadius: 6,
            padding: 16,
            marginBottom: 24,
            display: "flex",
            gap: 8,
          }}
        >
          <input
            type="text"
            placeholder="Deck name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            style={{
              flex: 1,
              padding: 8,
              borderRadius: 6,
              border: "1px solid var(--hairline)",
              background: "var(--surface-card)",
              color: "var(--ink)",
            }}
          />
          <button
            onClick={handleCreate}
            style={{
              padding: "8px 16px",
              background: "var(--primary)",
              color: "var(--ink)",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Create
          </button>
          <button
            onClick={() => setShowCreate(false)}
            style={{
              padding: "8px 16px",
              background: "var(--surface-soft)",
              color: "var(--body)",
              border: "1px solid var(--hairline)",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {decks.length === 0 ? (
        <p style={{ color: "var(--mute)", textAlign: "center", padding: 48 }}>
          No decks yet. Create one to get started.
        </p>
      ) : (
        <div>
          {decks.map((d) => (
            <DeckCard
              key={d.id}
              id={d.id!}
              name={d.name}
              total={counts[d.id!]?.total ?? 0}
              due={counts[d.id!]?.due ?? 0}
              onReview={handleReview}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </main>
  );
}
