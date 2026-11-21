/** @format */

import { describe, expect, test, jest } from "@jest/globals";
import type { Request, Response, NextFunction } from "express";
import { authRateLimit, securityHeaders } from "./security.middleware";

function mockReq(ip = "1.2.3.4"): Request {
  return { ip, headers: {} } as Request;
}

function mockRes() {
  const headers: Record<string, string> = {};
  return {
    setHeader: jest.fn((name: string, value: string) => {
      headers[name] = value;
    }),
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    _headers: headers,
  } as unknown as Response & {
    setHeader: jest.Mock;
    status: jest.Mock;
    json: jest.Mock;
    _headers: Record<string, string>;
  };
}

describe("securityHeaders", () => {
  test("sets baseline security headers", () => {
    const res = mockRes();
    const next = jest.fn();
    securityHeaders(mockReq(), res, next as NextFunction);
    expect(res.setHeader).toHaveBeenCalledWith("X-Content-Type-Options", "nosniff");
    expect(next).toHaveBeenCalled();
  });
});

describe("authRateLimit", () => {
  test("allows requests under the limit", () => {
    const req = mockReq(`test-ip-${Math.random()}`);
    const res = mockRes();
    const next = jest.fn();
    authRateLimit(req, res, next as NextFunction);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});