import { Context } from 'hono';

import {
  extractSuggestions,
  Suggestion,
} from '../extractor/extractSuggestions';

import { axiosInstance } from '../services/axiosInstance';

import {
  NotFoundError,
  validationError,
} from '../utils/errors';

export interface SearchResponse {
  pageInfo: {
    currentPage: number;
    hasNextPage: boolean;
    totalPages: number;
  };

  response: Suggestion[];
}

const searchController = async (
  c: Context
): Promise<SearchResponse> => {
  const keyword =
    c.req.query('keyword')?.trim() || '';

  if (!keyword) {
    throw new validationError(
      'keyword is required'
    );
  }

  /*
   * Current AniWatch does not expose the old
   * /search?keyword= endpoint anymore.
   *
   * The current site provides search suggestions
   * through the WordPress REST API.
   */
  const endpoint =
    `/wp-json/hianime/v1/search/suggestions` +
    `?keyword=${encodeURIComponent(keyword)}`;

  console.log(
    `Searching anime suggestions: ${endpoint}`
  );

  const result =
    await axiosInstance(endpoint);

  if (
    !result.success ||
    !result.data
  ) {
    throw new validationError(
      result.message ||
        'Failed to search anime'
    );
  }

  /*
   * The REST endpoint returns JSON:
   *
   * {
   *   success: true,
   *   html: "..."
   * }
   *
   * axiosInstance returns the response body,
   * so handle both the parsed JSON object and
   * a JSON string defensively.
   */
  let data: {
    success?: boolean;
    html?: string;
  };

  if (
    typeof result.data === 'string'
  ) {
    try {
      data = JSON.parse(result.data);
    } catch {
      throw new validationError(
        'Invalid search response'
      );
    }
  } else {
    data = result.data as {
      success?: boolean;
      html?: string;
    };
  }

  if (
    data.success === false ||
    !data.html
  ) {
    throw new NotFoundError(
      'No anime found'
    );
  }

  const response =
    extractSuggestions(data.html);

  if (!response.length) {
    throw new NotFoundError(
      'No anime found'
    );
  }

  return {
    pageInfo: {
      currentPage: 1,
      hasNextPage: false,
      totalPages: 1,
    },

    response,
  };
};

export default searchController;