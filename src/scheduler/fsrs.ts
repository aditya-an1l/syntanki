import {
  fsrs,
  createEmptyCard,
  generatorParameters,
  Rating,
  formatDate,
} from "ts-fsrs";
import type { Card as FSRSCard, Grade as FSRSGrade } from "ts-fsrs";

export type Grade = FSRSGrade;

// Serializable FSRS card state stored in Dexie.
export interface FSRSState {
  due: number; // epoch ms
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: number; // State enum value
}

function toFSRSCard(s: FSRSState): FSRSCard {
  return {
    due: new Date(s.due),
    stability: s.stability,
    difficulty: s.difficulty,
    elapsed_days: s.elapsed_days,
    scheduled_days: s.scheduled_days,
    reps: s.reps,
    lapses: s.lapses,
    state: s.state as FSRSCard["state"],
  };
}

function fromFSRSCard(c: FSRSCard): FSRSState {
  return {
    due: c.due.getTime(),
    stability: c.stability,
    difficulty: c.difficulty,
    elapsed_days: c.elapsed_days,
    scheduled_days: c.scheduled_days,
    reps: c.reps,
    lapses: c.lapses,
    state: c.state,
  };
}

export function emptyFSRSState(): FSRSState {
  const card = createEmptyCard(new Date());
  return fromFSRSCard(card);
}

export function nextFSRSState(prev: FSRSState, grade: Grade): FSRSState {
  const f = fsrs(generatorParameters({ enable_fuzz: true }));
  const card = toFSRSCard(prev);
  const result = f.next(card, new Date(), grade);
  return fromFSRSCard(result.card);
}

export function formatDue(ts: number): string {
  return formatDate(new Date(ts));
}
