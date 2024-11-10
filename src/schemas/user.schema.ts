import { z } from "zod";

const userSchema = z.object({
  dni: z
    .string()
    .length(8, { message: "El DNI debe tener exactamente 8 dígitos" }) // Verifica la longitud
    .refine((value) => /^\d+$/.test(value), {
      message: "El DNI debe contener solo números",
    }),
  name: z.string().min(1, "Name is required"),
  surname: z.string().min(1, "Surname is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  admin: z.boolean().default(false),
});

const userToPatchSchema = z.object({
  dni: z
    .string()
    .length(8, { message: "El DNI debe tener exactamente 8 dígitos" }) // Verifica la longitud
    .refine((value) => /^\d+$/.test(value), {
      message: "El DNI debe contener solo números",
    })
    .optional(),
  name: z.string().optional(),
  surname: z.string().optional(),
  email: z.string().optional(),
  password: z.string().optional(),
  admin: z.boolean().default(false).optional(),
});

function validateUser(object: any) {
  try {
    return userSchema.parse(object);
  } catch (error: any) {
    throw error.errors;
  }
}

function validateUserToPatch(object: any) {
  try {
    return userToPatchSchema.parse(object);
  } catch (error: any) {
    throw error;
  }
}

export { validateUser, validateUserToPatch };
