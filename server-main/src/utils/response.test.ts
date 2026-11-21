/** @format */

import { describe, expect, test, jest } from "@jest/globals";
import { ResponseHandler } from "./response";
import type { Response } from "express";

function mockResponse() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res as unknown as Response & {
    status: jest.Mock;
    json: jest.Mock;
  };
}

describe("ResponseHandler", () => {
  test("success includes timestamp and data", () => {
    const res = mockResponse();
    ResponseHandler.success(res, { id: 1 }, "ok", 201);

    expect(res.status).toHaveBeenCalledWith(201);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.data).toEqual({ id: 1 });
    expect(body.message).toBe("ok");
    expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  test("badRequest uses 400 status", () => {
    const res = mockResponse();
    ResponseHandler.badRequest(res, "Invalid input");
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].error).toBe("Invalid input");
  });

  test("unauthorized uses 401 status", () => {
    const res = mockResponse();
    ResponseHandler.unauthorized(res);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});