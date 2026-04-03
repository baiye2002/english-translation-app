import { pgTable, serial, timestamp, text, integer, varchar, boolean, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const healthCheck = pgTable("health_check", {
  id: serial().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const questions = pgTable(
  "questions",
  {
    id: serial().primaryKey(),
    chineseSentence: text("chinese_sentence").notNull(),
    englishReference: text("english_reference").notNull(),
    difficulty: varchar("difficulty", { length: 20 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("questions_difficulty_idx").on(table.difficulty),
  ]
);

export const practiceSessions = pgTable(
  "practice_sessions",
  {
    id: serial().primaryKey(),
    difficulty: varchar("difficulty", { length: 20 }).notNull(),
    score: integer("score").notNull(),
    totalQuestions: integer("total_questions").notNull(),
    correctCount: integer("correct_count").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("practice_sessions_difficulty_idx").on(table.difficulty),
    index("practice_sessions_created_at_idx").on(table.createdAt),
  ]
);

export const practiceAnswers = pgTable(
  "practice_answers",
  {
    id: serial().primaryKey(),
    sessionId: integer("session_id").notNull().references(() => practiceSessions.id, { onDelete: "cascade" }),
    questionId: integer("question_id").notNull().references(() => questions.id),
    userAnswer: text("user_answer").notNull(),
    isCorrect: boolean("is_correct").notNull(),
    feedback: text("feedback").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("practice_answers_session_id_idx").on(table.sessionId),
    index("practice_answers_question_id_idx").on(table.questionId),
  ]
);

export const competitionRooms = pgTable(
  "competition_rooms",
  {
    id: serial().primaryKey(),
    playerCount: integer("player_count").notNull(),
    status: varchar("status", { length: 20 }).notNull(),
    winnerId: integer("winner_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("competition_rooms_status_idx").on(table.status),
  ]
);

export const competitionPlayers = pgTable(
  "competition_players",
  {
    id: serial().primaryKey(),
    roomId: integer("room_id").notNull().references(() => competitionRooms.id, { onDelete: "cascade" }),
    playerName: varchar("player_name", { length: 50 }).notNull(),
    avatarUrl: varchar("avatar_url", { length: 255 }).notNull(),
    difficulty: varchar("difficulty", { length: 20 }).notNull(),
    score: integer("score").notNull(),
    currentRound: integer("current_round").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("competition_players_room_id_idx").on(table.roomId),
  ]
);

export const competitionAnswers = pgTable(
  "competition_answers",
  {
    id: serial().primaryKey(),
    playerId: integer("player_id").notNull().references(() => competitionPlayers.id, { onDelete: "cascade" }),
    questionId: integer("question_id").notNull().references(() => questions.id),
    roundNumber: integer("round_number").notNull(),
    userAnswer: text("user_answer").notNull(),
    isCorrect: boolean("is_correct").notNull(),
    feedback: text("feedback").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("competition_answers_player_id_idx").on(table.playerId),
    index("competition_answers_round_number_idx").on(table.roundNumber),
  ]
);
