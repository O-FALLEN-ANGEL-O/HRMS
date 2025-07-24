
import { PrismaClient } from '@prisma/client';

// Ensures a single instance of PrismaClient is used across the application.
const prisma = new PrismaClient();

export default prisma;
