import type { LoaderFunctionArgs } from "@remix-run/node";
import { readFile } from "fs/promises";
import { join } from "path";

/**
 * Serve translation files for i18next
 * Route: /locales/{lang}/{namespace}.json
 * Example: /locales/en/common.json
 */
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { lang, ns } = params;

  if (!lang || !ns) {
    return new Response("Missing language or namespace", { status: 400 });
  }

  try {
    // Read translation file from source location
    const filePath = join(process.cwd(), 'app', 'i18n', 'locales', lang, `${ns}.json`);
    const content = await readFile(filePath, 'utf-8');

    return new Response(content, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error: any) {
    console.error(`Translation file not found: ${lang}/${ns}.json`, error.message);
    return new Response(`Translation file not found: ${lang}/${ns}.json`, {
      status: 404,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
};
