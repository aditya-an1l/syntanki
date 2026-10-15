import { db } from "./schema";
import { emptyFSRSState } from "../scheduler/fsrs";
import { CURATED_DECKS, type CuratedDeck } from "../data/curated-decks";

const SEED_FLAG = "curatedSeeded";

function toCards(deckId: number, deck: CuratedDeck) {
  const now = Date.now();
  return deck.cards.map((c) => ({
    deckId,
    front: c.front,
    back: c.back,
    language: c.language,
    source: c.source,
    fsrs: emptyFSRSState(),
    createdAt: now,
  }));
}

export async function seedCuratedDecks(): Promise<boolean> {
  const flag = await db.settings.get(SEED_FLAG);
  if (flag) return false;
  await db.transaction("rw", db.decks, db.cards, db.settings, async () => {
    const now = Date.now();
    for (const cd of CURATED_DECKS) {
      const existing = await db.decks.where("seedKey").equals(cd.key).first();
      if (existing) continue;
      const deckId = await db.decks.add({
        name: cd.name,
        tags: cd.tags,
        retention: cd.retention,
        createdAt: now,
        protected: true,
        seedKey: cd.key,
      });
      await db.cards.bulkAdd(toCards(deckId, cd));
    }
    await db.settings.put({ key: SEED_FLAG, value: String(now) });
  });
  return true;
}

export async function resetCuratedDeck(seedKey: string): Promise<void> {
  const deck = await db.decks.where("seedKey").equals(seedKey).first();
  const curated = CURATED_DECKS.find((d) => d.key === seedKey);
  if (!deck?.id || !curated) return;
  await db.transaction("rw", db.decks, db.cards, db.reviews, async () => {
    const cardIds = await db.cards.where("deckId").equals(deck.id!).primaryKeys();
    if (cardIds.length > 0) {
      await db.reviews.where("cardId").anyOf(cardIds).delete();
    }
    await db.cards.where("deckId").equals(deck.id!).delete();
    await db.cards.bulkAdd(toCards(deck.id!, curated));
  });
}
