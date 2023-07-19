import User from '../models/user';
import { formatResponseError, formatResponseSuccess, formatResponseSuccessNoData } from '../config';
const bcyrpt = require('bcrypt');
const multer = require('multer');
const path = require('path');

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
                    image: {
                        data: req.file.buffer,
                        contentType: req.file.mimetype,
                    },
                };
                const result = await new User(dataUser).save();
                const data = {
                    id: result.id,
                    fullName: result.fullName,
                    image: `http://localhost:8080/uploads/${req.file.filename}`,
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
}

export default new Auth();