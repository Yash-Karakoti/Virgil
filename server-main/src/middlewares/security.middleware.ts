/** @format */

import type { RequestHandler } from "express";

/** Baseline HTTP security headers (no extra dependencies). */
export const securityHeaders: RequestHandler = (_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  res.setHeader(
    "Permissions-Policy",
    "camera=(self), geolocation=(self), microphone=()"
  );
  next();
};

type Bucket = { count: number; resetAt: number };

const authBuckets = new Map<string, Bucket>();

const AUTH_WINDOW_MS = 15 * 60 * 1000;
const AUTH_MAX_ATTEMPTS = 30;

/** Simple in-memory rate limit for auth routes (per IP). */
export const authRateLimit: RequestHandler = (req, res, next) => {
  const key =
    req.ip ||
    req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
    "unknown";
  const now = Date.now();
  let bucket = authBuckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + AUTH_WINDOW_MS };
    authBuckets.set(key, bucket);
  }

  bucket.count += 1;

  if (bucket.count > AUTH_MAX_ATTEMPTS) {
    return res.status(429).json({
      success: false,
      error: "Too many requests. Please try again later.",
      timestamp: new Date().toISOString(),
    });
  }

  next();
};