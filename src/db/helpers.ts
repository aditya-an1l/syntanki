import { db, type Deck, type Card, type Review } from "./schema";
import { emptyFSRSState } from "../scheduler/fsrs";

export async function createDeck(name: string, tags: string[] = []): Promise<number> {
  return db.decks.add({
    name,
    tags,
    retention: 0.9,
    createdAt: Date.now(),
  });
}

export async function getDecks(): Promise<Deck[]> {
  return db.decks.toArray();
}

export async function getDeck(id: number): Promise<Deck | undefined> {
  return db.decks.get(id);
}

export async function deleteDeck(id: number): Promise<void> {
  const deck = await db.decks.get(id);
  if (deck?.protected) {
    throw new Error("Curated decks cannot be deleted. Reset it instead.");
  }
  await db.transaction("rw", db.decks, db.cards, db.reviews, async () => {
    const cardIds = await db.cards.where("deckId").equals(id).primaryKeys();
    if (cardIds.length > 0) {
      await db.reviews.where("cardId").anyOf(cardIds).delete();
    }
    await db.cards.where("deckId").equals(id).delete();
    await db.decks.delete(id);
  });
}

export async function addCard(
  deckId: number,
  front: string,
  back: string,
  language: string,
  source: string
): Promise<number> {
  return db.cards.add({
    deckId,
    front,
    back,
    language,
    source,
    fsrs: emptyFSRSState(),
    createdAt: Date.now(),
  });
}

export async function addCardsBulk(
  deckId: number,
  cards: { front: string; back: string; language: string; source: string }[]
): Promise<number> {
  return db.cards.bulkAdd(
    cards.map((c) => ({
      deckId,
      front: c.front,
      back: c.back,
      language: c.language,
      source: c.source,
      fsrs: emptyFSRSState(),
      createdAt: Date.now(),
    }))
  );
}

export async function getDueCards(deckId: number): Promise<Card[]> {
  const now = Date.now();
  return db.cards
    .where("deckId")
    .equals(deckId)
    .filter((c) => c.fsrs.due <= now)
    .toArray();
}

export async function getAllCards(deckId: number): Promise<Card[]> {
  return db.cards.where("deckId").equals(deckId).toArray();
}

export async function updateCardFsrs(cardId: number, fsrs: Card["fsrs"]): Promise<void> {
  await db.cards.update(cardId, { fsrs });
}

export async function recordReview(cardId: number, grade: 1 | 2 | 3 | 4): Promise<void> {
  await db.reviews.add({
    cardId,
    grade,
    createdAt: Date.now(),
  });
}

export interface DeckExport {
  version: number;
  exportedAt: number;
  deck: {
    name: string;
    tags: string[];
    retention: number;
    createdAt: number;
    protected?: boolean;
    seedKey?: string;
  };
  cards: {
    deckId: number;
    front: string;
    back: string;
    language: string;
    source: string;
    fsrs: Card["fsrs"];
    createdAt: number;
    id?: number;
  }[];
  reviews: {
    cardId: number;
    grade: 1 | 2 | 3 | 4;
    createdAt: number;
  }[];
}

export async function exportDeck(deckId: number): Promise<string> {
  const deck = await getDeck(deckId);
  if (!deck) {
    throw new Error("Deck not found");
  }
  const cards = await getAllCards(deckId);
  const cardIds = cards.map((c) => c.id!).filter(Boolean) as number[];
  const reviews = await db.reviews.where("cardId").anyOf(cardIds).toArray();
  const data: DeckExport = {
    version: 1,
    exportedAt: Date.now(),
    deck: {
      name: deck.name,
      tags: deck.tags,
      retention: deck.retention,
      createdAt: deck.createdAt,
      protected: deck.protected,
      seedKey: deck.seedKey,
    },
    cards: cards.map((c) => ({
      deckId: c.deckId,
      front: c.front,
      back: c.back,
      language: c.language,
      source: c.source,
      fsrs: c.fsrs,
      createdAt: c.createdAt,
      id: c.id,
    })),
    reviews: reviews.map((r) => ({
      cardId: r.cardId,
      grade: r.grade,
      createdAt: r.createdAt,
    })),
  };
  return JSON.stringify(data, null, 2);
}

export async function importDeck(json: string): Promise<number> {
  let data: DeckExport;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error("Invalid JSON");
  }
  if (
    data.version !== 1 ||
    !data.deck ||
    !Array.isArray(data.cards)
  ) {
    throw new Error("Unsupported export format");
  }

  const deckId = await createDeck(data.deck.name, data.deck.tags ?? []);
  await db.decks.update(deckId, { retention: data.deck.retention ?? 0.9 });

  const oldCardIds = data.cards.map((c) => c.id).filter(Boolean) as number[];
  const newCardIds: number[] = [];
  for (const card of data.cards) {
    const cardId = await addCard(
      deckId,
      card.front,
      card.back,
      card.language,
      card.source
    );
    await db.cards.update(cardId, {
      fsrs: card.fsrs,
      createdAt: card.createdAt,
    });
    newCardIds.push(cardId);
  }

  if (data.reviews) {
    for (const review of data.reviews) {
      const oldIndex = oldCardIds.indexOf(review.cardId);
      if (oldIndex >= 0) {
        await db.reviews.add({
          cardId: newCardIds[oldIndex],
          grade: review.grade,
          createdAt: review.createdAt,
        });
      }
    }
  }

  return deckId;
}
