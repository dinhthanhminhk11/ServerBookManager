import { Router } from 'express';
import User from '../controller/auth';

const router = Router();
router.post('/auth/register',  User.register);
router.post('/auth/login' , User.login)
router.patch('/auth/updateUser' , User.updateUser)
router.patch('/auth/changePassword' , User.changePassword)
router.delete('/auth/:id' , User.deleteAccount)
router.get('/auth' , User.getAllUser)
router.get('/sizeHome' , User.getAllSizeHome)
export default router;