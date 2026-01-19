import { sql } from "drizzle-orm";
import { db } from "./index";

async function main() {
  console.log("🧹 Reseteando base de datos completa...");

  try {
    await db.execute(sql`DROP SCHEMA public CASCADE`);
    await db.execute(sql`CREATE SCHEMA public`);
    await db.execute(sql`GRANT ALL ON SCHEMA public TO public`);

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
