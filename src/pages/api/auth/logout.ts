export const prerender = false;

import type { APIRoute } from "astro";

export const GET: APIRoute = async ({
  cookies,
  redirect,
}) => {

  cookies.delete(
    "mk_token",
    {
      path: "/",
    },
  );

  return redirect(
    "/login",
  );
};