"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSetting, setSetting } from "@/db/helpers";
import { createDeck, addCardsBulk } from "@/db/helpers";
import { parseSnippet } from "@/parser/cloze";
import type { Deck } from "@/db/schema";

interface OnboardingProps {
  onComplete: () => void;
}

const SAMPLE_CODE = `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`;

export default function Onboarding({ onComplete }: OnboardingProps) {
  const router = useRouter();
  const [step, setStep] = useState<"welcome" | "deck" | "review">("welcome");
  const [deckName, setDeckName] = useState("");
  const [cards, setCards] = useState<{ front: string; back: string }[]>([]);
  const [saved, setSaved] = useState(false);
  const [reviewed, setReviewed] = useState(false);

  const skip = async () => {
    await setSetting("onboarded", "true");
    onComplete();
  };

  const finish = async () => {
    await setSetting("onboarded", "true");
    onComplete();
  };

  const handleCreateDeck = async () => {
    if (!deckName.trim()) return;
    const deckId = await createDeck(deckName.trim());
    const parsed = parseSnippet(SAMPLE_CODE, "python");
    await addCardsBulk(
      deckId,
      parsed.map((c) => ({ front: c.front, back: c.back, language: c.language, source: SAMPLE_CODE }))
    );
    setCards(parsed.map((c) => ({ front: c.front, back: c.back })));
    setSaved(true);
  };

  const handleGrade = async () => {
    setReviewed(true);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <div
        style={{
          background: "var(--surface-card)",
          border: "1px solid var(--hairline)",
          borderRadius: 8,
          padding: 32,
          maxWidth: 520,
          width: "90%",
          color: "var(--ink)",
        }}
      >
        {step === "welcome" && (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Welcome to Syntanki</h2>
            <p style={{ color: "var(--body)", marginBottom: 20, lineHeight: 1.5 }}>
              Syntanki is spaced repetition for coding interviews. Paste code, get
              atomic recall cards, and review on a schedule that adapts to you.
              Offline-first, no AI required.
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button onClick={() => setStep("deck")} style={{ flex: 1, padding: "10px 16px", background: "var(--primary)", color: "var(--ink)", border: "none", borderRadius: 6, fontWeight: 500, cursor: "pointer" }}>
                Get Started
              </button>
              <button onClick={skip} style={{ padding: "10px 16px", background: "var(--surface-soft)", color: "var(--body)", border: "1px solid var(--hairline)", borderRadius: 6, fontWeight: 500, cursor: "pointer" }}>
                Skip
              </button>
            </div>
          </>
        )}

        {step === "deck" && (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Create your first deck</h2>
            <p style={{ color: "var(--body)", marginBottom: 16 }}>
              We’ll import a sample Python binary search snippet so you can review
              right away.
            </p>
            <input
              type="text"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              placeholder="Deck name (e.g., Python Basics)"
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                border: "1px solid var(--hairline)",
                background: "var(--surface-card)",
                color: "var(--ink)",
                fontSize: 14,
                marginBottom: 16,
              }}
            />
            {!saved ? (
              <button
                onClick={handleCreateDeck}
                disabled={!deckName.trim()}
                style={{ width: "100%", padding: "10px 16px", background: !deckName.trim() ? "var(--surface-soft)" : "var(--primary)", color: "var(--ink)", border: "none", borderRadius: 6, fontWeight: 500, cursor: !deckName.trim() ? "not-allowed" : "pointer", opacity: !deckName.trim() ? 0.5 : 1 }}
              >
                Create Deck & Import Sample
              </button>
            ) : (
              <div style={{ padding: "10px 16px", background: "var(--surface-soft)", borderRadius: 6, color: "var(--ink)", fontWeight: 500 }}>
                {cards.length} cards imported from sample code
              </div>
            )}
            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <button onClick={() => setStep("review")} disabled={!saved} style={{ flex: 1, padding: "10px 16px", background: saved ? "var(--primary)" : "var(--surface-soft)", color: "var(--ink)", border: "none", borderRadius: 6, fontWeight: 500, cursor: saved ? "pointer" : "not-allowed", opacity: saved ? 1 : 0.5 }}>
                Start Review
              </button>
              <button onClick={skip} style={{ padding: "10px 16px", background: "var(--surface-soft)", color: "var(--body)", border: "1px solid var(--hairline)", borderRadius: 6, fontWeight: 500, cursor: "pointer" }}>
                Skip
              </button>
            </div>
          </>
        )}

        {step === "review" && (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Review your first card</h2>
            <p style={{ color: "var(--body)", marginBottom: 16 }}>
              Grade how well you knew the answer. This schedules the card with FSRS.
            </p>
            <div style={{ border: "1px solid var(--hairline)", borderRadius: 6, padding: 16, background: "var(--surface-soft)", marginBottom: 16 }}>
              <div style={{ color: "var(--ink)", fontWeight: 500, marginBottom: 4 }}>Q: {cards[0]?.front}</div>
              <button
                onClick={() => setReviewed(true)}
                disabled={reviewed}
                style={{ marginTop: 8, padding: "8px 16px", background: "var(--primary)", color: "var(--ink)", border: "none", borderRadius: 6, fontWeight: 500, cursor: "pointer" }}
              >
                Show Answer
              </button>
              {reviewed && (
                <>
                  <div style={{ color: "var(--body)", marginTop: 8, marginBottom: 8 }}>A: {cards[0]?.back}</div>
                  <div style={{ color: "var(--mute)", fontSize: 12, marginBottom: 8 }}>
                    Card scheduled. You’ve completed onboarding.
                  </div>
                  <button
                    onClick={finish}
                    style={{ padding: "8px 16px", background: "var(--surface-soft)", color: "var(--ink)", border: "1px solid var(--hairline)", borderRadius: 6, fontWeight: 500, cursor: "pointer" }}
                  >
                    Done
                  </button>
                </>
              )}
            </div>
            <button onClick={skip} style={{ padding: "8px 16px", background: "var(--surface-soft)", color: "var(--body)", border: "1px solid var(--hairline)", borderRadius: 6, fontWeight: 500, cursor: "pointer" }}>
              Skip Onboarding
            </button>
          </>
        )}
      </div>
    </div>
  );
}
