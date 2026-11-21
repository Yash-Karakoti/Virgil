import { describe, expect, it } from "vitest";
import { SignInSchema, SignUpSchema } from "./AuthSchema";

describe("SignInSchema", () => {
  it("accepts valid sign-in", () => {
    expect(
      SignInSchema.safeParse({
        phoneNumber: "9876543210",
        password: "secret",
      }).success
    ).toBe(true);
  });

  it("rejects non-numeric phone", () => {
    expect(
      SignInSchema.safeParse({ phoneNumber: "98abcdefgh", password: "x" })
        .success
    ).toBe(false);
  });
});

describe("SignUpSchema", () => {
  const valid = {
    name: "Gaurav",
    phoneNumber: "9876543210",
    address: "12 Lake View Road",
    password: "secret12",
  };

  it("accepts valid sign-up", () => {
    expect(SignUpSchema.safeParse(valid).success).toBe(true);
  });

  it("requires neighbourhood address", () => {
    expect(SignUpSchema.safeParse({ ...valid, address: "123" }).success).toBe(
      false
    );
  });
});