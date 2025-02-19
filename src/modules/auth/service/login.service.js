import {userModel} from "../../../DB/model/User.model.js";
import { roleTypes } from '../../../middleware/auth.middleware.js';
import { errorAsyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from '../../../utils/response/success.response.js';
import {  decodeToken, generateToken2, tokenTypes, verifyToken2 } from "../../../utils/token/token.js";
import { compareHash, generateHash } from "../../../utils/security/hash.security.js";
import * as dbService from '../../../DB/db.service.js';



export const login = errorAsyncHandler(
    async (req, res, next) => {

        const { email , password} = req.body;
        
        // const user = await userModel.findOne({email});
        const user = await dbService.findOne({
            model: userModel,
            filter: {email}
        });

        if(!user){
            return next(new Error("In_valid account user not found" , {cause: 404}));
        }
        if(!user.confirmEmail){
            return next(new Error("In_valid account user not confirmEmail" , {cause: 401}));
        }
        const match = compareHash({
            plainText: password,
            hashValue: user.password
        }) // match password and hash password   // password to frontend and hash password to DB
        
        if(!match){
            return next(new Error("In_valid account password not match" ,{cause: 404}));
        }
        
        user.deleted = false;
        await user.save();
        
        
        const accessToken = generateToken2({
            payload: {id:user._id , isLoggedIn :true},
            signature: user.role ===  roleTypes.Admin ? process.env.SYSTEM_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN 
        })
        const refreshToken = generateToken2({
            payload: {id:user._id , isLoggedIn :true},
            signature: user.role === roleTypes.Admin ? process.env.SYSTEM_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN ,
            options: {expiresIn: process.env.SYSTEM_EXPIREINTOKEN}
        })
        return successResponse({ res, message:"Welcome User to your account (login)", status:200 ,
            data: {
                token: {
                    accessToken,
                    refreshToken
                }
            }
        });
    }
);


export const refreshToken = errorAsyncHandler(
    async (req , res , next) => {
        
        const user = await decodeToken({authorization: req.headers.authorization , tokenType: tokenTypes.refresh , next})

        const accessToken = generateToken2({
            payload: {id:user._id , isLoggedIn :true},
            signature: user.role ===  roleTypes.Admin ? process.env.SYSTEM_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN 
        })
        const refreshToken = generateToken2({
            payload: {id:user._id , isLoggedIn :true},
            signature: user.role === roleTypes.Admin ? process.env.SYSTEM_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN ,
            options: {expiresIn: process.env.SYSTEM_EXPIREINTOKEN}
        })

        return successResponse({ res, message:"Welcome User to your account (refresh token success)", status:200 ,
            data: {
                token: {
                    accessToken,
                    refreshToken
                }
            }
        });

    }
);



