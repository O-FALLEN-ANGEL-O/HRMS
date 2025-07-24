
import { Router } from 'express';
import { register, login, getMe } from './auth.controller';
import { validate } from '@/middleware/validate';
import { registerSchema, loginSchema } from './auth.dto';
import { protect } from '@/middleware/authHandler';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', protect, getMe);

export default router;
