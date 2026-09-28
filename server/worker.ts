import app from './src/app';
import { Hono } from 'hono';

const test = new Hono();

test.get('/test-external', async (c) => {
  try {
    const start = Date.now();

    const response = await fetch('https://aniwatch.co.at/', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64; rv:122.0) Gecko/20100101 Firefox/122.0',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    const text = await response.text();

    return c.json({
      success: true,
      status: response.status,
      length: text.length,
      timeMs: Date.now() - start,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

app.route('/', test);

export default app;