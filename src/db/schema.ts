import Dexie, { type Table } from "dexie";
import type { FSRSState } from "../scheduler/fsrs";

export interface Deck {
  id?: number;
  name: string;
  tags: string[];
  retention: number; // FSRS requested retention, e.g. 0.9
  createdAt: number;
  protected?: boolean; // curated deck: cannot be deleted, only reset
  seedKey?: string; // identifies a curated deck for seeding/reset
}

export interface Card {
  id?: number;
  deckId: number;
  front: string; // question with cloze blank
  back: string; // answer
  language: string;
  source: string; // pasted snippet ref or URL
  fsrs: FSRSState;
  createdAt: number;
}

export interface Review {
  id?: number;
  cardId: number;
  grade: 1 | 2 | 3 | 4;
  createdAt: number;
}

export interface Setting {
  key: string;
  value: string;
}

class SyntankiDB extends Dexie {
  decks!: Table<Deck, number>;
  cards!: Table<Card, number>;
  reviews!: Table<Review, number>;
  settings!: Table<Setting, string>;

  constructor() {
    super("syntanki");
    this.version(1).stores({
      decks: "++id, name",
      cards: "++id, deckId, [deckId+due]",
      reviews: "++id, cardId, createdAt",
      settings: "key",
    });
    this.version(2).stores({
      decks: "++id, name, seedKey",
      cards: "++id, deckId, [deckId+due]",
      reviews: "++id, cardId, createdAt",
      settings: "key",
    });
  }
}

export const db = new SyntankiDB();
