import { Router } from 'express';
import category from '../controller/category';
const router = Router();
router.route('/category').post(category.addCategory).get(category.getAllCategory)
router.route('/category/:id').patch(category.updateCategory).delete(category.deleteCategory)
export default router;