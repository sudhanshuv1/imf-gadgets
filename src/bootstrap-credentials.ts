import fs from 'fs';
import path from 'path';

/**
 * Sets up Google Cloud credentials from an environment variable.
 * If the GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is set,
 * it writes the JSON key to a temporary file and sets the
 * GOOGLE_APPLICATION_CREDENTIALS environment variable to that file path.
 */
export function setupGoogleCredentials(): void {
  const jsonKey = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  const already = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!already && jsonKey) {
    const keyPath = path.join('/tmp', 'gcp-key.json');
    fs.writeFileSync(keyPath, jsonKey, { encoding: 'utf8' });
    process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;
    console.log('✅ Google credentials written to', keyPath);
  }
}
