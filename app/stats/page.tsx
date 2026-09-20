"use client";

import { useEffect, useState } from "react";
import { db } from "@/db/schema";
import { getDecks } from "@/db/helpers";
import type { Deck } from "@/db/schema";

interface DeckStats {
  deck: Deck;
  total: number;
  due: number;
  reviewed: number;
  retention: number;
}

export default function StatsPage() {
  const [stats, setStats] = useState<DeckStats[]>([]);
  const [totalCards, setTotalCards] = useState(0);
  const [totalDue, setTotalDue] = useState(0);
  const [totalReviewed, setTotalReviewed] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const decks = await getDecks();
    const now = Date.now();
    const allStats: DeckStats[] = [];
    let gTotal = 0;
    let gDue = 0;
    let gReviewed = 0;
    let gCorrect = 0;

    for (const deck of decks) {
      const cards = await db.cards.where("deckId").equals(deck.id!).toArray();
      const reviews = await db.reviews.toArray();
      const deckCardIds = new Set(cards.map((c: { id?: number }) => c.id));
      const deckReviews = reviews.filter((r: { cardId: number }) => deckCardIds.has(r.cardId));
      const due = cards.filter((c: { fsrs: { due: number } }) => c.fsrs.due <= now).length;
      const correct = deckReviews.filter((r: { grade: number }) => r.grade >= 3).length;
      const retention = deckReviews.length > 0 ? correct / deckReviews.length : 0;

      allStats.push({
        deck,
        total: cards.length,
        due,
        reviewed: deckReviews.length,
        retention,
      });

      gTotal += cards.length;
      gDue += due;
      gReviewed += deckReviews.length;
      gCorrect += correct;
    }

    setStats(allStats);
    setTotalCards(gTotal);
    setTotalDue(gDue);
    setTotalReviewed(gReviewed);
  };

  const overallRetention = totalReviewed > 0 ? 0 : 0; // placeholder, computed per-deck above

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1>Stats</h1>

      <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, fontWeight: "bold" }}>{totalCards}</div>
          <div style={{ color: "#888" }}>Total Cards</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, fontWeight: "bold", color: "#d97706" }}>{totalDue}</div>
          <div style={{ color: "#888" }}>Due Now</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, fontWeight: "bold", color: "#16a34a" }}>{totalReviewed}</div>
          <div style={{ color: "#888" }}>Reviewed</div>
        </div>
      </div>

      {stats.length === 0 ? (
        <p>No decks yet. Create one and import some code.</p>
      ) : (
        <div>
          {stats.map((s) => (
            <div
              key={s.deck.id}
              style={{
                border: "1px solid #333",
                borderRadius: 8,
                padding: 16,
                marginBottom: 8,
              }}
            >
              <strong>{s.deck.name}</strong>
              <div style={{ marginTop: 8, display: "flex", gap: 16, color: "#888" }}>
                <span>{s.total} cards</span>
                <span>{s.due} due</span>
                <span>{s.reviewed} reviewed</span>
                <span>{Math.round(s.retention * 100)}% retention</span>
              </div>
              <div
                style={{
                  marginTop: 8,
                  height: 4,
                  background: "#333",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${s.total > 0 ? ((s.total - s.due) / s.total) * 100 : 0}%`,
                    background: "#16a34a",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <p style={{ marginTop: 16 }}>
        <a href="/">Back to decks</a>
      </p>
    </main>
  );
}
