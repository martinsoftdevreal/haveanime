const REQUEST_TIMEOUT_MS = 8000;
const EXTERNAL_PROXY_BASE = 'https://hianime-api.martinsoftdevreal.workers.dev/api/v2';

const API_BASE_URLS = [
  'https://hianime-api.martinsoftdevreal.workers.dev/api/v2',
];

const FALLBACK_API_BASE_URLS = [
  'https://hianime-api.martinsoftdevreal.workers.dev/api/v2',
];

const compactAnimeList = (items = [], limit = 8) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.slice(0, limit).filter(Boolean);
};

const compactHomePayload = (payload = {}) => {
  const source = payload?.data?.data ?? payload?.data ?? payload ?? {};

  return {
    spotlight: compactAnimeList(source.spotlight, 5),
    topAiring: compactAnimeList(source.topAiring, 8),
    trending: compactAnimeList(source.trending, 8),
    mostPopular: compactAnimeList(source.mostPopular, 8),
    recentEpisodes: compactAnimeList(source.recentEpisodes, 6),
    newEpisodes: compactAnimeList(source.newEpisodes, 6),
    seasons: Array.isArray(source.seasons)
      ? source.seasons.slice(0, 6)
      : [],
  };
};

const notifyBackend = (routeName, source, url) => {
  if (typeof window === 'undefined') {
    return;
  }

  const value = {
    route: routeName,
    source,
    url,
    timestamp: Date.now(),
  };

  window.__animeBackendInfo = value;
  window.dispatchEvent(new CustomEvent('anime-backend-change', { detail: value }));

  console.info('[anime-backend]', routeName, '->', source, url);
};

