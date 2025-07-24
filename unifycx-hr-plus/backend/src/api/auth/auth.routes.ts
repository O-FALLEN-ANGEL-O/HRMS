
import { Router } from 'express';
import * as authController from './auth.controller';
import { validateLogin } from './auth.dto';

const router = Router();

router.post('/login', validateLogin, authController.login);

export default router;
