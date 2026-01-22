import { faker } from "@faker-js/faker";
import type { Table } from "drizzle-orm";
import "dotenv/config";
import { DEFAULT_CATEGORIES, DEFAULT_TAGS } from "@/shared/lib/tag-icons";
import { db } from "./index";
import {
  account,
  categoriesTable,
  commentsTable,
  likesTable,
  memesTable,
  memeTagsTable,
  notificationTable,
  session,
  tagsTable,
  user,
  userTagsTable,
  verification,
} from "./schemas";

// Títulos de memes de programación
const MEME_TITLES = [
  "When the code works on the first try",
  "Me explaining my code to the rubber duck",
  "Senior dev reviewing my PR",
  "When you find the bug after 3 hours",
  "The classic 'it works on my machine'",
  "When the intern pushes to main",
  "Debugging at 3am be like",
  "When Stack Overflow is down",
  "Me pretending to understand the legacy code",
  "When the tests pass but you don't know why",
  "Frontend vs Backend developers",
  "When you forget a semicolon",
  "JavaScript developers be like",
  "When the client changes requirements",
  "Me after fixing one bug and creating three more",
  "The documentation vs reality",
  "When you finally understand recursion",
  "Copy-pasting from Stack Overflow",
  "When git says 'merge conflict'",
  "Monday morning standups",
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

const NOTIFICATION_MESSAGES = {
  like: [
    "liked your meme",
    "appreciated your meme",
    "gave a like to your meme",
  ],
  comment: [
    "commented on your meme",
    "left a comment on your meme",
    "replied to your meme",
  ],
  follow: ["started following you", "is now following you", "followed you"],
  system: [
    "Welcome to MemesDev! Start sharing your programming memes 🚀",
    "Your account has been verified successfully ✅",
    "Check out the trending memes this week!",
    "You've reached 10 likes on your memes! Keep it up! 🎉",
  ],
};

function getRandomMemeUrl(): string {
  return faker.helpers.arrayElement(MEME_IMAGE_URLS);
}

function getRandomTitle(): string {
  return faker.helpers.arrayElement(MEME_TITLES);
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
    db.delete(memeTagsTable),
    db.delete(userTagsTable),
    db.delete(notificationTable),
    db.delete(memesTable),
    db.delete(tagsTable),
    db.delete(categoriesTable),
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

  // Crear categorías con IDs fijos
  const categories = DEFAULT_CATEGORIES.map((cat) => ({
    id: faker.string.uuid(),
    name: cat.name,
    slug: cat.slug,
    icon: cat.icon,
    color: cat.color,
    createdAt: new Date(),
  }));

  const categoryIds = categories.map((c) => c.id);

  // Crear tags con IDs fijos
  const tags = DEFAULT_TAGS.map((tag) => ({
    id: faker.string.uuid(),
    name: tag.name,
    slug: tag.slug,
    createdAt: new Date(),
  }));

  // Agregar más tags
  const additionalTags = [
    { name: "Vue", slug: "vue" },
    { name: "Angular", slug: "angular" },
    { name: "Next.js", slug: "nextjs" },
    { name: "Tailwind", slug: "tailwind" },
    { name: "Linux", slug: "linux" },
    { name: "VS Code", slug: "vscode" },
    { name: "MongoDB", slug: "mongodb" },
    { name: "Redis", slug: "redis" },
    { name: "GraphQL", slug: "graphql" },
    { name: "Testing", slug: "testing" },
    { name: "Stack Overflow", slug: "stackoverflow" },
    { name: "Algorithms", slug: "algorithms" },
    { name: "Clean Code", slug: "clean-code" },
    { name: "Bugs", slug: "bugs" },
    { name: "Deployment", slug: "deployment" },
  ].map((tag) => ({
    id: faker.string.uuid(),
    name: tag.name,
    slug: tag.slug,
    createdAt: new Date(),
  }));

  const allTags = [...tags, ...additionalTags];
  const tagIds = allTags.map((t) => t.id);

  // Crear usuarios en memoria con usernames únicos
  const usedUsernames = new Set<string>();
  const users = Array.from({ length: 15 }, () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    // Generar username único
    const baseUsername =
      `${firstName.toLowerCase()}${lastName.toLowerCase()}`.replace(
        /[^a-z0-9]/g,
        "",
      );
    let username = baseUsername;
    let counter = 1;
    while (usedUsernames.has(username)) {
      username = `${baseUsername}${counter}`;
      counter++;
    }
    usedUsernames.add(username);

    return {
      id: faker.string.uuid(),
      name: `${firstName} ${lastName}`,
      username,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      emailVerified: true,
      image: faker.image.avatar(),
      imageKey: faker.string.uuid(),
      bio: faker.lorem.sentence(),
      socials: [
        {
          platform: "Twitter",
          url: `https://twitter.com/${username}`,
        },
        {
          platform: "GitHub",
          url: `https://github.com/${username}`,
        },
      ],
      categoryId: faker.helpers.arrayElement(categoryIds),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: new Date(),
    };
  });

  const userIds = users.map((u) => u.id);

  // Crear memes en memoria (ahora con categoryId y title)
  const memes = Array.from({ length: 60 }, () => ({
    id: faker.string.uuid(),
    userId: faker.helpers.arrayElement(userIds),
    imageUrl: getRandomMemeUrl(),
    imageKey: faker.string.uuid(),
    title: faker.datatype.boolean(0.8) ? getRandomTitle() : null, // 80% tienen título
    categoryId: faker.helpers.arrayElement(categoryIds),
    likesCount: 0,
    commentsCount: 0,
    createdAt: faker.date.past({ years: 1 }),
  }));

  const memeIds = memes.map((m) => m.id);

  // Crear relaciones meme-tags (2-5 tags por meme)
  const memeTagsSet = new Set<string>();
  const memeTags: { id: string; memeId: string; tagId: string }[] = [];

  for (const meme of memes) {
    const numTags = faker.number.int({ min: 2, max: 5 });
    const selectedTagIds = faker.helpers.arrayElements(tagIds, numTags);

    for (const tagId of selectedTagIds) {
      const pairKey = `${meme.id}-${tagId}`;
      if (!memeTagsSet.has(pairKey)) {
        memeTagsSet.add(pairKey);
        memeTags.push({
          id: faker.string.uuid(),
          memeId: meme.id,
          tagId,
        });
      }
    }
  }

  // Crear relaciones user-tags (1-3 tags por usuario)
  const userTagsSet = new Set<string>();
  const userTags: { id: string; userId: string; tagId: string }[] = [];

  for (const user of users) {
    const numTags = faker.number.int({ min: 1, max: 3 });
    const selectedTagIds = faker.helpers.arrayElements(tagIds, numTags);

    for (const tagId of selectedTagIds) {
      const pairKey = `${user.id}-${tagId}`;
      if (!userTagsSet.has(pairKey)) {
        userTagsSet.add(pairKey);
        userTags.push({
          id: faker.string.uuid(),
          userId: user.id,
          tagId,
        });
      }
    }
  }

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

  // Crear notificaciones en memoria
  type NotificationType = "like" | "comment" | "follow" | "system";
  const notifications: {
    id: string;
    userId: string;
    type: NotificationType;
    message: string;
    read: boolean;
    link: string | null;
    from: string;
    createdAt: Date;
    updatedAt: Date;
  }[] = [];

  // Notificaciones de sistema para todos los usuarios
  for (const u of users) {
    notifications.push({
      id: faker.string.uuid(),
      userId: u.id,
      type: "system",
      message: faker.helpers.arrayElement(NOTIFICATION_MESSAGES.system),
      read: faker.datatype.boolean(),
      link: null,
      from: "system",
      createdAt: u.createdAt,
      updatedAt: new Date(),
    });
  }

  // Notificaciones de likes (basadas en los likes creados)
  for (const like of likes.slice(0, 50)) {
    // Encontrar el dueño del meme
    const meme = memes.find((m) => m.id === like.memeId);
    if (meme && meme.userId !== like.userId) {
      const liker = users.find((u) => u.id === like.userId);
      notifications.push({
        id: faker.string.uuid(),
        userId: meme.userId,
        type: "like",
        message: `${liker?.name || "Someone"} ${faker.helpers.arrayElement(NOTIFICATION_MESSAGES.like)}`,
        read: faker.datatype.boolean(),
        link: `/meme/${meme.id}`,
        from: like.userId,
        createdAt: like.createdAt,
        updatedAt: new Date(),
      });
    }
  }

  // Notificaciones de comentarios (basadas en los comentarios creados)
  for (const comment of comments.slice(0, 40)) {
    const meme = memes.find((m) => m.id === comment.memeId);
    if (meme && meme.userId !== comment.userId) {
      const commenter = users.find((u) => u.id === comment.userId);
      notifications.push({
        id: faker.string.uuid(),
        userId: meme.userId,
        type: "comment",
        message: `${commenter?.name || "Someone"} ${faker.helpers.arrayElement(NOTIFICATION_MESSAGES.comment)}`,
        read: faker.datatype.boolean(),
        link: `/meme/${meme.id}`,
        from: comment.userId,
        createdAt: comment.createdAt,
        updatedAt: new Date(),
      });
    }
  }

  // Notificaciones de follows aleatorias
  const followPairs = new Set<string>();
  for (let i = 0; i < 30; i++) {
    const follower = faker.helpers.arrayElement(users);
    const followed = faker.helpers.arrayElement(users);
    const pairKey = `${follower.id}-${followed.id}`;

    if (follower.id !== followed.id && !followPairs.has(pairKey)) {
      followPairs.add(pairKey);
      notifications.push({
        id: faker.string.uuid(),
        userId: followed.id,
        type: "follow",
        message: `${follower.name} ${faker.helpers.arrayElement(NOTIFICATION_MESSAGES.follow)}`,
        read: faker.datatype.boolean(),
        link: `/profile/${follower.username}`,
        from: follower.id,
        createdAt: faker.date.past({ years: 1 }),
        updatedAt: new Date(),
      });
    }
  }

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

  // Primero insertar categorías y tags (independientes)
  performance.mark("insert-categories-tags-start");
  await Promise.all([
    batchInsert(categoriesTable, categories, 100),
    batchInsert(tagsTable, allTags, 100),
  ]);
  performance.mark("insert-categories-tags-end");
  performance.measure(
    "insert-categories-tags",
    "insert-categories-tags-start",
    "insert-categories-tags-end",
  );
  const categoriesTagsDuration = performance.getEntriesByName(
    "insert-categories-tags",
  )[0].duration;
  console.log(
    `  ⏱️  Categories & Tags inserted in ${(categoriesTagsDuration / 1000).toFixed(2)}s`,
  );

  // Luego insertar usuarios (dependen de categorias)
  performance.mark("insert-users-start");
  await batchInsert(user, users, 100);
  performance.mark("insert-users-end");
  performance.measure("insert-users", "insert-users-start", "insert-users-end");
  const usersDuration =
    performance.getEntriesByName("insert-users")[0].duration;
  console.log(`  ⏱️  Users inserted in ${(usersDuration / 1000).toFixed(2)}s`);

  // Luego insertar memes (dependen de users y categories)
  performance.mark("insert-memes-start");
  await batchInsert(memesTable, memes, 100);
  performance.mark("insert-memes-end");
  performance.measure("insert-memes", "insert-memes-start", "insert-memes-end");
  const memesDuration =
    performance.getEntriesByName("insert-memes")[0].duration;
  console.log(`  ⏱️  Memes inserted in ${(memesDuration / 1000).toFixed(2)}s`);

  // Finalmente insertar relaciones y contenido
  performance.mark("insert-relations-start");
  await Promise.all([
    batchInsert(memeTagsTable, memeTags, 100),
    batchInsert(userTagsTable, userTags, 100),
    batchInsert(likesTable, likes, 100),
    batchInsert(commentsTable, comments, 100),
    batchInsert(notificationTable, notifications, 100),
  ]);
  performance.mark("insert-relations-end");
  performance.measure(
    "insert-relations",
    "insert-relations-start",
    "insert-relations-end",
  );
  const relationsDuration =
    performance.getEntriesByName("insert-relations")[0].duration;
  console.log(
    `  ⏱️  MemeTags, Likes, Comments & Notifications inserted in ${(relationsDuration / 1000).toFixed(2)}s`,
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
   ├─ Categories/Tags/Users: ${(categoriesTagsDuration / 1000).toFixed(2)}s
   ├─ Memes:              ${(memesDuration / 1000).toFixed(2)}s
   └─ Relations:          ${(relationsDuration / 1000).toFixed(2)}s
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Total time:            ${(totalDuration / 1000).toFixed(2)}s

📦 Data Created:
   • Categories: ${categories.length}
   • Tags:       ${allTags.length}
   • Users:      ${users.length}
   • Memes:      ${memes.length}
   • MemeTags:   ${memeTags.length}
   • Likes:      ${likes.length}
   • Comments:   ${comments.length}
   • Notifications: ${notifications.length}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);

  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
