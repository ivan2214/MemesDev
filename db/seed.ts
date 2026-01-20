import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";
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

async function seed() {
  console.log("🌱 Starting seed...\n");

  // Clear existing data
  console.log("🧹 Clearing existing data...");
  await db.delete(commentsTable);
  await db.delete(likesTable);
  await db.delete(memesTable);
  await db.delete(verification);
  await db.delete(account);
  await db.delete(session);
  await db.delete(user);
  console.log("✅ Existing data cleared\n");

  // Create users
  console.log("👥 Creating users...");
  const userIds: string[] = [];

  for (let i = 0; i < 15; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const userId = faker.string.uuid();

    await db.insert(user).values({
      id: userId,
      name: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      emailVerified: true,
      image: faker.image.avatar(),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: new Date(),
    });

    userIds.push(userId);
  }
  console.log(`✅ Created ${userIds.length} users\n`);

  // Create memes with tracking for counts
  console.log("🖼️  Creating memes...");
  const memeData: { id: string; likesCount: number; commentsCount: number }[] =
    [];

  for (let i = 0; i < 60; i++) {
    const randomUserId = faker.helpers.arrayElement(userIds);
    const memeId = faker.string.uuid();
    const tags = getRandomTags();

    await db.insert(memesTable).values({
      id: memeId,
      userId: randomUserId,
      imageUrl: getRandomMemeUrl(),
      tags: tags,
      likesCount: 0,
      commentsCount: 0,
      createdAt: faker.date.past({ years: 1 }),
    });

    memeData.push({ id: memeId, likesCount: 0, commentsCount: 0 });
  }
  console.log(`✅ Created ${memeData.length} memes\n`);

  // Create likes
  console.log("❤️  Creating likes...");
  let likeCount = 0;
  const likePairs = new Set<string>();

  for (let i = 0; i < 200; i++) {
    const randomUserId = faker.helpers.arrayElement(userIds);
    const randomMemeIndex = faker.number.int({
      min: 0,
      max: memeData.length - 1,
    });
    const randomMeme = memeData[randomMemeIndex];
    const pairKey = `${randomUserId}-${randomMeme.id}`;

    // Avoid duplicate likes
    if (likePairs.has(pairKey)) continue;
    likePairs.add(pairKey);

    await db.insert(likesTable).values({
      userId: randomUserId,
      memeId: randomMeme.id,
      createdAt: faker.date.past({ years: 1 }),
    });

    // Track count locally
    randomMeme.likesCount++;
    likeCount++;
  }
  console.log(`✅ Created ${likeCount} likes\n`);

  // Create comments
  console.log("💬 Creating comments...");
  let commentCount = 0;

  for (let i = 0; i < 100; i++) {
    const randomUserId = faker.helpers.arrayElement(userIds);
    const randomMemeIndex = faker.number.int({
      min: 0,
      max: memeData.length - 1,
    });
    const randomMeme = memeData[randomMemeIndex];

    await db.insert(commentsTable).values({
      userId: randomUserId,
      memeId: randomMeme.id,
      content: getRandomComment(),
      createdAt: faker.date.past({ years: 1 }),
    });

    // Track count locally
    randomMeme.commentsCount++;
    commentCount++;
  }
  console.log(`✅ Created ${commentCount} comments\n`);

  // Update meme counts
  console.log("📊 Updating meme counts...");
  for (const meme of memeData) {
    await db
      .update(memesTable)
      .set({
        likesCount: meme.likesCount,
        commentsCount: meme.commentsCount,
      })
      .where(eq(memesTable.id, meme.id));
  }
  console.log("✅ Meme counts updated\n");

  console.log("🎉 Seed completed successfully!");
  console.log(`
Summary:
- Users: ${userIds.length}
- Memes: ${memeData.length}
- Likes: ${likeCount}
- Comments: ${commentCount}
  `);

  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
