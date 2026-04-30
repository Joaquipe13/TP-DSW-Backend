import argon2 from "argon2";

export async function encryptPassword(password: string): Promise<string> {
  try {
    const hashedPassword = await argon2.hash(password);
    return hashedPassword;
  } catch (error) {
    throw new Error("Error while hashing the password");
  }
}
export async function verifyPassword(
  storedHash: string,
  password: string
): Promise<boolean> {
  try {
    const isMatch = await argon2.verify(storedHash, password);
    return isMatch;
  } catch (error) {
    throw new Error("Error while verifying the password");
  }
}
