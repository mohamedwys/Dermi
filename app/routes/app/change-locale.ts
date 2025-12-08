// app/routes/app/change-locale.ts
import { redirect } from "@remix-run/node";
import { localeCookie } from "../../i18n/i18next.server";

export const action = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const locale = formData.get("locale")?.toString() || "en";

  const response = redirect("/app");
  response.headers.append("Set-Cookie", await localeCookie.serialize(locale));

  return response;
};
