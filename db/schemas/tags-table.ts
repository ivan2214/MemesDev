import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
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
    .references(() => tagsTable.id, { onDelete: "cascade" }),
});

// Relaciones
export const tagsRelations = relations(tagsTable, ({ many }) => ({
  memes: many(memeTagsTable),
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
