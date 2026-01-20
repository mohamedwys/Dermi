import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";

/**
 * Root route - redirects to /app after authentication
 * This handles the initial app load from Shopify Admin
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  // After successful authentication, redirect to the main app
  return redirect("/app");
};

// No default export needed - this is a redirect-only route
