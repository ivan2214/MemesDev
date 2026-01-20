import { faker } from "@faker-js/faker";
import type { Table } from "drizzle-orm";
import "dotenv/config";
import { db } from "./index";
import {
  account,
  commentsTable,
  likesTable,
  memesTable,
  session,
  user,
  verification,
} from "./schemas";

const PROGRAMMING_TAGS = [
  "javascript",
  "typescript",
  "react",
  "nextjs",
  "nodejs",
  "python",
  "java",
  "cpp",
  "rust",
  "go",
  "html",
  "css",
  "tailwind",
  "git",
  "github",
  "vscode",
  "linux",
  "docker",
  "kubernetes",
  "aws",
  "database",
  "sql",
  "mongodb",
  "redis",
  "api",
  "rest",
  "graphql",
  "testing",
  "debugging",
  "stackoverflow",
  "hackerrank",
  "leetcode",
  "algorithms",
  "datastructures",
  "oop",
  "functional",
  "frontend",
  "backend",
  "fullstack",
  "devops",
  "agile",
  "scrum",
  "code-review",
  "pair-programming",
  "refactoring",
  "clean-code",
  "documentation",
  "bugs",
  "production",
  "deployment",
  "hotfix",
  "merge-conflict",
  "semicolon",
  "undefined",
  "null",
  "async",
  "callbacks",
  "promises",
];

const MEME_IMAGE_URLS = [
  "https://i.imgflip.com/1bij.jpg",
  "https://i.imgflip.com/30b1gx.jpg",
  "https://i.imgflip.com/1ur9b0.jpg",
  "https://i.imgflip.com/261o3j.jpg",
  "https://i.imgflip.com/1g8my4.jpg",
  "https://i.imgflip.com/24y43o.jpg",
  "https://i.imgflip.com/26am.jpg",
  "https://i.imgflip.com/1c1uej.jpg",
  "https://i.imgflip.com/4t0m5.jpg",
  "https://i.imgflip.com/22bdq6.jpg",
  "https://i.imgflip.com/1yxkcp.jpg",
  "https://i.imgflip.com/2ybua0.png",
  "https://i.imgflip.com/1o00in.jpg",
  "https://i.imgflip.com/1ihzfe.jpg",
  "https://i.imgflip.com/3lmzyx.png",
  "https://i.imgflip.com/2wifvo.jpg",
  "https://i.imgflip.com/9ehk.jpg",
  "https://i.imgflip.com/3qqcim.png",
  "https://i.imgflip.com/2fm6x.jpg",
  "https://i.imgflip.com/1bhw.jpg",
];

const COMMENT_TEMPLATES = [
  "This is so relatable! 😂",
  "Me every single day at work",
  "Why is this so accurate?",
  "I feel personally attacked",
  "This happened to me yesterday!",
  "Story of my life as a developer",
  "The accuracy hurts 💀",
  "I'm in this photo and I don't like it",
  "I laughed way too hard at this",
  "This is exactly what happened in our last sprint",
  "My code at 2am be like...",
  "This but unironically",
  "Too real, too real...",
  "Legend says the bug is still unfixed",
  "Senior developers hate this one trick",
  "When the tests pass on the first try 🤯",
  "Me debugging for 3 hours only to find a typo",
  "Classic.",
  "This is the way",
  "LGTM 👍",
  "Ship it!",
  "Works on my machine",
  "Have you tried turning it off and on again?",
  "Just add more RAM",
  "It's not a bug, it's a feature!",
  "Time to refactor... again",
  "The documentation said this would be easy",
  "Merge conflicts are the real enemy",
  "npm install && pray",
  "console.log('here')",
];

