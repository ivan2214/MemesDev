import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { memesTable } from "./memes-table";

export const commentsTable = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  memeId: uuid("meme_id")
    .notNull()
    .references(() => memesTable.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const commentRelations = relations(commentsTable, ({ one }) => ({
  user: one(user, {
    fields: [commentsTable.userId],
    references: [user.id],
  }),
  meme: one(memesTable, {
    fields: [commentsTable.memeId],
    references: [memesTable.id],
  }),
}));
