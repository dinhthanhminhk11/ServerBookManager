import { Router } from 'express';
import book from '../controller/book';
const router = Router();
router.route('/book').post(book.addBook).get(book.getAllBook)
router.route('/book/:id').patch(book.updateBook).delete(book.deleteBook)
export default router;