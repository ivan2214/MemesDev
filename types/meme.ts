export interface Meme {
  id: string;
  imageUrl: string;
  tags?: string[] | null;
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
