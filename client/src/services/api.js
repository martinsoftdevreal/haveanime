const API_BASE_URL = 'https://hianime-api.martinsoftdevreal.workers.dev/api/v2';



const request = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

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

  return data;
};

export const api = {
  getHome: () => request('/home'),

  getAnime: (id) => request(`/anime/${id}`),

  getEpisodes: (id) => request(`/episodes/${id}`),

  searchAnime: (keyword) =>
    request(`/search?keyword=${encodeURIComponent(keyword)}`),

  getTopAiring: () => request('/animes/top-airing'),

  getMostPopular: () => request('/animes/most-popular'),

  getTopSearch: () => request('/top-search'),

  getSchedules: () => request('/schedules'),

  getNextEpisode: (id) => request(`/schedule/next/${id}`),

  getSuggestion: (keyword) =>
    request(`/suggestion?keyword=${encodeURIComponent(keyword)}`),

  getGenres: () => request('/genres'),

  getNews: () => request('/news'),

  getRandomAnime: () => request('/random'),

  getEpisodeServers: (id) =>
  request(`/episode/servers/${id}`),
  
};

export default api;