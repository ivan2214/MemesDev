export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
}

export interface Meme {
  id: string;
  imageUrl: string;
  title?: string | null;
  category?: Category | null;
  tags?: Tag[] | null;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    image?: string | null;
  };
  isLiked?: boolean;
}
