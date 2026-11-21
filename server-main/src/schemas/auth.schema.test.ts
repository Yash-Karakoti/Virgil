/** @format */

import { describe, expect, test } from "@jest/globals";
import { signInSchema, signUpSchema } from "./auth.schema";

describe("signInSchema", () => {
  test("accepts valid credentials", () => {
    const result = signInSchema.safeParse({
      phoneNumber: "9876543210",
      password: "secret12",
    });
    expect(result.success).toBe(true);
  });

  test("rejects invalid phone numbers", () => {
    expect(
      signInSchema.safeParse({ phoneNumber: "123", password: "x" }).success
    ).toBe(false);
    expect(
      signInSchema.safeParse({ phoneNumber: "abcdefghij", password: "x" })
        .success
    ).toBe(false);
  });

  test("rejects empty password", () => {
    expect(
      signInSchema.safeParse({ phoneNumber: "9876543210", password: "" })
        .success
    ).toBe(false);
  });
});

describe("signUpSchema", () => {
  const valid = {
    phoneNumber: "9876543210",
    password: "secret12",
    name: "Gaurav Kumar",
    address: "12 Lake View Road, Delhi",
  };

  test("accepts valid signup payload", () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true);
  });

  test("rejects short password", () => {
    expect(
      signUpSchema.safeParse({ ...valid, password: "12345" }).success
    ).toBe(false);
  });

  test("trims and validates name and address", () => {
    expect(
      signUpSchema.safeParse({ ...valid, name: " A ", address: " Hi " }).success
    ).toBe(false);
  });
});