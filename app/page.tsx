"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDecks, deleteDeck, exportDeck, getSetting, setSetting } from "@/db/helpers";
import { seedCuratedDecks, resetCuratedDeck } from "@/db/seed";
import { db } from "@/db/schema";
import type { Deck } from "@/db/schema";
import Hero from "@/components/Hero";
import DeckCard from "@/components/DeckCard";
import Drawer from "@/components/Drawer";
import DeckManager from "@/components/DeckManager";
import Onboarding from "@/components/Onboarding";

export default function Home() {
  const router = useRouter();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [counts, setCounts] = useState<Record<number, { total: number; due: number }>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  const load = async () => {
    await seedCuratedDecks();
    const d = await getDecks();
    setDecks(d);
    const onboardedVal = await getSetting("onboarded");
    setOnboarded(onboardedVal === "true");
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

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this deck and all its cards?")) return;
    await deleteDeck(id);
    load();
  };

  const handleExport = async (id: number) => {
    const json = await exportDeck(id);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `syntanki-deck-${id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = async (seedKey: string) => {
    if (
      !confirm(
        "Reset this curated deck to its original cards? Your progress on this deck will be cleared."
      )
    )
      return;
    await resetCuratedDeck(seedKey);
    load();
  };

  const handleReview = (id: number) => {
    router.push(`/review?deck=${id}`);
  };

  if (onboarded === null) {
    return (
      <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
        <p style={{ color: "var(--mute)" }}>Loading...</p>
      </main>
    );
  }

  if (!onboarded) {
    return <Onboarding onComplete={() => setOnboarded(true)} />;
  }

  return (
    <main style={{ padding: "48px 24px", maxWidth: 720, margin: "0 auto" }}>
      <Hero>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={() => setDrawerOpen(true)}
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
            Create/Import
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
            href="/github-import"
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
            GitHub Import
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

      {decks.length === 0 ? (
        <p style={{ color: "var(--mute)", textAlign: "center", padding: 48 }}>
          No decks yet. Click Create/Import to create one.
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
              tags={d.tags}
              isCurated={d.protected}
              seedKey={d.seedKey}
              onReview={handleReview}
              onDelete={handleDelete}
              onExport={handleExport}
              onReset={handleReset}
            />
          ))}
        </div>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Create/Import">
        <DeckManager decks={decks} onRefresh={load} />
      </Drawer>
    </main>
  );
}
