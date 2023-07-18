import category from "../models/category";
import { formatResponseError, formatResponseSuccess, formatResponseSuccessNoData } from '../config';

class Category {
    async addCategory(req, res) {
        try {
            const checkCategory = await category.findOne({ name: req.body.name })
            if (checkCategory) {
                return res.status(200).json(
                    formatResponseError({ code: '404' }, false, 'Loại sách đã tồn tại')
                );
            }

            const dataCatogory = {
                name: req.body.name
            }
            const resault = await new category(dataCatogory).save()

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

    async deleteCategory(req, res) {
        try {
            const data = await category.findOneAndDelete({ _id: req.params.id })
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

    async getAllCategory(req, res) {
        try {
            const data = await category.find()
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

    async updateCategory(req, res) {
        try {
            const dataUpdate = await category.updateOne({ _id: req.params.id }, { name: req.body.name })
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


export default new Category();