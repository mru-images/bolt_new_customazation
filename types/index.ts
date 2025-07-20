export interface Song {
  file_id: number;
  img_id: number;
  name: string;
  artist: string;
  language: string;
  tags: string[];
  views: number;
  likes: number;
  // UI-specific fields
  id: string; // derived from file_id
  image: string; // derived from img_id
  isLiked: boolean; // user-specific state
  audioUrl?: string; // for playback
}

export interface Playlist {
  id: string;
  name: string;
  songCount: number;
  image: string;
  songs: Song[];
  user_id?: string;
}

export interface User {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  created_at: string;
  last_login?: string;
  last_song_file_id?: number;
}