
export enum View {
  Home = 'home',
  Explainer = 'explainer',
  Compare = 'compare',
  Trends = 'trends',
  Detail = 'detail'
}

export interface MovieSearchResult {
  id: string;
  imdb_id: string;
  tmdb_id: string;
  title: string;
  year: number;
  type: 'movie' | 'show';
  poster: string;
  rating?: string;
  score?: number;
}

export interface MovieDetail extends MovieSearchResult {
  description: string;
  genres: string[];
  runtime: number;
  certification: string;
  ratings: {
    imdb?: string;
    rotten_tomatoes?: string;
    metacritic?: string;
    audience?: string;
  };
  cast: string[];
  trailer?: string;
}

export interface AIAnalysis {
  resonance: string;
  divisiveness: string;
  misunderstandings: string;
  legacy: string;
}

export interface ComparisonAnalysis {
  tone: string;
  storytelling: string;
  reception: string;
  context: string;
}

export interface TrendAnalysis {
  background: string;
  impact: string;
  whyNow: string;
}
