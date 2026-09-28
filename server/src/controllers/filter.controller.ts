import { Context } from 'hono';
import filterOptions from '../utils/filter';
import { axiosInstance } from '../services/axiosInstance';
import { validationError } from '../utils/errors';
import {
  extractListPage,
  ListPageResponse,
} from '../extractor/extractListpage';

const filterController = async (
  c: Context
): Promise<ListPageResponse> => {
  const {
    keyword = '',
    sort = '',
    genres = '',
    type = '',
    status = '',
    rated = '',
    score = '',
    season = '',
    language = '',
    page = '1',
  } = c.req.query();

  const pageNumber = Number(page);

  if (
    !Number.isInteger(pageNumber) ||
    pageNumber < 1
  ) {
    throw new validationError(
      'page must be a positive integer'
    );
  }

  const params = new URLSearchParams();

  if (keyword.trim()) {
    params.set(
      'keyword',
      keyword.trim().toLowerCase()
    );
  }

  if (sort.trim()) {
    const formattedSort =
      formatSort(sort);

    if (formattedSort) {
      params.set('sort', formattedSort);
    }
  }

  if (genres.trim()) {
    const formattedGenres =
      formatGenres(genres);

    if (formattedGenres) {
      params.set(
        'genres',
        formattedGenres
      );
    }
  }

  const options = [
    ['type', type],
    ['status', status],
    ['rated', rated],
    ['score', score],
    ['season', season],
    ['language', language],
  ] as const;

  for (const [key, value] of options) {
    if (!value.trim()) continue;

    const formatted =
      formatOption(key, value);

    if (formatted !== null) {
      params.set(key, formatted);
    }
  }

  if (pageNumber > 1) {
    params.set(
      'page',
      String(pageNumber)
    );
  }

  const endpoint =
    keyword.trim()
      ? '/search'
      : '/filter';

  const queryString =
    params.toString();

  const url = queryString
    ? `${endpoint}?${queryString}`
    : endpoint;

  console.log(
    `Fetching filtered anime: ${url}`
  );

  const result =
    await axiosInstance(url);

  if (!result.success || !result.data) {
    throw new validationError(
      result.message ||
        'Failed to fetch filtered anime'
    );
  }

  return extractListPage(
    result.data
  );
};

const formatSort = (
  value: string
): string | null => {
  const normalized =
    value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_');

  const index =
    filterOptions.sort.indexOf(
      normalized
    );

  if (index === -1) {
    return null;
  }

  return filterOptions.sort[index];
};

const formatGenres = (
  value: string
): string => {
  const indexes = value
    .split(',')
    .map((genre) =>
      genre
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
    )
    .map((genre) =>
      filterOptions.genres.indexOf(
        genre
      )
    )
    .filter((index) => index !== -1)
    .map((index) => index + 1);

  return indexes.join(',');
};

const formatOption = (
  key: string,
  value: string
): string | null => {
  const options =
    (
      filterOptions as Record<
        string,
        string[]
      >
    )[key];

  if (!options) {
    return null;
  }

  const normalized =
    value.trim().toLowerCase();

  const index =
    options.findIndex(
      (option) =>
        option.toLowerCase() ===
        normalized
    );

  if (index === -1) {
    return null;
  }

  return String(index);
};

export default filterController;