import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { readFile } from "fs/promises";
import { join } from "path";

/**
 * Check if translation files are accessible
 * Access at: https://your-app.vercel.app/api/check-translations
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const checks: Record<string, any> = {
    timestamp: new Date().toISOString(),
  };

  // Check if translation files exist and are readable
  const languages = ['en', 'es', 'fr', 'de', 'it', 'ja', 'pt', 'zh'];
  const translationChecks: Record<string, string> = {};

  for (const lang of languages) {
    try {
      // Try to read from public directory
      const filePath = join(process.cwd(), 'public', 'locales', lang, 'common.json');
      const content = await readFile(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      translationChecks[lang] = `✅ Loaded (${Object.keys(parsed).length} keys)`;
    } catch (error: any) {
      translationChecks[lang] = `❌ Error: ${error.message}`;
    }
  }

  checks.translationFiles = translationChecks;

  // Check if files are accessible via HTTP
  checks.httpCheck = "Try accessing: /locales/en/common.json";

  return json(checks, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
};
