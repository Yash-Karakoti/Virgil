/** @format */

import { describe, expect, test, beforeEach, jest } from "@jest/globals";
import bcrypt from "bcryptjs";
import { AuthService } from "../auth.service";
import { prisma } from "../../lib/db";

jest.mock("../../lib/db");
jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService();
    jest.clearAllMocks();
  });

  describe("signIn", () => {
    test("throws when user is not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.signIn("9876543210", "pass")).rejects.toThrow(
        "Invalid phone number or password"
      );
    });

    test("throws when password does not match", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "u1",
        contactNo: "9876543210",
        password: "hashed",
        fullName: "Test",
        address: "Addr",
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.signIn("9876543210", "wrong")).rejects.toThrow(
        "Invalid phone number or password"
      );
    });

    test("returns token and user on success", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "u1",
        contactNo: "9876543210",
        password: "hashed",
        fullName: "Test User",
        address: "12 Main St",
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.signIn("9876543210", "correct");

      expect(result.user.fullName).toBe("Test User");
      expect(typeof result.token).toBe("string");
      expect(result.token.length).toBeGreaterThan(10);
    });
  });

  describe("signUp", () => {
    test("throws when phone already registered", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "existing" });
      await expect(
        service.signUp("9876543210", "secret12", "Name", "Address here")
      ).rejects.toThrow("User with this phone number already exists");
    });

    test("hashes password and creates user", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: "new-user",
        contactNo: "9876543210",
        fullName: "Name",
        address: "Address here",
      });

      const result = await service.signUp(
        "9876543210",
        "secret12",
        "Name",
        "Address here"
      );

      expect(bcrypt.hash).toHaveBeenCalledWith("secret12", 12);
      expect(result.user.id).toBe("new-user");
      expect(typeof result.token).toBe("string");
    });
  });
});