import loanslip from '../models/loanslip';
import { formatResponseError, formatResponseSuccess, formatResponseSuccessNoData } from '../config';

class Loanslip {
    async addLoanslip(req, res) {
        try {
            let ts = Date.now();
            const checkLoanSlip = await loanslip.findOne({ phoneUser: req.body.phoneUser, idBook: req.body.idBook })
            if (checkLoanSlip) {
                return res.status(200).json(
                    formatResponseError({ code: '404' }, false, 'Số điện thoại này đã có người sử dụng để mượn sách này')
                )
            }

            const dataLoanSlip = {
                nameUser: req.body.nameUser,
                phoneUser: req.body.phoneUser,
                idBook: req.body.idBook,
                price: req.body.price,
                borrowedDate: Date.now(),
                payDay: req.body.payDay
            }
            const resault = await new loanslip(dataLoanSlip).save()

            if (resault) {
                res.status(200).json(formatResponseSuccess(resault, true, 'Thêm thành công'));
            }
        } catch (error) {
            console.log(error)
            return res.status(200).json(
                formatResponseError({ code: '404' }, false, 'server error')
            );
        }
    }

    async deleteLoanslip(req, res) {
        try {
            const data = await loanslip.findOneAndDelete({ _id: req.params.id })
            if (data) {
                res.status(200).json(formatResponseSuccess(data, true, 'Xóa thành công'));
            }
        } catch (error) {
            console.log(error)
            return res.status(200).json(
                formatResponseError({ code: '404' }, false, 'server error')
            );
        }
    }

    async getAllLoanslip(req, res) {
        try {
            const data = await loanslip.find()
            if (data) {
                res.status(200).json(formatResponseSuccess(data, true, 'Lấy danh sách thành công'));
            }
        } catch (error) {
            console.log(error)
            return res.status(200).json(
                formatResponseError({ code: '404' }, false, 'server error')
            );
        }
    }

    async updateLoanSlipStatus(req, res) {
        try {
            const dataUpdate = await loanslip.updateOne({ _id: req.params.id }, { actualPaymentDate: Date.now(), isPay: true })
            if (dataUpdate) {
                res.status(200).json(formatResponseSuccess(dataUpdate, true, 'Cập nhật thành công'));
            }
        } catch (error) {
            console.log(error)
            return res.status(200).json(
                formatResponseError({ code: '404' }, false, 'server error')
            );
        }
    }

}

export default new Loanslip();