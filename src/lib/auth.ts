import { SignJWT, jwtVerify } from "jose";
import type { AstroCookies } from "astro";

const secret =
  import.meta.env.PRIVATE_JWT_SECRET;

if (!secret) {

  throw new Error(
    "PRIVATE_JWT_SECRET no está definido en .env",
  );

}

const encodedSecret = new TextEncoder().encode(secret);

export type SessionUser = {
  id: number;
  nombre: string;
  email: string;
  rol: "ADMIN" | "SUPERVISOR" | "CONTROLADOR" | "CONSULTA";
  controladorId: number | null;
  debeCambiarPassword: boolean;
};

export async function createToken(user: SessionUser) {
  return await new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(encodedSecret);
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, encodedSecret);

    return payload as SessionUser;
  } catch {
    return null;
  }
}

export async function getSessionUser(
  cookies: AstroCookies,
): Promise<SessionUser | null> {
  const token = cookies.get("mk_token")?.value;

  if (!token) {
    return null;
  }

  return await verifyToken(token);
}