import { db, type Deck, type Card } from "./schema";
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
  await db.transaction("rw", db.decks, db.cards, db.reviews, async () => {
    await db.cards.where("deckId").equals(id).delete();
    await db.reviews.where("cardId").between(0, Number.MAX_SAFE_INTEGER).delete();
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
