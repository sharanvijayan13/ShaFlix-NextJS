export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  release_date?: string;
  overview?: string;
  vote_average?: number;
  genre_ids?: number[];
  runtime?: number;
} 

export interface Credits {
  cast: {
    name: string;
    character: string;
    profile_path: string | null;
  }[];
  crew: {
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
  }[];
}

export interface Review {
  id: string;
  movieId: number;
  rating: number; // 0.5 to 5 stars
  text: string;
  tags: string[];
  hasSpoilers: boolean;
  createdAt: string;
  updatedAt: string;
  likes: number;
}

export interface DiaryEntry {
  id: string;
  movieId: number;
  watchedDate: string;
  rating?: number;
  review?: string;
  tags: string[];
  rewatch: boolean;
}

export interface CustomList {
  id: string;
  name: string;
  description: string;
  movieIds: number[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  username: string;
  handle: string;
  bio: string;
  avatarUrl: string;
  stats: {
    moviesWatched: number;
    diaryEntries: number;
    favorites: number;
    lists: number;
    hoursWatched: number;
  };
}
