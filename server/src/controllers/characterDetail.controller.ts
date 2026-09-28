import { Context } from 'hono';
import {
  extractCharacterDetail,
  CharacterDetail,
} from '../extractor/extractCharacterDetail';
import { validationError } from '../utils/errors';

const characterDetailController = async (
  c: Context
): Promise<CharacterDetail> => {
  const id = c.req.param('id');

  if (!id) {
    throw new validationError('id is required');
  }

  throw new validationError(
    'Character detail endpoint is not available on the current upstream source',
    {
      id,
      reason:
        'The current upstream site does not expose the old character-detail endpoint.',
    }
  );
};

export default characterDetailController;