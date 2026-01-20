import { relations } from "drizzle-orm";
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { commentsTable } from "./comments-table";
import { likesTable } from "./likes-table";

export const memesTable = pgTable("memes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  tags: text("tags").array(),
  likesCount: integer("likes_count").notNull().default(0),
  commentsCount: integer("comments_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const memeRelations = relations(memesTable, ({ one, many }) => ({
  user: one(user, {
    fields: [memesTable.userId],
    references: [user.id],
  }),
  likes: many(likesTable),
  comments: many(commentsTable),
}));
