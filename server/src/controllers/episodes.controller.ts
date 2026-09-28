import { Context } from 'hono';
import { validationError } from '../utils/errors';
import {
  extractEpisodes,
  Episode,
} from '../extractor/extractEpisodes';
import { axiosInstance } from '../services/axiosInstance';

const episodesController = async (
  c: Context
): Promise<Episode[]> => {
  const id = c.req.param('id');

  if (!id) {
    throw new validationError('id is required');
  }

  const idValue = id.trim();

  if (!/^\d+$/.test(idValue)) {
    throw new validationError(
      'anime id must be a numeric id',
      {
        example: '6698',
      }
    );
  }

  const endpoint = `/wp-json/hianime/v1/episode/list/${encodeURIComponent(
    idValue
  )}`;

  console.log(`Fetching episodes: ${endpoint}`);

  const result = await axiosInstance(endpoint);

  if (!result.success || !result.data) {
    throw new validationError(
      result.message || 'Failed to fetch episodes',
      {
        id: idValue,
      }
    );
  }

  let html = result.data;

  try {
    const parsed = JSON.parse(result.data);

    if (parsed?.html) {
      html = parsed.html;
    } else if (typeof parsed?.data?.html === 'string') {
      html = parsed.data.html;
    }
  } catch {
    // Response is already raw HTML.
  }

  if (!html) {
    throw new validationError('Episode list is empty');
  }

  return extractEpisodes(html);
};

export default episodesController;