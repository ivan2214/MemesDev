import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { memesTable } from "./memes-table";

// Tabla de Categorías únicas
export const categoriesTable = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull().default("Hash"), // Nombre del icono de Lucide
  color: text("color").notNull().default("slate"), // Color base para estilos
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relaciones
export const categoriesRelations = relations(categoriesTable, ({ many }) => ({
  memes: many(memesTable),
}));
