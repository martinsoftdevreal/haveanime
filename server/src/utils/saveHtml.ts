
import * as path from 'path';

const saveHtml = async (html: string, fileName: string) => {
  try {
    const htmlDirectory = path.join(import.meta.dir, '../../../htmls');
    const fullPath = path.join(htmlDirectory, fileName);

    console.log(`Saving HTML to: ${fullPath}`);

    await Bun.write(fullPath, html);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Failed to save HTML: ${error.message}`);
    } else {
      console.error('Failed to save HTML');
    }

    throw error;
  }
};

export default saveHtml;

