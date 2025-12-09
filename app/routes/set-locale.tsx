// app/routes/set-locale.tsx
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { localeCookie } from "../i18n/i18next.server";

export async function action({ request }: ActionFunctionArgs) {
  try {
    // ✅ Authenticate — this extends the session
    await authenticate.admin(request);

    const formData = await request.formData();
    const locale = formData.get("locale")?.toString();
    const returnTo = formData.get("returnTo")?.toString() || "/app";

    const supportedLocales = ["en", "es", "fr", "de", "it", "pt", "ja", "zh"];
    if (locale && supportedLocales.includes(locale)) {
      return redirect(returnTo, {
        headers: {
          "Set-Cookie": await localeCookie.serialize(locale),
        },
      });
    }

    return redirect(returnTo);
  } catch (error) {
    // 🔒 If auth fails, go to a safe route that doesn't require auth
    // e.g., your public landing page (if any) or just /app (which will re-auth safely)
    console.error("Set-locale auth failed:", error);
    return redirect("/auth/login"); // or "/app" if you trust Shopify's redirect flow
  }
}

export default function SetLocale() {
  return null;
}