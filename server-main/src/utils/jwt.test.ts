/** @format */

import { describe, expect, test } from "@jest/globals";
import {
  extractTokenFromHeader,
  generateToken,
  verifyToken,
} from "./jwt";

describe("jwt utilities", () => {
  const payload = { userId: "user-1", contactNo: "9876543210" };

  test("generateToken and verifyToken round-trip", () => {
    const token = generateToken(payload);
    expect(typeof token).toBe("string");
    expect(verifyToken(token)).toEqual(payload);
  });

  test("verifyToken returns null for tampered token", () => {
    const token = generateToken(payload);
    expect(verifyToken(`${token}x`)).toBeNull();
  });

  test("extractTokenFromHeader parses Bearer tokens", () => {
    expect(extractTokenFromHeader("Bearer abc.def.ghi")).toBe("abc.def.ghi");
    expect(extractTokenFromHeader("Basic foo")).toBeNull();
    expect(extractTokenFromHeader(undefined)).toBeNull();
  });
});