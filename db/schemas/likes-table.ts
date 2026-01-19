import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { userTable } from "./auth-schema";
import { memesTable } from "./memes-table";

export const likesTable = pgTable("likes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  memeId: uuid("meme_id")
    .notNull()
    .references(() => memesTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const likeRelations = relations(likesTable, ({ one }) => ({
  user: one(userTable, {
    fields: [likesTable.userId],
    references: [userTable.id],
  }),
  meme: one(memesTable, {
    fields: [likesTable.memeId],
    references: [memesTable.id],
  }),
}));
