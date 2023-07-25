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
            const data = await loanslip.find().populate('idBook', 'name');
            if (data) {
                const modifiedData = data.map(item => {
                    return {
                        ...item.toObject(),
                        nameBook: item.idBook.name,
                        idBook: undefined,
                    };
                });

                res.status(200).json(formatResponseSuccess(modifiedData, true, 'Lấy danh sách thành công'));
            }
        } catch (error) {
            console.log(error);
            return res.status(200).json(formatResponseError({ code: '404' }, false, 'server error'));
        }
    }

    async updateLoanSlipStatus(req, res) {
        try {
            const dataUpdate = await loanslip.updateOne({ _id: req.params.id }, { actualPaymentDate: Date.now(), isPay: true });

            if (dataUpdate) {
                const dataResponse = await loanslip.findById(req.params.id).populate('idBook', 'name');
                const modifiedData = {
                    ...dataResponse._doc,
                    nameBook: dataResponse.idBook.name,
                    idBook: dataResponse.idBook._id
                };

                delete modifiedData.idBook;

                res.status(200).json(formatResponseSuccess(modifiedData, true, 'Cập nhật thành công'));
            }
        } catch (error) {
            console.log(error)
            return res.status(200).json(
                formatResponseError({ code: '404' }, false, 'server error')
            );
        }
    }

    async getPopularBooks(req, res) {
        try {
            const result = await loanslip.aggregate([
                {
                    $match: { isPay: true },
                },
                {
                    $group: {
                        _id: "$idBook",
                        size: { $sum: 1 },
                    },
                },
                {
                    $lookup: {
                        from: "books", // Tên collection của bảng Book (collection)
                        localField: "_id",
                        foreignField: "_id",
                        as: "bookInfo",
                    },
                },
                {
                    $project: {
                        _id: 0,
                        nameBook: { $arrayElemAt: ["$bookInfo.name", 0] },
                        size: 1,
                    },
                },
            ]);

            if (result.length > 0) {
                res.status(200).json(result);
            } else {
                res.status(404).json({ message: "No popular books found." });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error." });
        }
    }

    async getREvene(req, res) {
        try {
            const startDate = parseInt(req.query.startDate);
            const endDate = parseInt(req.query.endDate);

            const result = await loanslip.aggregate([
                {
                    $match: {
                        $or: [
                            { $and: [{ isPay: false }, { borrowedDate: { $gte: startDate, $lte: endDate } }] },
                            { $and: [{ isPay: true }, { payDay: { $gte: startDate, $lte: endDate } }] },
                        ],
                    },
                },
                {
                    $group: {
                        _id: null,
                        unpaidAmount: {
                            $sum: {
                                $cond: [{ $and: [{ $eq: ["$isPay", false] }, { $gte: ["$borrowedDate", startDate] }, { $lte: ["$borrowedDate", endDate] }] }, 1, 0],
                            },
                        },
                        amountPaid: {
                            $sum: {
                                $cond: [{ $and: [{ $eq: ["$isPay", true] }, { $gte: ["$payDay", startDate] }, { $lte: ["$payDay", endDate] }] }, 1, 0],
                            },
                        },
                        totalMoney: {
                            $sum: {
                                $cond: [{ $eq: ["$isPay", true] }, "$price", 0],
                            },
                        },
                    },
                },
            ]);

            if (result.length > 0) {
                const combinedResult = {
                    unpaidAmount: result.reduce((acc, item) => acc + item.unpaidAmount, 0),
                    amountPaid: result.reduce((acc, item) => acc + item.amountPaid, 0),
                    totalMoney: result.reduce((acc, item) => acc + item.totalMoney, 0),
                };

                res.status(200).json(formatResponseSuccess(combinedResult, true, 'Lấy thành công'));
            } else {
                res.status(200).json(formatResponseSuccess(null, false, 'Không tìm thấy sách phổ biến.'));
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error." });
        }
    }

}

export default new Loanslip();