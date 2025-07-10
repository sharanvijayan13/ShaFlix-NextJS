export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  release_date?: string;
  overview?: string;
  vote_average?: number;
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
