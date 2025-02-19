import {EventEmitter} from 'node:events';
import { sendEmail, subjectTypes, verifyEmailTemplate } from './../email/sendEmail.js';
import { nanoid , customAlphabet } from 'nanoid';
import {userModel} from '../../DB/model/User.model.js';
import { generateHash } from '../security/hash.security.js';
import * as dbService from '../../DB/db.service.js';

// nanoid to ES6 not ES5


export const emailEvent = new EventEmitter();


const sentCode = async ({data , subject = subjectTypes.confirmEmail} = {}) => {
    const {id ,email , password} = data;
    
    const otp = customAlphabet('1234567890' , 6)();
    console.log("Generated OTP:", otp);

    const html = verifyEmailTemplate({code: otp , email , password})
    const hash = generateHash({plainText: otp });

    const otpExpiresAt = new Date(Date.now() + 2 * 60 *1000);

    let dataUpdate = {};

    switch (subject){
        case subjectTypes.confirmEmail:
            dataUpdate = {emailOTP: hash}
            break;
        case subjectTypes.forgotPassword:
            dataUpdate =  {forgotPasswordOTP: hash}
            break;
        case subjectTypes.updateEmail:
            dataUpdate = {updateEmailOTP: hash}
            break;
        default:
            break;
    }

    await dbService.updateOne({
        model: userModel,
        filter: {_id: id },
        data: {
            ...dataUpdate, otpExpiresAt, otpAttempts: 0 
        }
    })
    
    await sendEmail({to: email , subject , html});
};



//VerifyConfirmEmail to send code & forgotPassword

emailEvent.on("sendConfirmEmail" , async (data) => {
    await sentCode({data , subject: "Confirm-Email"})
});


emailEvent.on("sendCodeOTP" , async (data) => {
    await sentCode({ data , subject: "Forgot-Password"})
});

emailEvent.on("sendUpdateEmail" , async (data) => {
    await sentCode({ data , subject: "Update-Email"})
});

