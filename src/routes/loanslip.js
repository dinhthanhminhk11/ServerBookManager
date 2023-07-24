import { Router } from 'express';
import loanslip from '../controller/loanslip';
const router = Router();
router.route('/loanslip').post(loanslip.addLoanslip).get(loanslip.getAllLoanslip)
router.route('/loanslip/updateStatus/:id').patch(loanslip.updateLoanSlipStatus)
router.route('/loanslip/:id').delete(loanslip.deleteLoanslip)
router.route('/getTopMost').get(loanslip.getPopularBooks)
export default router