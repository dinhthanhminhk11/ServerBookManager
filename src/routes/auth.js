import { Router } from 'express';
import User from '../controller/auth';

const router = Router();
router.post('/auth/register',  User.register);
router.post('/auth/login' , User.login)

export default router;