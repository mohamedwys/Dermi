import type { ActionFunctionArgs } from "@remix-run/node";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const locale = formData.get("locale");

  return new Response(null, {
    status: 200,
    headers: {
      "Set-Cookie": `locale=${locale}; Path=/; SameSite=Lax; HttpOnly`
    }
  });
};
