
import jwt from 'jsonwebtoken';

function getJwtSecret(): string {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in the environment variables');
  }
  return JWT_SECRET;
}

function getJwtExpiresIn(): string {
  return process.env.JWT_EXPIRES_IN || '1d';
}

export function generateToken(employeeId: string, role: string): string {
  const secret = getJwtSecret();
  const expiresIn = getJwtExpiresIn();
  
  return jwt.sign({ id: employeeId, role }, secret, {
    expiresIn: expiresIn,
  });
}

export function verifyToken(token: string) {
  const secret = getJwtSecret();
  return jwt.verify(token, secret);
}
