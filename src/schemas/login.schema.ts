import { z } from "zod";

const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .min(3, "Email must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

function validateLoginData(data: any) {
  try {
    return loginSchema.parse(data);
  } catch (error: any) {
    throw error;
  }
}
export { validateLoginData };
