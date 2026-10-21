import { z } from "zod";

export const signupSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(100, "Name is too long"),
  alias: z
    .string()
    .trim()
    .min(2, "Enter your alias / username")
    .max(50, "Alias is too long")
    .regex(/^[A-Za-z0-9._-]+$/, "Use only letters, numbers, dots, dashes or underscores"),
  collegeEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address"),
});

export type SignupInput = z.infer<typeof signupSchema>;
