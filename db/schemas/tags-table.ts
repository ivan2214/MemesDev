import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { memesTable } from "./memes-table";

// Tabla de Tags únicos
export const tagsTable = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Tabla de relación Memes <-> Tags (muchos a muchos)
export const memeTagsTable = pgTable("meme_tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  memeId: uuid("meme_id")
    .notNull()
    .references(() => memesTable.id, { onDelete: "cascade" }),
  tagId: uuid("tag_id")
    .notNull()
    .notNull()
    .references(() => tagsTable.id, { onDelete: "cascade" }),
});

// Tabla de relación User <-> Tags (muchos a muchos)
export const userTagsTable = pgTable("user_tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  tagId: uuid("tag_id")
    .notNull()
    .references(() => tagsTable.id, { onDelete: "cascade" }),
});

// Relaciones
export const tagsRelations = relations(tagsTable, ({ many }) => ({
  memes: many(memeTagsTable),
  users: many(userTagsTable),
}));

export const memeTagsRelations = relations(memeTagsTable, ({ one }) => ({
  meme: one(memesTable, {
    fields: [memeTagsTable.memeId],
    references: [memesTable.id],
  }),
  tag: one(tagsTable, {
    fields: [memeTagsTable.tagId],
    references: [tagsTable.id],
  }),
}));

export const userTagsRelations = relations(userTagsTable, ({ one }) => ({
  user: one(user, {
    fields: [userTagsTable.userId],
    references: [user.id],
  }),
  tag: one(tagsTable, {
    fields: [userTagsTable.tagId],
    references: [tagsTable.id],
  }),
}));
