
import { Context } from 'hono';

import { axiosInstance } from '../services/axiosInstance';

import { validationError } from '../utils/errors';

import * as cheerio from 'cheerio';

const randomController = async (
  _c: Context
): Promise<{ id: string }> => {
  console.log(
    'Fetching random anime...'
  );

  const result =
    await axiosInstance('/');

  if (
    !result.success ||
    !result.data
  ) {
    throw new validationError(
      result.message ||
        'Failed to fetch homepage for random selection'
    );
  }

  const $ =
    cheerio.load(result.data);

  const animes: string[] = [];

  $('.flw-item').each(
    (_, element) => {
      const item = $(element);

      /*
       * Current AniWatch structure:
       *
       * <a
       *   class="film-poster-ahref item-qtip"
       *   data-id="23044"
       *   href="/anime/link-click-season-3/"
       * >
       *
       * data-id is the WordPress/anime numeric ID.
       */

      const animeId =
        item
          .find(
            '.film-poster-ahref[data-id]'
          )
          .first()
          .attr('data-id');

      if (
        animeId &&
        /^\d+$/.test(animeId) &&
        !animes.includes(animeId)
      ) {
        animes.push(animeId);
      }
    }
  );

  if (animes.length === 0) {
    throw new validationError(
      'No anime found'
    );
  }

  const randomId =
    animes[
      Math.floor(
        Math.random() *
          animes.length
      )
    ];

  return {
    id: randomId,
  };
};

export default randomController;

