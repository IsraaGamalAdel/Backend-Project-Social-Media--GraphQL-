import { nanoid } from 'nanoid';
import { errorAsyncHandler } from '../../../utils/response/error.response.js';
import { successResponse } from '../../../utils/response/success.response.js';
import { emailEvent } from '../../../utils/events/sendEmailEvent.js';
import {userModel} from '../../../DB/model/User.model.js';
import { compareHash, generateHash } from '../../../utils/security/hash.security.js';
import * as dbService from '../../../DB/db.service.js';


// forgot password OTP

export const forgotPasswordOTP = errorAsyncHandler(
    async (req , res , next) => {
        const {email} = req.body;

        const user = await dbService.findOne({
            model: userModel,
            filter: {email , deleted: false}
        });
        if(!user){
            return next(new Error("In_valid account user not found" , {cause: 404}));
        }

        // if(!user.confirmEmail){
        //     return next(new Error("please verify your email" , {cause: 400}));
        // }  

        emailEvent.emit("sendCodeOTP" ,{id: user._id , email});

        return successResponse({res , message: "verification code sent to your email" , status:200});
    }
);


export const resetPasswordOTP = errorAsyncHandler(
    async (req, res, next) => {
        const { email, code, password, confirmPassword } = req.body;
        
        // const user = await userModel.findOne({ email });
        const user = await dbService.findOne({
            model: userModel,
            filter: { email , deleted: false}
        });
        
        if (!user) {
            return next(new Error("Invalid account: user not found", { cause: 404 }));
        }

        // check user is code blocked
        if (user.otpBlockedUntil && user.otpBlockedUntil > Date.now()) {
            const remainingTime = Math.ceil((user.otpBlockedUntil - Date.now()) / 60000);
            return next(new Error(`Too many failed attempts. Please try again to forget password in ${remainingTime} minutes`, { cause: 400 }));
        }

        // code expired
        if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
            return next(new Error("OTP expired, please forget password again ", { cause: 400 }));
        }

        if (!compareHash({ plainText: code, hashValue: user.forgotPasswordOTP })) {
            const counterOtpAttempts = (user.otpAttempts || 0) + 1;

            if (counterOtpAttempts >= 5) {
                // dbService
                // 5 minutes block user
                await dbService.updateOne({
                    model: userModel,
                    filter: { email },
                    data: { 
                        // otpBlockedUntil: Date.now() + 5 * 60000, 
                        otpBlockedUntil: new Date(Date.now() + 5 * 60000), 
                        otpAttempts: 0 
                    }
                });
                return next(new Error("To many failed attempts. Please try again in 5 minutes.", { cause: 400 }));
            }

            
            // await userModel.updateOne({ email }, { otpAttempts: counterOtpAttempts });
            await dbService.updateOne({
                model: userModel,
                filter: { email },
                data: { otpAttempts: counterOtpAttempts }
            })

            // return next(new Error(`Invalid OTP code. Attempts remaining: ${counterOtpAttempts - 0} , ${5 - counterOtpAttempts}`, { cause: 400 }));
            return next(new Error( 
                    `Invalid OTP code, please check code to email, Attempts remaining: ${counterOtpAttempts - 0} / 5 `, 
                    { cause: 400 }
                )
            );
        }

        if (password !== confirmPassword) {
            return next(new Error("Password and confirmPassword do not match", { cause: 400 }));
        }

        const isPasswordMatch = compareHash({ plainText: password , hashValue: user.password});
        if(isPasswordMatch){
            return next(new Error(`New password match exist password , please password to page login` ,{cause: 400}));
        }

        const hashPassword = generateHash({ plainText: password });

        await dbService.updateOne({
            model: userModel,
            filter: { email },
            data: { password: hashPassword, confirmEmail: true, changeCredentialsTime: Date.now(),
                $unset: {
                    forgotPasswordOTP: 1,
                    otpExpiresAt: 1,
                    otpAttempts: 1,
                    otpBlockedUntil: 1
                }
            },
            // options: { new: true }
        })

        return successResponse({ res, message: "Reset Password Successfully", status: 200 });
    }
);


