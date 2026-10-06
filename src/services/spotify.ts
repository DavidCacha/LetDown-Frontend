import { sha256 } from 'js-sha256';
import { apiFetch } from './api';


export interface SpotifyStatus {
  connected: boolean;
  displayName?: string | null;
  spotifyUserId?: string | null;
  connectedAt?: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  tracksTotal: number;
  owner: string | null;
  externalUrl: string | null;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  albumImageUrl: string | null;
  durationMs: number;
  externalUrl: string | null;
  addedAt: string;
}

export interface SpotifyShow {
  id: string;
  name: string;
  publisher: string;
  description: string | null;
  imageUrl: string | null;
  totalEpisodes: number;
  externalUrl: string | null;
}


export const SPOTIFY_CLIENT_ID = 'a3281a570f464645be41c3bdfe279d67';
export const SPOTIFY_REDIRECT_URI = 'letdownapp://spotify-callback';

const SPOTIFY_SCOPES = [
  'user-read-email',
  'user-read-private',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read',
].join(' ');


const RANDOM_CHARSET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function randomString(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += RANDOM_CHARSET[Math.floor(Math.random() * RANDOM_CHARSET.length)];
  }
  return result;
}

const BASE64_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function base64UrlEncode(bytes: number[]): string {
  let base64 = '';
  let i = 0;
  while (i < bytes.length) {
    const b1 = bytes[i++];
    const b2 = i < bytes.length ? bytes[i++] : undefined;
    const b3 = i < bytes.length ? bytes[i++] : undefined;

    base64 += BASE64_CHARS[b1 >> 2];
    base64 += BASE64_CHARS[((b1 & 3) << 4) | (b2 !== undefined ? b2 >> 4 : 0)];
    base64 +=
      b2 !== undefined
        ? BASE64_CHARS[((b2 & 15) << 2) | (b3 !== undefined ? b3 >> 6 : 0)]
        : '=';
    base64 += b3 !== undefined ? BASE64_CHARS[b3 & 63] : '=';
  }
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function generateCodeVerifier(): string {
  return randomString(64);
}

function generateCodeChallenge(verifier: string): string {
  const hashBytes: number[] = sha256.array(verifier);
  return base64UrlEncode(hashBytes);
}

function buildQueryString(params: Record<string, string>): string {
  return Object.entries(params)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join('&');
}


export function buildSpotifyAuthRequest(): { url: string; codeVerifier: string } {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = randomString(16);

  const query = buildQueryString({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: SPOTIFY_REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    scope: SPOTIFY_SCOPES,
    state,
  });

  return {
    url: `https://accounts.spotify.com/authorize?${query}`,
    codeVerifier,
  };
}

export function parseSpotifyCallbackUrl(url: string): {
  code?: string;
  state?: string;
  error?: string;
} {
  const queryStart = url.indexOf('?');
  if (queryStart === -1) return {};

  const query = url.substring(queryStart + 1);
  const params: Record<string, string> = {};

  query.split('&').forEach((pair) => {
    const [key, rawValue] = pair.split('=');
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(rawValue ?? '');
    }
  });

  return { code: params.code, state: params.state, error: params.error };
}


export const spotifyService = {
  connect(
    accessToken: string,
    payload: { code: string; codeVerifier: string },
  ) {
    return apiFetch<{ connected: boolean; displayName: string | null }>(
      '/emotional/spotify/connect',
      {
        method: 'POST',
        accessToken,
        body: {
          code: payload.code,
          codeVerifier: payload.codeVerifier,
          redirectUri: SPOTIFY_REDIRECT_URI,
        },
      },
    );
  },

  getStatus(accessToken: string) {
    return apiFetch<SpotifyStatus>('/emotional/spotify/status', {
      accessToken,
    });
  },

  disconnect(accessToken: string) {
    return apiFetch<{ connected: boolean }>('/emotional/spotify/disconnect', {
      method: 'DELETE',
      accessToken,
    });
  },

  getPlaylists(accessToken: string) {
    return apiFetch<SpotifyPlaylist[]>('/emotional/spotify/playlists', {
      accessToken,
    });
  },

  getSavedTracks(accessToken: string) {
    return apiFetch<SpotifyTrack[]>('/emotional/spotify/tracks', {
      accessToken,
    });
  },

  getSavedShows(accessToken: string) {
    return apiFetch<SpotifyShow[]>('/emotional/spotify/shows', {
      accessToken,
    });
  },
};