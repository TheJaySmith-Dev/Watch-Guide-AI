
import { MovieSearchResult, MovieDetail } from '../types';

const API_KEY = 'mi46uequ1wi40i8fxp4789jxz';
const BASE_URL = 'https://api.mdblist.com';

export const searchTitles = async (query: string): Promise<MovieSearchResult[]> => {
  if (!query) return [];
  try {
    const response = await fetch(`${BASE_URL}/?apikey=${API_KEY}&s=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    if (data.search) {
      return data.search.map((item: any) => ({
        id: item.id,
        imdb_id: item.imdbid,
        tmdb_id: item.tmdbid,
        title: item.title,
        year: item.year,
        type: item.type === 'movie' ? 'movie' : 'show',
        poster: item.poster || 'https://picsum.photos/300/450',
        score: item.score
      }));
    }
    return [];
  } catch (error) {
    console.error('MDBList Search Error:', error);
    return [];
  }
};

export const getTitleDetails = async (id: string): Promise<MovieDetail | null> => {
  try {
    const response = await fetch(`${BASE_URL}/?apikey=${API_KEY}&i=${id}`);
    const item = await response.json();

    if (item && item.id) {
      return {
        id: item.id,
        imdb_id: item.imdbid,
        tmdb_id: item.tmdbid,
        title: item.title,
        year: item.year,
        type: item.type === 'movie' ? 'movie' : 'show',
        poster: item.poster || 'https://picsum.photos/300/450',
        description: item.description,
        genres: item.genres || [],
        runtime: item.runtime,
        certification: item.certification,
        ratings: {
          imdb: item.ratings?.find((r: any) => r.source === 'imdb')?.value,
          rotten_tomatoes: item.ratings?.find((r: any) => r.source === 'tomatoes')?.value,
          metacritic: item.ratings?.find((r: any) => r.source === 'metacritic')?.value,
        },
        cast: item.cast || [],
        score: item.score,
        trailer: item.trailer
      };
    }
    return null;
  } catch (error) {
    console.error('MDBList Detail Error:', error);
    return null;
  }
};
