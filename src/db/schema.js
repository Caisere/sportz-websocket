import {foreignKey, integer, jsonb, pgEnum, pgTable, serial, text, timestamp} from 'drizzle-orm/pg-core';

export const matchStatusEnum = pgEnum('match_status', ['scheduled', 'live', 'finished'])

export const matches = pgTable('matches', {
    id: serial('id').primaryKey(),
    sport: text('sport').notNull(),
    homeTeam: text('home_team').notNull(),
    awayTeam: text('away_team').notNull(),
    status: matchStatusEnum('status').notNull().default('scheduled'),
    startTime: timestamp('start_time'),
    endTime: timestamp('end_time'),
    homeScore: integer('home_score').notNull().default('0'),
    awayScore: integer('away_score').notNull().default('0'),
    created_at: timestamp('created_at').notNull().defaultNow(),
})

export const commentaries = pgTable("commentaries", {
    id: serial().primaryKey().notNull(),
    matchId: integer("match_id").notNull(),
    minute: integer(),
    sequence: integer(),
    period: text(),
    eventType: text("event_type"),
    actor: text(),
    team: text(),
    message: text().notNull(),
    metadata: jsonb(),
    tags: text().array(),
    createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
    foreignKey({
        columns: [table.matchId],
        foreignColumns: [matches.id],
        name: "commentaries_match_id_matches_id_fk"
    }),
]);