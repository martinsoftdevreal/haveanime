import { Context } from 'hono';
import { extractDetailpage } from '../extractor/extractDetailpage';
import { axiosInstance } from '../services/axiosInstance';
import { validationError } from '../utils/errors';
import { DetailAnime } from '../types/anime';

const detailpageController = async (c: Context): Promise<DetailAnime> => {
  const id = c.req.param('id');

  if (!id) {
    throw new validationError('id is required');
  }

  const value = id.trim();

  if (!value) {
    throw new validationError('id cannot be empty');
  }

  let endpoint: string;

  // Numeric WordPress/Hianime ID.
  // Example: 6698 -> /?p=6698 -> redirects to /anime/naruto/
  if (/^\d+$/.test(value)) {
    endpoint = `/?p=${encodeURIComponent(value)}`;
  } else {
    // Slug.
    endpoint = `/anime/${encodeURIComponent(value)}/`;
  }

  console.log(`Fetching anime detail: ${endpoint}`);

  const result = await axiosInstance(endpoint);

  if (!result.success || !result.data) {
    throw new validationError(
      result.message || 'Failed to fetch anime detail',
      { id: value }
    );
  }

  return extractDetailpage(result.data);
};

export default detailpageController;