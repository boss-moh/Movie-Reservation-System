import bcrypt from 'bcrypt';
import { SALT_ROUNDS } from '@/config';

export async function getHashPassword(password: string): Promise<string> {
 const salt = await bcrypt.genSalt(SALT_ROUNDS);
   const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}