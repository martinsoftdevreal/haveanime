import { Context } from 'hono';
import { validationError } from '../utils/errors';
import {
  extractSuggestions,
  Suggestion,
} from '../extractor/extractSuggestions';
import { axiosInstance } from '../services/axiosInstance';

const suggestionController = async (
  c: Context
): Promise<Suggestion[]> => {
  const keyword =
    c.req.query('keyword')?.trim() || '';

  if (!keyword) {
    throw new validationError(
      'keyword is required'
    );
  }

  const endpoint =
    `/wp-json/hianime/v1/search/suggestions?keyword=${encodeURIComponent(
      keyword
    )}`;

  console.log(
    `Fetching search suggestions: ${endpoint}`
  );

  const result = await axiosInstance(endpoint);

  if (!result.success || !result.data) {
    throw new validationError(
      result.message ||
        'Failed to fetch suggestions'
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
    // Response is already HTML.
  }

  if (!html) {
    return [];
  }

  return extractSuggestions(html);
};

export default suggestionController;