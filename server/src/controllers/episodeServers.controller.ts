import { Context } from 'hono';

import { validationError } from '../utils/errors';

import {
  extractEpisodeServers,
  EpisodeServer,
} from '../extractor/extractEpisodeServers';

import { axiosInstance } from '../services/axiosInstance';

const episodeServersController = async (
  c: Context
): Promise<EpisodeServer[]> => {
  const id = c.req.param('id');

  if (!id) {
    throw new validationError('id is required');
  }

  const idValue = id.trim();

  if (!/^\d+$/.test(idValue)) {
    throw new validationError(
      'episode id must be a numeric id',
      {
        example: '6700',
      }
    );
  }

  const endpoint = `/wp-json/hianime/v1/episode/servers/${encodeURIComponent(
    idValue
  )}`;

  console.log(`Fetching episode servers: ${endpoint}`);

  const result = await axiosInstance(endpoint);

  if (!result.success || !result.data) {
    throw new validationError(
      result.message || 'Failed to fetch episode servers',
      {
        id: idValue,
      }
    );
  }

  let html = result.data;

  try {
    const parsed = JSON.parse(result.data);

    if (typeof parsed?.html === 'string') {
      html = parsed.html;
    } else if (
      typeof parsed?.data?.html === 'string'
    ) {
      html = parsed.data.html;
    }
  } catch {
    // Response is already raw HTML.
  }

  if (!html) {
    throw new validationError(
      'Episode servers response is empty'
    );
  }

  return extractEpisodeServers(html);
};

export default episodeServersController;