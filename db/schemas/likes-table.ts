import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { memesTable } from "./memes-table";

export const likesTable = pgTable("likes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  memeId: uuid("meme_id")
    .notNull()
    .references(() => memesTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const likeRelations = relations(likesTable, ({ one }) => ({
  user: one(user, {
    fields: [likesTable.userId],
    references: [user.id],
  }),
  meme: one(memesTable, {
    fields: [likesTable.memeId],
    references: [memesTable.id],
  }),
}));
