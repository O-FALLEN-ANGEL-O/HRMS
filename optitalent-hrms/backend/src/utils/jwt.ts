
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment variables');
}

export function generateToken(employeeId: string, role: string): string {
  return jwt.sign({ id: employeeId, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN || '1d',
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}
