import { db } from "./index";
import {
  categoriesTable,
  commentsTable,
  likesTable,
  memesTable,
  memeTagsTable,
  tagsTable,
  user as userTable,
} from "./schemas";

async function main() {
  console.log("🧹 Reseteando base de datos completa...");

  try {
    // Borrar datos en orden para respetar FK constraints
    await db.delete(likesTable);
    console.log("Deleted likes");
    await db.delete(commentsTable);
    console.log("Deleted comments");
    await db.delete(memeTagsTable);
    console.log("Deleted memeTags");
    await db.delete(memesTable);
    console.log("Deleted memes");
    await db.delete(categoriesTable);
    console.log("Deleted categories");
    await db.delete(tagsTable);
    console.log("Deleted tags");
    await db.delete(userTable);
    console.log("Deleted users");

    console.log("✅ Base de datos limpia");
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

main()
  .then(async () => {
    // Si tienes acceso al client, ciérralo
    // await client.end(); // Para pg
    // O simplemente sal después de un timeout
    setTimeout(() => process.exit(0), 100);
  })
  .catch((e) => {
    console.error("❌ Error fatal:", e);
    setTimeout(() => process.exit(1), 100);
  });
