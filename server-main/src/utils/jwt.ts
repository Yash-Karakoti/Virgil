/** @format */

import jwt from "jsonwebtoken";

/** JWT `expiresIn` is expressed in seconds (see jsonwebtoken docs). */
const JWT_EXPIRES_IN_SECONDS = 24 * 60 * 60;

export interface JwtPayload {
  userId: string;
  contactNo: string;
}

export function generateToken(payload: JwtPayload): string {
  const JWT_SECRET = process.env.JWT_SECRET;

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN_SECONDS,
  });
}

export function verifyToken(token: string): JwtPayload | null {
  const JWT_SECRET = process.env.JWT_SECRET;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & {
      iat?: number;
      exp?: number;
    };
    return {
      userId: decoded.userId,
      contactNo: decoded.contactNo,
    };
  } catch {
    return null;
  }
}

export function extractTokenFromHeader(
  authHeader: string | undefined
): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}
