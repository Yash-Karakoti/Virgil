/** @format */

import z from "zod";

const phoneNumber = z
  .string()
  .regex(/^\d{10}$/, "Phone number must be exactly 10 digits");

export const signInSchema = z.object({
  phoneNumber,
  password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z.object({
  phoneNumber,
  password: z.string().min(6, "Password must be at least 6 characters long"),
  name: z.string().trim().min(2, "Name is required"),
  address: z.string().trim().min(5, "Address is required"),
});
