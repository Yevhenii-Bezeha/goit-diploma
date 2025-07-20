export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  external_urls: {
    spotify: string;
  };
  images?: SpotifyImage[];
  popularity: number;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  duration_ms: number;
  popularity: number;
  external_urls: {
    spotify: string;
  };
  artists: SpotifyArtist[];
  album: {
    images: SpotifyImage[];
    id: string;
    name: string;
  };
}

export interface SpotifyPlayHistoryItem {
  track: SpotifyTrack;
  played_at: string;
}

export interface SpotifyRecentlyPlayedResponse {
  items: SpotifyPlayHistoryItem[];
  next: string | null;
  cursors: {
    after: number;
    before: number;
  };
}

export interface SpotifyTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}
