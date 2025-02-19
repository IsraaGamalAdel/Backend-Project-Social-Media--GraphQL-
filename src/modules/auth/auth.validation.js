import joi from 'joi';
import { generalFields } from '../../middleware/validation.middleware.js';



// Joi Schema 
export const signupValidationSchema = joi.object().keys({
        userName: generalFields.userName.required().messages({
            'string.empty': 'userName is required',
        }), // min 2 and max 50 as length
        email: generalFields.email.required(),
        password: generalFields.password.required(),
        confirmPassword: generalFields.confirmPassword.valid(joi.ref('password')).required(),
        phone: generalFields.phone.required(),
        'accept-language': generalFields.acceptLanguage
}).options({allowUnknown: false}).required();

// confirmEmail
export const confirmEmailValidationSchema = joi.object().keys({
        email: generalFields.email.required(),
        code: generalFields.code.required(),
        // code: joi.string().pattern(new RegExp(/^\d{6}$/)).required(), 
}).options({allowUnknown: false}).required();

// confirmEmail send Code
export const sendCodeOTPVerifyConfirmEmailValidationSchema = joi.object().keys({
        email: generalFields.email.required(), 
}).options({allowUnknown: false}).required();

// Login
export const loginValidationSchema = joi.object().keys({
    email: generalFields.email.required(),
    password: generalFields.password.required(),
}).options({allowUnknown: false}).required()

// forgotPassword
export const forgotPasswordValidationSchema = joi.object().keys({
    email: generalFields.email.required(),
}).options({allowUnknown: false}).required()

// resetPassword
export const resetPasswordOTPValidationSchema = joi.object().keys({
    email: generalFields.email.required(),
    code: generalFields.code.required(),
    // code: joi.string().pattern(new RegExp(/^\d{6}$/)).required(),
    password: generalFields.password.required(),
    confirmPassword: generalFields.confirmPassword.valid(joi.ref('password')).required(),
}).options({allowUnknown: false}).required()





// دة احسن طريقة 
export const signupValidationSchema_old = {
    body: joi.object().keys({
        userName: joi.string().required().min(2).max(50).required().messages({
            'string.empty': 'userName is required',
        }), // min 2 and max 50 as length
        email: joi.string().email({minDomainSegments: 2,maxDomainSegments: 3, tlds: {allow: ['com' ,'net' , 'edu']}}).required().messages({
            'string.email': "please enter valid email Ex: example@gmail.com",
            'string.empty': 'email cannot be empty',// not data
            'any.required': 'email is required',  //  لو متبعتش بيانات 
        }),
        password: joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z]).{8,}$/)).required(),
        confirmPassword: joi.string().valid(joi.ref('password')).required(),
        phone: joi.string().pattern(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)).required(),
    }).options({allowUnknown: false}).required(),

    query: joi.object().keys({
        lang: joi.string().valid('en' , 'ar').default('en')
    }).options({allowUnknown: false}).required(),
};



// Joi Schema للتعليم
// const signupValidationSchema = joi.object().keys({
//     userName: joi.string().required().min(2).max(50).required(), // min 2 and max 50 as length
//     email: joi.string().email({minDomainSegments: 2,maxDomainSegments: 3, tlds: {allow: ['com' ,'net' , 'edu']}}).required(),
//     password: joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z]).{8,}$/)).required(),
//     confirmPassword: joi.string().valid(joi.ref('password')).required(),
//     phone: joi.string().pattern(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)).required(),
//     age: joi.number().positive().min(16).max(130),  //min 16 and max 130 as value
//     // DOB: joi.date().greater(new Date()), // greater than current date لو عاوزة اعمل حاجة فى اليوم الى بعدة او الشهر او السنة الى بعدها 
//     // DOB: joi.date().less(new Date()),
//     DOB: joi.date().less("now"),
//     flag: joi.boolean().sensitive(true).falsy(0).truthy(1),
// }).options({allowUnknown: false}).required();