function getRandomTags(min = 2, max = 5): string[] {
  const count = faker.number.int({ min, max });
  const shuffled = [...PROGRAMMING_TAGS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function getRandomMemeUrl(): string {
  return faker.helpers.arrayElement(MEME_IMAGE_URLS);
}

function getRandomComment(): string {
  return faker.helpers.arrayElement(COMMENT_TEMPLATES);
}

// Función para insertar en lotes
async function batchInsert<T>(
  table: Table,
  data: T[],
  batchSize: number = 100,
): Promise<void> {
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    await db.insert(table).values(batch);
  }
}

async function seed() {
  performance.mark("seed-start");
  console.log("🌱 Starting seed...\n");

  // Clear existing data
  performance.mark("clear-start");
  console.log("🧹 Clearing existing data...");
  await Promise.all([
    db.delete(commentsTable),
    db.delete(likesTable),
    db.delete(memesTable),
    db.delete(verification),
    db.delete(account),
    db.delete(session),
    db.delete(user),
  ]);
  performance.mark("clear-end");
  performance.measure("clear-data", "clear-start", "clear-end");
  const clearDuration = performance.getEntriesByName("clear-data")[0].duration;
  console.log(
    `✅ Existing data cleared in ${(clearDuration / 1000).toFixed(2)}s\n`,
  );

  // Pre-generar todos los datos en memoria
  performance.mark("generate-start");
  console.log("📝 Generating data in memory...");

  // Crear usuarios en memoria
  const users = Array.from({ length: 15 }, () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    return {
      id: faker.string.uuid(),
      name: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      emailVerified: true,
      image: faker.image.avatar(),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: new Date(),
    };
  });

  const userIds = users.map((u) => u.id);

  // Crear memes en memoria
  const memes = Array.from({ length: 60 }, () => ({
    id: faker.string.uuid(),
    userId: faker.helpers.arrayElement(userIds),
    imageUrl: getRandomMemeUrl(),
    imageKey: faker.string.uuid(),
    tags: getRandomTags(),
    likesCount: 0,
    commentsCount: 0,
    createdAt: faker.date.past({ years: 1 }),
  }));

  const memeIds = memes.map((m) => m.id);

  // Crear likes en memoria
  const likePairs = new Set<string>();
  const likes = [];
  const likeCounts = new Map<string, number>();

  while (likes.length < 200) {
    const userId = faker.helpers.arrayElement(userIds);
    const memeId = faker.helpers.arrayElement(memeIds);
    const pairKey = `${userId}-${memeId}`;

    if (!likePairs.has(pairKey)) {
      likePairs.add(pairKey);
      likes.push({
        userId,
        memeId,
        createdAt: faker.date.past({ years: 1 }),
      });
      likeCounts.set(memeId, (likeCounts.get(memeId) || 0) + 1);
    }
  }

  // Crear comentarios en memoria
  const comments = Array.from({ length: 100 }, () => {
    const memeId = faker.helpers.arrayElement(memeIds);
    return {
      userId: faker.helpers.arrayElement(userIds),
      memeId,
      content: getRandomComment(),
      createdAt: faker.date.past({ years: 1 }),
    };
  });

  // Calcular counts
  const commentCounts = new Map<string, number>();
  comments.forEach((comment) => {
    commentCounts.set(
      comment.memeId,
      (commentCounts.get(comment.memeId) || 0) + 1,
    );
  });

  // Actualizar counts en los memes
  memes.forEach((meme) => {
    meme.likesCount = likeCounts.get(meme.id) || 0;
    meme.commentsCount = commentCounts.get(meme.id) || 0;
  });

  performance.mark("generate-end");
  performance.measure("generate-data", "generate-start", "generate-end");
  const generateDuration =
    performance.getEntriesByName("generate-data")[0].duration;
  console.log(
    `✅ Data generated in memory in ${(generateDuration / 1000).toFixed(2)}s\n`,
  );

  // Insertar todos los datos en lotes
  console.log("💾 Inserting data into database...");

  performance.mark("insert-start");

  performance.mark("insert-users-memes-start");
  await Promise.all([
    batchInsert(user, users, 100),
    batchInsert(memesTable, memes, 100),
  ]);
  performance.mark("insert-users-memes-end");
  performance.measure(
    "insert-users-memes",
    "insert-users-memes-start",
    "insert-users-memes-end",
  );
  const usersMemesDuration =
    performance.getEntriesByName("insert-users-memes")[0].duration;
  console.log(
    `  ⏱️  Users & Memes inserted in ${(usersMemesDuration / 1000).toFixed(2)}s`,
  );

  performance.mark("insert-likes-comments-start");
  await Promise.all([
    batchInsert(likesTable, likes, 100),
    batchInsert(commentsTable, comments, 100),
  ]);
  performance.mark("insert-likes-comments-end");
  performance.measure(
    "insert-likes-comments",
    "insert-likes-comments-start",
    "insert-likes-comments-end",
  );
  const likesCommentsDuration = performance.getEntriesByName(
    "insert-likes-comments",
  )[0].duration;
  console.log(
    `  ⏱️  Likes & Comments inserted in ${(likesCommentsDuration / 1000).toFixed(2)}s`,
  );

  performance.mark("insert-end");
  performance.measure("insert-all", "insert-start", "insert-end");
  const insertDuration = performance.getEntriesByName("insert-all")[0].duration;

  console.log(
    `✅ All data inserted in ${(insertDuration / 1000).toFixed(2)}s\n`,
  );

  performance.mark("seed-end");
  performance.measure("seed-total", "seed-start", "seed-end");
  const totalDuration = performance.getEntriesByName("seed-total")[0].duration;

  console.log("🎉 Seed completed successfully!");
  console.log(`
📊 Performance Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️  Clear existing data:  ${(clearDuration / 1000).toFixed(2)}s
⏱️  Generate in memory:   ${(generateDuration / 1000).toFixed(2)}s
⏱️  Insert to database:   ${(insertDuration / 1000).toFixed(2)}s
   ├─ Users & Memes:     ${(usersMemesDuration / 1000).toFixed(2)}s
   └─ Likes & Comments:  ${(likesCommentsDuration / 1000).toFixed(2)}s
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Total time:            ${(totalDuration / 1000).toFixed(2)}s

📦 Data Created:
   • Users:     ${users.length}
   • Memes:     ${memes.length}
   • Likes:     ${likes.length}
   • Comments:  ${comments.length}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);

  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
