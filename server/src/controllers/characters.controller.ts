import { Context } from 'hono';
import { validationError } from '../utils/errors';
import {
  CharactersResponse,
} from '../extractor/extractCharacters';

const charactersController = async (
  c: Context
): Promise<CharactersResponse> => {
  const id = c.req.param('id');

  if (!id) {
    throw new validationError('id is required');
  }

  throw new validationError(
    'Characters endpoint is not available on the current upstream source',
    {
      id,
      reason:
        'The current upstream site no longer exposes the old /ajax/character/list endpoint.',
    }
  );
};

export default charactersController;