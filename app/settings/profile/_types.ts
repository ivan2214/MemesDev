export type UserSettings =
  | {
      name: string;
      bio: string | null;
      imageKey: string;
      category: string | null;
      id: string;
      tags: { id: string; label: string }[] | null;
      socials:
        | {
            platform: string;
            url: string;
          }[]
        | null;
      image: string | null;
      email: string;
      emailVerified: boolean;
      createdAt: Date;
      updatedAt: Date;
    }
  | undefined;
