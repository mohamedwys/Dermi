import { PassThrough } from "stream";
import { renderToPipeableStream } from "react-dom/server";
import { RemixServer } from "@remix-run/react";
import {
  createReadableStreamFromReadable,
  type EntryContext,
} from "@remix-run/node";
import { isbot } from "isbot";
import { addDocumentResponseHeaders } from "./shopify.server";
import { initSentry } from "./lib/sentry.server";
import { createInstance } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { resources } from "./i18n/resources";

// Only import this one (the others do NOT exist)
import { getLocaleFromRequest } from "./i18n/i18next.server";

// Initialize sentry
initSentry();

export const streamTimeout = 5000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  console.log("🚀 [entry.server] START", request.url);

  try {
    addDocumentResponseHeaders(request, responseHeaders);

    const userAgent = request.headers.get("user-agent");
    const callbackName = isbot(userAgent ?? "")
      ? "onAllReady"
      : "onShellReady";

    // 1️⃣ Get locale
    const locale = await getLocaleFromRequest(request);
    console.log("🌍 Locale:", locale);

    // 2️⃣ Create i18next per-request instance
    const instance = createInstance();

    // 3️⃣ Detect namespaces based on route modules
    const routeModules = Object.values(remixContext.routeModules);
    const ns = Array.from(
      new Set(
        routeModules
          .map((mod: any) => mod?.handle?.i18n?.ns)
          .flat()
          .filter(Boolean)
      )
    );

    console.log("📦 Namespaces:", ns);

    // 4️⃣ Initialize server-side i18next
    await instance.use(initReactI18next).init({
      lng: locale,
      ns,
      resources,
      fallbackLng: "en",
      defaultNS: "common",
      react: { useSuspense: false },
    });

    return new Promise<Response>((resolve, reject) => {
      const { pipe, abort } = renderToPipeableStream(
        <I18nextProvider i18n={instance}>
          <RemixServer context={remixContext} url={request.url} />
        </I18nextProvider>,
        {
          [callbackName]: () => {
            const body = new PassThrough();
            const stream = createReadableStreamFromReadable(body);

            responseHeaders.set("Content-Type", "text/html");

            resolve(
              new Response(stream, {
                headers: responseHeaders,
                status: responseStatusCode,
              })
            );

            pipe(body);
          },
          onShellError(error) {
            console.error("❌ Shell error:", error);
            reject(error);
          },
          onError(error) {
            console.error("❌ Render error:", error);
            responseStatusCode = 500;
          },
        }
      );

      setTimeout(abort, streamTimeout + 1000);
    });
  } catch (error) {
    console.error("❌ Fatal:", error);
    throw error;
  }
}
