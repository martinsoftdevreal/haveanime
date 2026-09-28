import { Context } from 'hono';

import {
  extractListPage,
  ListPageResponse,
} from '../extractor/extractListpage';

import { axiosInstance } from '../services/axiosInstance';

import {
  NotFoundError,
  validationError,
} from '../utils/errors';

const listpageController = async (
  c: Context
): Promise<ListPageResponse> => {
  const validQueries = [
    'top-airing',
    'most-popular',
    'most-favorite',
    'completed',
    'recently-added',
    'recently-updated',
    'top-upcoming',
    'genre',
    'producer',
    'az-list',
    'subbed-anime',
    'dubbed-anime',
    'movie',
    'tv',
    'ova',
    'ona',
    'special',
    'events',
  ];

  const query =
    c.req.param('query')?.trim().toLowerCase() || '';

  if (!query) {
    throw new validationError('query is required', {
      validQueries,
    });
  }

  if (!validQueries.includes(query)) {
    throw new validationError('invalid query', {
      validQueries,
    });
  }

  let category =
    c.req.param('category')?.trim() || null;

  const page =
    c.req.query('page')?.trim() || '1';

  const pageNumber = Number(page);

  if (
    !Number.isInteger(pageNumber) ||
    pageNumber < 1
  ) {
    throw new validationError(
      'page must be a positive integer'
    );
  }

  if (
    (query === 'genre' || query === 'producer') &&
    !category
  ) {
    throw new validationError(
      `category is required for query ${query}`
    );
  }

  if (
    query !== 'genre' &&
    query !== 'producer' &&
    query !== 'az-list'
  ) {
    category = null;
  }

  if (category) {
    category = category
      .replace(/\s+/g, '-')
      .toLowerCase();
  }

  const endpoint = category
    ? `/${query}/${encodeURIComponent(
        category
      )}?page=${pageNumber}`
    : `/${query}?page=${pageNumber}`;

  console.log(
    `Fetching list page: ${endpoint}`
  );

  const result = await axiosInstance(endpoint);

  if (!result.success || !result.data) {
    throw new validationError(
      result.message ||
        'Failed to fetch list page',
      {
        query,
        category,
        page: pageNumber,
      }
    );
  }

  const response = extractListPage(result.data);

  if (!response.response?.length) {
    throw new NotFoundError(
      'No anime found'
    );
  }

  return response;
};

export default listpageController;