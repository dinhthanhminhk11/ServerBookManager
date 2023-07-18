import User from '../models/user';
import { formatResponseError, formatResponseSuccess, formatResponseSuccessNoData } from '../config';
const bcyrpt = require('bcrypt');

class Auth {
    async register(req, res) {
        try {
            const checkEmail = await User.findOne({ username: req.body.username, role: 0 })
            if (checkEmail) {
                return res.status(200).json(
                    formatResponseError({ code: '404' }, false, 'Tài khoản đã được đăng kí')
                );
            }
            const passHass = bcyrpt.hashSync(req.body.password, 10)
            const dataUser = {
                fullName: req.body.fullName,
                username: req.body.username,
                password: passHass
            }
            const resault = await new User(dataUser).save()
            const data = {
                id: resault.id,
                fullName: resault.fullName,
                image: resault.image,
                username: resault.username,
                role: resault.role
            }
            if (resault) {
                res.status(200).json(formatResponseSuccess(data, true, 'Đăng kí thành công'));
            }
        } catch (error) {
            console.log(error)
            return res.status(200).json(
                formatResponseError({ code: '404' }, false, 'server error')
            );
        }
    }

    async login(req, res) {
        try {
            const checkEmail = await User.findOne({ username: req.body.username })
            if (!checkEmail) {
                return res.status(200).json(
                    formatResponseError({ code: '404' }, false, 'Tài khoản chưa được đăng kí')
                );
            }
            const checkPass = bcyrpt.compareSync(req.body.password, checkEmail.password)
            if (!checkPass) {
                return res.status(200).json(
                    formatResponseError({ code: '404' }, false, 'Tài khoản hoặc mật khẩu không chính xác')
                )
            }
            const data = {
                id: checkEmail.id,
                fullName: checkEmail.fullName,
                image: checkEmail.image,
                username: checkEmail.username,
                role: checkEmail.role
            }
            res.status(200).json(formatResponseSuccess(data, true, 'Đăng nhập thành công'));
        } catch (error) {
            console.log(error)
            return res.status(200).json(
                formatResponseError({ code: '404' }, false, 'server error')
            );
        }
    }
}

export default new Auth();


