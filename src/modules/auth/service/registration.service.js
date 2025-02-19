import {userModel}  from '../../../DB/model/User.model.js';
import { emailEvent } from './../../../utils/events/sendEmailEvent.js';
import { errorAsyncHandler } from '../../../utils/response/error.response.js';
import { successResponse } from '../../../utils/response/success.response.js';
import { decodeEncryption, generateEncryption } from './../../../utils/security/encryption.security.js';
import { compareHash, generateHash } from '../../../utils/security/hash.security.js';
import * as dbService from '../../../DB/db.service.js';



export const signup = errorAsyncHandler(
    // async return Promise  عشان الموضوع يكون Valid  بالنسبة الايرور بتاعى 
    async (req, res, next) => {
        //confirmPassword not save in DB
        const {userName , email , password ,confirmPassword , phone} = req.body;

        if (password !== confirmPassword ){
            return next(new Error("password and confirmPassword not match" , {cause: 400}))
        }
        
        if(await dbService.findOne({model: userModel ,filter: {email}})){
            // new Error هنا عشان بيظهر ايرور فى مكان الملف بتاعى 
            return next(new Error("user already exist" , {cause: 409})); 
        }

        // Encrypt phone
        const encryptedPhone = generateEncryption({
            plainText: phone
        });

        //Hash Password
        const hashPassword =generateHash({
            plainText: password
        }); //Hash Password

        const user = await dbService.create({
            model: userModel,
            data: {userName , email , password: hashPassword , phone:encryptedPhone}
        });

        emailEvent.emit("sendConfirmEmail" , {id: user._id ,email , password} )

        return successResponse({ res, message: "user created" , status:201 , data: {user:user._id}})
    }
);

//VerifyConfirmEmail to send code 

export const  VerifyConfirmEmail = errorAsyncHandler(
    async (req , res , next) => {
        const {email , code} = req.body;

        // const user = await userModel.findOne({email});
        const user = await dbService.findOne({model: userModel ,filter: {email}});

        if(!user){
            return next(new Error("Email not found" , {cause: 404}));
        }

        if(user.confirmEmail){
            return next(new Error("Email already confirm" , {cause: 409}));
        }

        if (user.otpBlockedUntil && user.otpBlockedUntil > new Date()) {
            const remainingTime = Math.ceil((user.otpBlockedUntil - new Date()) / 60000);
            return next(new Error(`To many failed attempts. Please try again in ${remainingTime} minutes.`, { cause: 400 }));
        }
        
        if(new Date() > user.otpExpiresAt){
            return next(new Error("OTP expired", { cause: 400 }));
        }

        if(!compareHash({plainText: `${code}` , hashValue: user.emailOTP})){
            const counterOtpAttempts = (user.otpAttempts || 0) + 1;

            if (counterOtpAttempts >= 5) {
                // 5 minutes block user
                await userModel.updateOne({ email }, {  
                    otpBlockedUntil: new Date(Date.now() + 5 * 60000), 
                    otpAttempts: 0 
                });
                return next(new Error("To many failed attempts. Please try again in 5 minutes.", { cause: 400 }));
            }
            await userModel.updateOne({ email }, { otpAttempts: counterOtpAttempts });
            return next(new Error( 
                    `Invalid OTP code, please check code to email, Attempts remaining: ${counterOtpAttempts - 0} / 5 `, 
                    { cause: 400 }
                )
            );
        }
        await dbService.updateOne({
            model: userModel,
            filter: {email} , 
            data: { 
                confirmEmail: true ,$unset: {emailOTP: 1 , otpExpiresAt: 1, otpBlockedUntil: 1}  ,
                $set: { otpAttempts: 0} 
            }
        })

        return successResponse({ res, message: "Welcome User to your account (confirmEmail)" , status:200 , data: {}});
    }
);


export const sendCodeOTPVerifyConfirmEmail = errorAsyncHandler(
    async (req , res , next) => {
        const {email} = req.body;

        const user = await dbService.findOne({model: userModel ,filter: {email}});
        if (!user) {
            return next(new Error("Email not found", { cause: 404 }));
        }

        emailEvent.emit("sendConfirmEmail" , {id: user._id , email} )

        return successResponse({
            res,
            message: "A new OTP has been sent to your email.",
            status: 200,
        });
    }
);


