import { Router } from "express";
import * as registrationService from './service/registration.service.js';
import * as loginService from './service/login.service.js';
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from './auth.validation.js';
import * as forgotPassword from "./service/forgotPassword.service.js"


const router = Router();

router.post("/signup", validation(validators.signupValidationSchema) , registrationService.signup);
router.patch("/confirm_email", validation(validators.confirmEmailValidationSchema) , registrationService.VerifyConfirmEmail);
router.patch("/sendCode_confirm_email", validation(validators.sendCodeOTPVerifyConfirmEmailValidationSchema) , registrationService.sendCodeOTPVerifyConfirmEmail);

router.post("/login", validation(validators.loginValidationSchema) , loginService.login);

// login to email
router.post("/loginWithGmail" , loginService.signIn);

router.get("/refreshToken" , loginService.refreshToken);

// forgotPassword OTP
router.patch("/forgot_Password" ,validation(validators.forgotPasswordValidationSchema) ,forgotPassword.forgotPasswordOTP);
router.patch("/reset_Password" , validation(validators.resetPasswordOTPValidationSchema) ,forgotPassword.resetPasswordOTP);




export default router;

