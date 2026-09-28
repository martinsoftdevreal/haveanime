import { Context } from 'hono';
import { axiosInstance } from '../services/axiosInstance';
import { validationError } from '../utils/errors';
import {
  extractNews,
  NewsResponse,
} from '../extractor/extractNews';

const newsController = async (
  c: Context
): Promise<NewsResponse> => {
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

  const endpoint =
    pageNumber === 1
      ? '/news'
      : `/news?page=${pageNumber}`;

  console.log(
    `Fetching news page ${pageNumber}`
  );

  const result =
    await axiosInstance(endpoint);

  if (!result.success || !result.data) {
    throw new validationError(
      result.message ||
        'Failed to fetch news'
    );
  }

  return extractNews(
    result.data
  );
};

export default newsController;