const extractFallbackPayload = (html = '') => {
  if (typeof html !== 'string' || !html.trim()) {
    return { seasons: [], episodes: [] };
  }

  const candidates = [];
  const scriptPattern = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const nextDataPattern = /__NEXT_DATA__\s*=\s*JSON\.parse\(['"]([\s\S]*?)['"]\)/gi;
  const literalPattern = /__NEXT_DATA__\s*=\s*([\s\S]*?);?\s*(?:<\/script>|$)/gi;
  const nuxtPattern = /window\.__NUXT__\s*=\s*([\s\S]*?);?\s*(?:<\/script>|$)/gi;

  for (const pattern of [scriptPattern, nextDataPattern, literalPattern, nuxtPattern]) {
    for (const match of html.matchAll(pattern)) {
      const raw = match[1] || match[0];
      if (typeof raw !== 'string') {
        continue;
      }

      const cleaned = raw.trim().replace(/^\s*JSON\.parse\((.*)\)\s*$/s, '$1').replace(/^\s*['"]|['"]\s*$/g, '');
      if (cleaned.startsWith('{') || cleaned.startsWith('[')) {
        candidates.push(cleaned);
      }
    }
  }

  const extracted = [];
  const visit = (value) => {
    if (!value || typeof value !== 'object') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    Object.entries(value).forEach(([key, nested]) => {
      if ((key === 'seasons' || key === 'episodes' || key === 'moreSeasons') && Array.isArray(nested)) {
        extracted.push(...nested);
      }

      if (nested && typeof nested === 'object') {
        visit(nested);
      }
    });
  };

  candidates.forEach((candidate) => {
    try {
      visit(JSON.parse(candidate));
    } catch {
      // Ignore non-JSON script payloads.
    }
  });

  const seasons = extracted
    .filter((item) => item && typeof item === 'object')
    .filter((item) => {
      const keys = Object.keys(item);
      return (
        keys.some((key) => /season|title|name|slug|id/i.test(key)) &&
        (item.id || item.slug || item.title || item.name)
      );
    })
    .slice(0, 12);

  const episodes = extracted
    .filter((item) => item && typeof item === 'object')
    .filter((item) => {
      const keys = Object.keys(item);
      return (
        keys.some((key) => /episode|number|title|id/i.test(key)) &&
        (item.id || item.episode || item.episodeNumber || item.number || item.title || item.name)
      );
    })
    .slice(0, 24);

  return { seasons, episodes };
};

const request = async (
  endpoint,
  options = {},
  baseUrls = API_BASE_URLS,
  routeName = 'api'
) => {
  const urlCandidates = Array.isArray(baseUrls) ? baseUrls : [baseUrls];
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  let lastError = new Error('API request failed');

  for (const baseUrl of urlCandidates) {
    const normalizedBaseUrl = String(baseUrl).replace(/\/$/, '');
    const url = `${normalizedBaseUrl}${normalizedEndpoint}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      });

      clearTimeout(timeoutId);

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(`API returned invalid JSON (${response.status})`);
      }

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message ||
            data?.error ||
            `API request failed with status ${response.status}`
        );
      }

      const source = normalizedBaseUrl.includes('animeheaven')
        ? 'animeheaven'
        : 'hianime';

      notifyBackend(routeName, source, url);
      return data;
    } catch (error) {
      const message = error?.message || String(error || 'Unknown API error');

      console.warn('[anime-backend]', routeName, 'fetch failed for', url, message);
      lastError = error;

      if (message.includes('Failed to fetch') || message.includes('CORS') || message.includes('abort')) {
        break;
      }
    }
  }

  throw lastError;
};

const requestWithFallback = async (
  endpoints,
  options = {},
  baseUrls = API_BASE_URLS,
  routeName = 'api'
) => {
  const candidates = Array.isArray(endpoints) ? endpoints : [endpoints];

  let lastError = new Error('API request failed');

  for (const endpoint of candidates) {
    try {
      return await request(endpoint, options, baseUrls, routeName);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
};

export const api = {
  getHome: () =>
    requestWithFallback([
      '/home',
    ], {}, API_BASE_URLS, 'home'),

  getHomeCompact: async () => {
    const response = await api.getHome().catch(() => api.getHomeBackup());
    const payload = response?.data?.data ?? response?.data ?? response ?? {};

    return compactHomePayload(payload);
  },

  getHomeBackup: () =>
    requestWithFallback([
      '/home',
    ], {}, FALLBACK_API_BASE_URLS, 'home-backup'),

  getAnimeHeavenFallback: async (slug) => {
    const normalizedSlug = String(slug || '').trim();
    if (!normalizedSlug) {
      return null;
    }

    const pageSlug = normalizedSlug
      .replace(/^https?:\/\/[^/]+\/anime\//, '')
      .replace(/^https?:\/\/[^/]+\//, '')
      .replace(/^\//, '');

    const url = `https://animeheaven.to/anime/${pageSlug}`;
    const response = await fetch(`${EXTERNAL_PROXY_BASE}/external?url=${encodeURIComponent(url)}`);

    if (!response.ok) {
      throw new Error(`AnimeHeaven fallback failed with status ${response.status}`);
    }

    const html = await response.text();
    if (!html || html.length < 200) {
      throw new Error('AnimeHeaven fallback returned empty content');
    }

    return {
      html,
      parsed: extractFallbackPayload(html),
    };
  },

  getAnime: (id) =>
    requestWithFallback([
      `/anime/${id}`,
    ], {}, API_BASE_URLS, `anime:${id}`),

  getEpisodes: (id) =>
    requestWithFallback([
      `/episodes/${id}`,
    ], {}, API_BASE_URLS, `episodes:${id}`),

  getSeasons: (id) =>
    requestWithFallback([
      `/anime/${id}/seasons`,
    ], {}, FALLBACK_API_BASE_URLS, `seasons:${id}`),

  getNewEpisodes: () =>
    requestWithFallback([
      '/new-episodes',
    ], {}, FALLBACK_API_BASE_URLS, 'new-episodes'),

  searchAnime: (keyword) =>
    requestWithFallback([
      `/search?keyword=${encodeURIComponent(keyword)}`,
    ], {}, API_BASE_URLS, `search:${keyword}`),

  getTopAiring: () => requestWithFallback(['/animes/top-airing'], {}, API_BASE_URLS, 'top-airing'),

  getMostPopular: () => requestWithFallback(['/animes/most-popular'], {}, API_BASE_URLS, 'most-popular'),

  getTopSearch: () => requestWithFallback(['/top-search'], {}, API_BASE_URLS, 'top-search'),

  getSchedules: () => requestWithFallback(['/schedules'], {}, API_BASE_URLS, 'schedule'),

  getNextEpisode: (id) => requestWithFallback([`/schedule/next/${id}`], {}, API_BASE_URLS, `next-episode:${id}`),

  getSuggestion: (keyword) =>
    requestWithFallback([
      `/suggestion?keyword=${encodeURIComponent(keyword)}`,
    ], {}, API_BASE_URLS, `suggestion:${keyword}`),

  getGenres: () => requestWithFallback(['/genres'], {}, API_BASE_URLS, 'genres'),

  getNews: () => requestWithFallback(['/news'], {}, API_BASE_URLS, 'news'),

  getRandomAnime: () => requestWithFallback(['/random'], {}, API_BASE_URLS, 'random'),

  getEpisodeServers: (id) =>
    requestWithFallback([
      `/episode/servers/${id}`,
    ], {}, API_BASE_URLS, `episode-servers:${id}`),

  fetchWithFallback: (
    endpoints,
    routeName = 'page',
    baseUrls = API_BASE_URLS,
    options = {}
  ) => requestWithFallback(endpoints, options, baseUrls, routeName),
};

export default api;
