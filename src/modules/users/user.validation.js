import joi from 'joi';
import { generalFields } from '../../middleware/validation.middleware.js';



export const updateProfileValidation = joi.object().keys({
    userName: generalFields.userName,
    phone: generalFields.phone,
    gender: generalFields.gender,
    DOB: generalFields.DOB
}).required();


export const updatePasswordValidation = joi.object().keys({
    oldPassword: generalFields.password.required(),
    password: generalFields.password.not(joi.ref('oldPassword')).required(),
    confirmPassword: generalFields.confirmPassword.valid(joi.ref('password')).required(),
}).required();


export const updateEmailValidation = joi.object().keys({
    email: generalFields.email.required(),
}).required();


export const replaceEmailValidation = joi.object().keys({
    oldEmailCode: generalFields.code.required(), // email code القديم  (email code القديم )
    code: generalFields.code.required(), // code الجديد (email update code)
}).required();


export const shareProfileValidation = joi.object().keys({
    userId: generalFields.id.required(),
}).required();


