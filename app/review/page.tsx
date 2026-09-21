"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { codeToHtml } from "shiki";
import { getDueCards, updateCardFsrs, recordReview, getDeck } from "@/db/helpers";
import { nextFSRSState, formatDue, type Grade } from "@/scheduler/fsrs";
import type { Card } from "@/db/schema";

function ReviewInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deckId = searchParams.get("deck") ? Number(searchParams.get("deck")) : null;

  const [deckName, setDeckName] = useState("");
  const [queue, setQueue] = useState<Card[]>([]);
  const [current, setCurrent] = useState<Card | null>(null);
  const [answered, setAnswered] = useState(false);
  const [highlightedFront, setHighlightedFront] = useState("");
  const [highlightedBack, setHighlightedBack] = useState("");
  const [totalDue, setTotalDue] = useState(0);
  const [reviewed, setReviewed] = useState(0);

  const loadDeck = useCallback(async (id: number) => {
    const deck = await getDeck(id);
    if (deck) setDeckName(deck.name);
    const due = await getDueCards(id);
    setQueue(due);
    setTotalDue(due.length);
    setReviewed(0);
    if (due.length > 0) {
      setCurrent(due[0]);
      setAnswered(false);
    } else {
      setCurrent(null);
    }
  }, []);

  useEffect(() => {
    if (deckId) loadDeck(deckId);
  }, [deckId, loadDeck]);

  useEffect(() => {
    if (!current) return;
    const lang = current.language || "text";
    codeToHtml(current.front, { lang, theme: "vitesse-dark" })
      .then(setHighlightedFront)
      .catch(() => setHighlightedFront(`<pre>${current.front}</pre>`));
    codeToHtml(current.back, { lang, theme: "vitesse-dark" })
      .then(setHighlightedBack)
      .catch(() => setHighlightedBack(`<pre>${current.back}</pre>`));
  }, [current]);

  const handleGrade = async (grade: Grade) => {
    if (!current) return;
    const newFsrs = nextFSRSState(current.fsrs, grade);
    await updateCardFsrs(current.id!, newFsrs);
    await recordReview(current.id!, grade);

    const remaining = queue.slice(1);
    setQueue(remaining);
    setTotalDue(remaining.length);
    setReviewed((r) => r + 1);

    if (remaining.length > 0) {
      setCurrent(remaining[0]);
      setAnswered(false);
    } else {
      setCurrent(null);
    }
  };

  const handleExit = () => {
    if (confirm("Exit review? Progress on current card will be lost.")) {
      router.push("/");
    }
  };

  if (!deckId) {
    return (
      <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
        <h1 style={{ color: "var(--ink)" }}>Review</h1>
        <p style={{ color: "var(--mute)" }}>No deck selected. <a href="/">Go to decks</a></p>
      </main>
    );
  }

  if (!current) {
    return (
      <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
        <h1 style={{ color: "var(--ink)" }}>Review - {deckName}</h1>
        {totalDue === 0 && reviewed === 0 ? (
          <p style={{ color: "var(--mute)" }}>No cards due. Import some code first.</p>
        ) : (
          <p style={{ color: "var(--mute)" }}>Session complete. Reviewed {reviewed} cards.</p>
        )}
        <p><a href="/">Back to decks</a></p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <h1 style={{ color: "var(--ink)" }}>Review - {deckName}</h1>
        <button
          onClick={handleExit}
          style={{
            padding: "6px 12px",
            background: "var(--surface-soft)",
            color: "var(--body)",
            border: "1px solid var(--hairline)",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Exit Review
        </button>
      </div>
      <p style={{ color: "var(--mute)", marginBottom: 24 }}>
        Due: {totalDue} | Reviewed: {reviewed}
      </p>

      <div
        style={{
          border: "1px solid var(--hairline)",
          borderRadius: 6,
          padding: 24,
          marginBottom: 16,
          background: "var(--surface-card)",
        }}
      >
        {!answered ? (
          <>
            <div dangerouslySetInnerHTML={{ __html: highlightedFront }} />
            <button
              onClick={() => setAnswered(true)}
              style={{
                marginTop: 16,
                padding: "8px 24px",
                background: "var(--primary)",
                color: "var(--ink)",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 16,
                fontWeight: 500,
              }}
            >
              Show Answer
            </button>
          </>
        ) : (
          <>
            <div dangerouslySetInnerHTML={{ __html: highlightedFront }} />
            <hr
              style={{
                border: "none",
                borderTop: "1px solid var(--hairline)",
                margin: "16px 0",
              }}
            />
            <div dangerouslySetInnerHTML={{ __html: highlightedBack }} />
            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              {([1, 2, 3, 4] as Grade[]).map((g) => (
                <button
                  key={g}
                  onClick={() => handleGrade(g)}
                  style={{
                    padding: "8px 16px",
                    background: g === 1 ? "var(--primary-pressed)" : g === 2 ? "var(--surface-soft)" : "var(--surface-soft)",
                    color: "var(--ink)",
                    border: "1px solid var(--hairline)",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  {g === 1 ? "Again" : g === 2 ? "Hard" : g === 3 ? "Good" : "Easy"}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<main style={{ padding: 24 }}>Loading...</main>}>
      <ReviewInner />
    </Suspense>
  );
}
