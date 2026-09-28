
import { Context, Next } from 'hono';

const protect = async (c: Context, next: Next) => {
  await next();
};

export default protect;
