import { User } from "@generated/prisma/client";

/**
 * Data required to register a new user.
 */
export interface RegisterDTO {
  name: string;
  email: string;
  password: string; // Plain text password from the client
}

/**
 * Data required to authenticate an existing user.
 */
export interface LoginDTO {
  email: string;
  password: string;
}

/**
 * Standard response structure for an authenticated user.
 * Excludes sensitive fields like hashPassword and keyForHashing.
 */
export interface AuthResponseDTO {
  accessToken: string;
  refreshToken: string;
  user: User

}
