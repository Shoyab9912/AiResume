import { OAuth2Client } from "google-auth-library";
import { UnauthorizedError } from "./errors.js";

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

export const verifyGoogleIdToken = async (idToken: string) => {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID as string,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new UnauthorizedError("Invalid Google ID token");
  }

  return payload;
};