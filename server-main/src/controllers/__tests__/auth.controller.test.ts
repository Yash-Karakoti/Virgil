/** @format */

import { describe, expect, test, jest, beforeEach } from "@jest/globals";
import type { Request, Response } from "express";
import { signIn, signUp, getProfile } from "../auth.controller";
import { authService } from "../../services/auth.service";
jest.mock("../../services/auth.service", () => ({
  authService: {
    signIn: jest.fn(),
    signUp: jest.fn(),
    getUserById: jest.fn(),
  },
}));

function mockRes() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
  };
  return res as unknown as Response & {
    status: jest.Mock;
    json: jest.Mock;
    cookie: jest.Mock;
  };
}

describe("auth.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("signIn", () => {
    test("returns 200 and sets httpOnly cookie on success", async () => {
      (authService.signIn as jest.Mock).mockResolvedValue({
        token: "jwt-token",
        user: {
          id: "u1",
          contactNo: "9876543210",
          fullName: "Test",
          address: "Addr",
        },
      });

      const req = {
        body: { phoneNumber: "9876543210", password: "secret12" },
      } as Request;
      const res = mockRes();

      await signIn(req, res, jest.fn());

      expect(authService.signIn).toHaveBeenCalledWith("9876543210", "secret12");
      expect(res.cookie).toHaveBeenCalledWith(
        "token",
        "jwt-token",
        expect.objectContaining({ httpOnly: true })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].success).toBe(true);
      expect(res.json.mock.calls[0][0].data.fullName).toBe("Test");
    });

    test("returns 400 on validation error", async () => {
      const req = { body: { phoneNumber: "12", password: "" } } as Request;
      const res = mockRes();

      await signIn(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(400);
      expect(authService.signIn).not.toHaveBeenCalled();
    });

    test("returns 401 when credentials are invalid", async () => {
      (authService.signIn as jest.Mock).mockRejectedValue(
        new Error("Invalid phone number or password")
      );

      const req = {
        body: { phoneNumber: "9876543210", password: "wrong" },
      } as Request;
      const res = mockRes();

      await signIn(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe("signUp", () => {
    test("returns 201 on success", async () => {
      (authService.signUp as jest.Mock).mockResolvedValue({
        token: "jwt-token",
        user: { id: "u2", contactNo: "9876543210", fullName: "New", address: "12 St" },
      });

      const req = {
        body: {
          phoneNumber: "9876543210",
          password: "secret12",
          name: "New User",
          address: "12 Lake View Road",
        },
      } as Request;
      const res = mockRes();

      await signUp(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.cookie).toHaveBeenCalled();
    });

    test("returns 400 when phone is already registered", async () => {
      (authService.signUp as jest.Mock).mockRejectedValue(
        new Error("User with this phone number already exists")
      );

      const req = {
        body: {
          phoneNumber: "9876543210",
          password: "secret12",
          name: "New User",
          address: "12 Lake View Road",
        },
      } as Request;
      const res = mockRes();

      await signUp(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("getProfile", () => {
    test("returns 401 without authenticated user", async () => {
      const req = {} as Request;
      const res = mockRes();

      await getProfile(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(401);
    });

    test("returns user profile when authenticated", async () => {
      (authService.getUserById as jest.Mock).mockResolvedValue({
        id: "u1",
        contactNo: "9876543210",
        fullName: "Test",
        address: "Addr",
        role: "USER",
      });

      const req = { user: { id: "u1" } } as Request;
      const res = mockRes();

      await getProfile(req, res, jest.fn());

      expect(authService.getUserById).toHaveBeenCalledWith("u1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].data.fullName).toBe("Test");
    });

    test("returns 404 when user missing in database", async () => {
      (authService.getUserById as jest.Mock).mockResolvedValue(null);

      const req = { user: { id: "missing" } } as Request;
      const res = mockRes();

      await getProfile(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});