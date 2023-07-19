import book from "../models/book";
import { formatResponseError, formatResponseSuccess, formatResponseSuccessNoData } from '../config';
import category from "../models/category";

class Book {
    async addBook(req, res) {
        try {
            const checkBook = await book.findOne({ name: req.body.name })
            if (checkBook) {
                return res.status(200).json(
                    formatResponseError({ code: '404' }, false, 'Sách đã tồn tại')
                );
            }

            const dataBook = {
                name: req.body.name,
                price: req.body.price,
                discount: req.body.discount,
                idCategory: req.body.idCategory
            }
            const resault = await new book(dataBook).save()

            if (resault) {
                console.log(resault)
                res.status(200).json(formatResponseSuccess(resault, true, 'Thêm thành công'));
            }

        } catch (error) {
            console.log(error)
            return res.status(200).json(
                formatResponseError({ code: '404' }, false, 'server error')
            );
        }
    }

    async deleteBook(req, res) {
        try {
            const data = await book.findOneAndDelete({ _id: req.params.id })
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

    async getAllBook(req, res) {
        try {
            const dataSuccess = []
            const data = await book.find()
            data.forEach(async (item) => {
                const dataCatogory = await category.findById({ _id: item.idCategory })
                const result = {
                    _id : item._id,
                    name: item.name,
                    price: item.price,
                    discount: item.discount,
                    nameCategory: dataCatogory.name
                }
                dataSuccess.push(result)
            })
            setTimeout(() => {
                res.status(200).json(formatResponseSuccess(dataSuccess.reverse(), true, 'Lấy danh sách thành công'));
            }, 1000)
        } catch (error) {
            console.log(error)
            return res.status(200).json(
                formatResponseError({ code: '404' }, false, 'server error')
            );
        }
    }

    async updateBook(req, res) {
        try {
            const dataUpdate = await book.updateOne({ _id: req.params.id }, {
                name: req.body.name,
                price: req.body.price,
                discount: req.body.discount,
                idCategory: req.body.idCategory
            })
            if (dataUpdate) {
                console.log(dataUpdate)
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

export default new Book();