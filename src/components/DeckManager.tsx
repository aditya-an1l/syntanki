"use client";

import { useState } from "react";
import { createDeck, deleteDeck } from "@/db/helpers";
import type { Deck } from "@/db/schema";

interface DeckManagerProps {
  decks: Deck[];
  onRefresh: () => void;
}

export default function DeckManager({ decks, onRefresh }: DeckManagerProps) {
  const [newName, setNewName] = useState("");
  const [newTags, setNewTags] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editTags, setEditTags] = useState("");

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const tags = newTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    await createDeck(newName.trim(), tags);
    setNewName("");
    setNewTags("");
    onRefresh();
  };

  const handleRename = async (id: number) => {
    if (!editName.trim()) return;
    const { db } = await import("@/db/schema");
    await db.decks.update(id, { name: editName.trim() });
    setEditingId(null);
    onRefresh();
  };

  const handleUpdateTags = async (id: number, tags: string[]) => {
    const { db } = await import("@/db/schema");
    await db.decks.update(id, { tags });
    onRefresh();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this deck and all its cards?")) return;
    await deleteDeck(id);
    onRefresh();
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>
          Create New Deck
        </h3>
        <input
          type="text"
          placeholder="Deck name..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          style={{
            width: "100%",
            padding: 8,
            borderRadius: 6,
            border: "1px solid var(--hairline)",
            background: "var(--surface-card)",
            color: "var(--ink)",
            marginBottom: 8,
          }}
        />
        <input
          type="text"
          placeholder="Tags (comma-separated)..."
          value={newTags}
          onChange={(e) => setNewTags(e.target.value)}
          style={{
            width: "100%",
            padding: 8,
            borderRadius: 6,
            border: "1px solid var(--hairline)",
            background: "var(--surface-card)",
            color: "var(--ink)",
            marginBottom: 8,
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
          Create Deck
        </button>
      </div>

      <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>
        Existing Decks
      </h3>
      {decks.length === 0 ? (
        <p style={{ color: "var(--mute)", fontSize: 14 }}>No decks yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {decks.map((deck) => (
            <div
              key={deck.id}
              style={{
                background: "var(--surface-card)",
                border: "1px solid var(--hairline)",
                borderRadius: 6,
                padding: 12,
              }}
            >
              {editingId === deck.id ? (
                <div>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRename(deck.id!)}
                    style={{
                      width: "100%",
                      padding: 6,
                      borderRadius: 4,
                      border: "1px solid var(--hairline)",
                      background: "var(--surface-card)",
                      color: "var(--ink)",
                      marginBottom: 4,
                    }}
                  />
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    placeholder="Tags (comma-separated)..."
                    style={{
                      width: "100%",
                      padding: 6,
                      borderRadius: 4,
                      border: "1px solid var(--hairline)",
                      background: "var(--surface-card)",
                      color: "var(--ink)",
                      marginBottom: 4,
                    }}
                  />
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      onClick={() => {
                        const tags = editTags
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean);
                        handleRename(deck.id!);
                        handleUpdateTags(deck.id!, tags);
                      }}
                      style={{
                        padding: "4px 8px",
                        background: "var(--primary)",
                        color: "var(--ink)",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      style={{
                        padding: "4px 8px",
                        background: "var(--surface-soft)",
                        color: "var(--body)",
                        border: "1px solid var(--hairline)",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--ink)",
                      marginBottom: 4,
                    }}
                  >
                    {deck.name}
                  </div>
                  {deck.tags && deck.tags.length > 0 && (
                    <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
                      {deck.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            fontSize: 11,
                            padding: "2px 6px",
                            background: "var(--surface-soft)",
                            border: "1px solid var(--hairline)",
                            borderRadius: 9999,
                            color: "var(--mute)",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      onClick={() => {
                        setEditingId(deck.id!);
                        setEditName(deck.name);
                        setEditTags(deck.tags?.join(", ") || "");
                      }}
                      style={{
                        padding: "4px 8px",
                        background: "var(--surface-soft)",
                        color: "var(--body)",
                        border: "1px solid var(--hairline)",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(deck.id!)}
                      style={{
                        padding: "4px 8px",
                        background: "none",
                        color: "var(--ash)",
                        border: "1px solid var(--hairline)",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
