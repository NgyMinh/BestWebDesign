import { body } from "express-validator";

export const registerValidator = [
    body("username").trim().isLength({ min: 2 }).withMessage("Tên tối thiểu 2 ký tự"),
    body("email").isEmail().withMessage("Email không hợp lệ"),
    body("password").isLength({ min: 6 }).withMessage("Mật khẩu tối thiểu 6 ký tự")
];

export const loginValidator = [
    body("email").isEmail().withMessage("Email không hợp lệ"),
    body("password").notEmpty().withMessage("Thiếu mật khẩu")
];
