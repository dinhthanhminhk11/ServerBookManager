import User from '../models/user';
import loanslipModel from '../models/loanslip';
import category from '../models/category';
import book from '../models/book';

import { formatResponseError, formatResponseSuccess, formatResponseSuccessNoData } from '../config';
import loanslip from './loanslip';
const bcyrpt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);
// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Directory where uploaded files will be stored
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const fileFilter = (req, file, cb) => {
    // Check if the file is an image
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed!'), false);
    }
};

const upload = multer({ storage, fileFilter });

class Auth {
    async register(req, res) {
        try {
            upload.single('image')(req, res, async (err) => {
                const checkEmail = await User.findOne({ username: req.body.username, role: 0 });
                if (checkEmail) {
                    return res.status(200).json(formatResponseError({ code: '404' }, false, 'Tài khoản đã được đăng kí'));
                }
                if (err instanceof multer.MulterError) {
                    return res.status(200).json(formatResponseError({ code: '404' }, false, 'Error uploading image'));
                } else if (err) {
                    console.log(err)
                    return res.status(200).json(formatResponseError({ code: '404' }, false, 'Error processing image'));
                }

                const passHash = bcyrpt.hashSync(req.body.password, 10);
                const dataUser = {
                    fullName: req.body.fullName,
                    username: req.body.username,
                    password: passHash,
                    image: `${req.file.filename}`,
                };
                const result = await new User(dataUser).save();
                const data = {
                    id: result.id,
                    fullName: result.fullName,
                    image: `${req.file.filename}`,
                    username: result.username,
                    role: result.role,
                };

                if (result) {
                    res.status(200).json(formatResponseSuccess(data, true, 'Đăng kí thành công'));
                }
            });
        } catch (error) {
            console.log(error);
            return res.status(200).json(formatResponseError({ code: '404' }, false, 'server error'));
        }
    }

    async updateUser(req, res) {
        try {
            upload.single('image')(req, res, async (err) => {
                const user = await User.findOne({ username: req.body.username });

                if (!user) {
                    return res.status(404).json(formatResponseError({ code: '404' }, false, 'Người dùng không tồn tại'));
                }
                if (req.file) {
                    if (user.image) {
                        const oldImagePath = `./uploads/${user.image}`;
                        try {
                            await unlinkFile(oldImagePath);
                        } catch (error) {
                            console.log('Lỗi khi xóa hình ảnh cũ:', error);
                        }
                    }
                    user.image = req.file.filename;
                }
                if (req.body.fullName) {
                    user.fullName = req.body.fullName;
                }
                const updatedUser = await user.save();
                const data = {
                    id: updatedUser.id,
                    fullName: updatedUser.fullName,
                    image: req.file ? req.file.filename : user.image,  
                    username: updatedUser.username,
                    role: updatedUser.role,
                };
        
                res.status(200).json(formatResponseSuccess(data, true, 'Cập nhật thành công'));
            })
        } catch (error) {
            console.log(error);
            return res.status(200).json(formatResponseError({ code: '404' }, false, 'server error'));
        }
    }

    async login(req, res) {
        try {
            const checkEmail = await User.findOne({ username: req.body.username });
            if (!checkEmail) {
                return res.status(200).json(formatResponseError({ code: '404' }, false, 'Tài khoản chưa được đăng kí'));
            }
            const checkPass = bcyrpt.compareSync(req.body.password, checkEmail.password);
            if (!checkPass) {
                return res
                    .status(200)
                    .json(formatResponseError({ code: '404' }, false, 'Tài khoản hoặc mật khẩu không chính xác'));
            }
            const data = {
                id: checkEmail.id,
                fullName: checkEmail.fullName,
                image: checkEmail.image,
                username: checkEmail.username,
                role: checkEmail.role,
            };
            res.status(200).json(formatResponseSuccess(data, true, 'Đăng nhập thành công'));
        } catch (error) {
            console.log(error);
            return res.status(200).json(formatResponseError({ code: '404' }, false, 'server error'));
        }
    }

    async changePassword(req, res) {
        try {
            const user = await User.findOne({ username: req.body.username });
    
            if (!user) {
                return res.status(404).json(formatResponseError({ code: '404' }, false, 'Người dùng không tồn tại'));
            }
            const newPasswordHash = bcyrpt.hashSync(req.body.password, 10);
            user.password = newPasswordHash;
            await user.save();
    
            return res.status(200).json(formatResponseSuccess(null, true, 'Đổi mật khẩu thành công'));
        } catch (error) {
            console.log(error);
            return res.status(500).json(formatResponseError({ code: '500' }, false, 'Lỗi server'));
        }
    }

    async deleteAccount(req, res) {
        try {
            const user = await User.findOne({ username: req.params.id, role: 0 });
            if (!user) {
                return res.status(404).json(formatResponseError({ code: '404' }, false, 'Người dùng không tồn tại'));
            }
            if (user.image) {
                const imagePath = `./uploads/${user.image}`;
                try {
                    await unlinkFile(imagePath);
                } catch (error) {
                    console.log('Lỗi khi xóa hình ảnh:', error);
                }
            }
            await User.deleteOne({ _id: user._id });
            return res.status(200).json(formatResponseSuccess(null, true, 'Xóa tài khoản thành công'));
        } catch (error) {
            console.log(error);
            return res.status(500).json(formatResponseError({ code: '500' }, false, 'Lỗi server'));
        }
    }

    async getAllUser(req, res) {
        try {
            const data = await User.find()
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

    async getAllSizeHome(req, res) {
        try {
            const dataUser = await User.find()
            const dataBook = await book.find()
            const dataCatogory = await category.find()
            const dataKLoanSlip = await loanslipModel.find()

            const data ={
                "user" :  dataUser.length,
                "book" :  dataBook.length,
                "category" :  dataCatogory.length,
                "loanSlip" :  dataKLoanSlip.length,
            }
            if (data) {
                res.status(200).json(formatResponseSuccess(data, true, 'Lấy size thành công'));
            }
        } catch (error) {
            console.log(error)
            return res.status(200).json(
                formatResponseError({ code: '404' }, false, 'server error')
            );
        }
    }
}

export default new Auth();