import { relations } from "drizzle-orm";
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { categoriesTable } from "./categories-table";
import { commentsTable } from "./comments-table";
import { likesTable } from "./likes-table";
import { memeTagsTable } from "./tags-table";

export const memesTable = pgTable("memes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  imageKey: text("image_key").notNull(),
  title: text("title"),
  categoryId: uuid("category_id").references(() => categoriesTable.id, {
    onDelete: "set null",
  }),
  likesCount: integer("likes_count").notNull().default(0),
  commentsCount: integer("comments_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const memeRelations = relations(memesTable, ({ one, many }) => ({
  user: one(user, {
    fields: [memesTable.userId],
    references: [user.id],
  }),
  category: one(categoriesTable, {
    fields: [memesTable.categoryId],
    references: [categoriesTable.id],
  }),
  likes: many(likesTable),
  comments: many(commentsTable),
  tags: many(memeTagsTable),
}));
