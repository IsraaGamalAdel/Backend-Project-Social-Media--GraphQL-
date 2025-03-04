import { compare } from "bcrypt";
import {userModel} from "../../../DB/model/User.model.js";
import { errorAsyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { decodeEncryption, generateEncryption } from "../../../utils/security/encryption.security.js";
import { compareHash, generateHash } from "../../../utils/security/hash.security.js";
import * as dbService from "../../../DB/db.service.js";
import { emailEvent } from './../../../utils/events/sendEmailEvent.js';
import cloudinary from './../../../utils/multer/cloudinary.js';
import { postModel } from './../../../DB/model/Post.model.js';
import { roleTypes } from "../../../middleware/auth.middleware.js";
import { timeCodeOTP } from './../../../middleware/timeCode.middleware.js';



// Share Profile
export const shareProfile = errorAsyncHandler(
    async (req , res , next) => {
        const {userId} = req.params;

        const user = await dbService.findOne({ 
            model: userModel , 
            filter: {_id: userId , deleted: false},
            select: "userName email DOB phone image"
        });

        if(!user){
            return next(new Error("In-valid account user Id not found" , {cause: 404}));
        }

        if(userId != req.user._id.toString()){
            await dbService.updateOne({
                model: userModel,
                filter: {_id:userId },
                data: {
                    $push: { viewers:{userId: req.user._id , time: Date.now() }}
                }
            })
        }

        user.phone = decodeEncryption({ cipherText: user.phone});
        
        return successResponse({ res, message: "Welcome User to your account (Share Profile)" , status:200 , data: {user}}) 
    }
);

// Profile
export const userProfile = errorAsyncHandler(
    async (req , res , next) => {

        const user = await dbService.findOne({
            model: userModel,
            filter: {_id: req.user._id} ,
            populate: [
                {   
                    path: "viewers.userId" ,select: "userName email DOB phone " 
                },
                {
                    path: "friends" , select: "userName email image DOB phone "
                }
            ]
        })

        // const user = await userModel.findById(req.user._id).select('-__v -_id -password -deleted  -confirmEmail');

        if(!user){
            return next(new Error("In_valid account user not found" , {cause: 404}));
        }
        user.phone = decodeEncryption({
            cipherText: user.phone
        })

        return successResponse({ 
            res, message: "Welcome User to your account (profile)" ,
            status:200 , 
            data: {users: user}
        });
    }
);

// Update Profile
export const UpdateUserProfile = errorAsyncHandler(
    async (req , res , next) => {
        
        if(req.body.phone){
            req.body.phone = generateEncryption({plainText: req.user.phone})
        }

        const user = await dbService.findByIdAndUpdate({
            model: userModel,
            id:  req.user._id,
            data: req.body,
            options: {new : true , runValidators: true}
        })

        return successResponse({ res, message: "Welcome User to your account ( Update profile)" , status:200 , data: {user}});
    }
);

// Update Password
export const UpdatePassword = errorAsyncHandler(
    async (req , res , next) => {
        const {oldPassword , password} = req.body;

        if(!compareHash({plainText: oldPassword , hashValue: req.user.password})){
            return next(new Error("In_valid account user old password not match " ,{cause: 400}));
        }

        const hashPassword = generateHash({plainText: password});

        // !const user  ( مش هنرجع بيانات user عشان من المفروض بخلية يروح على page login )

        await dbService.findByIdAndUpdate({
            model: userModel,
            id: req.user._id,
            data: {password: hashPassword , changeCredentialsTime: Date.now()},
            options: {new: true , runValidators: true}
        })

        return successResponse({ res, message: "Welcome User to your account ( Update password to profile)" , status:200 });
    }
);

// Update Email
export const UpdateEmail = errorAsyncHandler(
    async (req , res , next) => {
        const {email} = req.body;

        if( await dbService.findOne({model: userModel, filter: {email}})){
            return next(new Error(`Email ${email} already exist` , {cause: 409}));
        }

        await dbService.updateOne({
            model: userModel,
            filter: {_id: req.user._id},
            data: {
                tempEmail: email
            }
        })
        emailEvent.emit("sendUpdateEmail" , {id: req.user._id ,email})  //send code to email the new account
        emailEvent.emit("sendConfirmEmail" , {id: req.user._id ,email: req.user.email})  // send code to old account

        return successResponse({ res, message: "Welcome User to your account ( Update password to profile)" , status:200 });
    }
);


export const replaceEmail = errorAsyncHandler(
    async (req , res , next) => {
        const { oldEmailCode , code} = req.body;

        const user = await dbService.findOne({ model: userModel, filter: { _id: req.user._id } });

        if (!user) {
            return next(new Error("User not found", { cause: 404 }));
        }

        if( await dbService.findOne({model: userModel, filter: {email: req.user.tempEmail}})){
            return next(new Error(`Email ${email} already exist` , {cause: 409}));
        }

        // // email code القديم  (email code القديم )
        // if(!compareHash({plainText: oldEmailCode , hashValue: req.user.emailOTP})){
        //     return next(new Error("In_valid account user old email code not match " ,{cause: 400}));
        // }

        // // code الجديد (email update code)
        // if(!compareHash({plainText: code , hashValue: req.user.updateEmailOTP})){
        //     return next(new Error("In_valid  verification code from your new email " ,{cause: 400}));
        // }

        // Validate old email code , email code القديم  (email code القديم )
        await timeCodeOTP(user, oldEmailCode, 'emailOTP');

        // Validate new email code , code الجديد (email update code)
        await timeCodeOTP(user, code, 'updateEmailOTP');

        await dbService.updateOne({
            model: userModel,
            filter: {_id: req.user._id},
            data: {
                email: req.user.tempEmail,
                changeCredentialsTime: Date.now(),
                $unset: {
                    tempEmail: 0,
                    updateEmailOTP: 0,
                    emailOTP: 0
                }
            }
        })

        return successResponse({ res, message: "Welcome User to your account ( Update email to profile)" , status:200 });
    }
);


// Block User
export const blockUser = errorAsyncHandler(
    async (req, res, next) => {
        const { email } = req.body;

        const userToBlock = await userModel.findOne({ email });

        if (!userToBlock) {
            return errorResponse({ res, message: "User not found", status: 404 });
        }
        
        const user = await userModel.findById(req.user._id);
        if (!user.blockedUsers.includes(userToBlock._id)) {
            user.blockedUsers.push(userToBlock._id);
            await user.save();
        }

        return successResponse({ res, message: "User blocked successfully", status: 200 });
    }
);


export const unBlockUser = errorAsyncHandler(
    async (req, res, next) => {
        const { email } = req.body;

        const userToUnblock = await userModel.findOne({ email });

        if (!userToUnblock) {
            return errorResponse({ res, message: "User not found", status: 404 });
        }

        const user = await userModel.findById(req.user._id);

        if (user.blockedUsers.includes(userToUnblock._id)) {
            user.blockedUsers = user.blockedUsers.filter(
                (blockedUser) => blockedUser.toString() !== userToUnblock._id.toString()
            );
            await user.save();
        }

        return successResponse({ res, message: "User unblocked successfully", status: 200 , data: {user} });
    }
);


// Freeze
export const freezeAccount = errorAsyncHandler(
    async (req , res , next) => {
        
        const user = await userModel.findByIdAndUpdate(req.user._id , {deleted:true , changeCredentialsTime: Date.now()} , {new: true})

        return successResponse({ res, message: "Welcome User to your account ( Update profile)" , status:200 , data: {user: user}});
    }
);

// Images
export const updateImages = errorAsyncHandler(
    async (req , res , next) => {

        const {secure_url , public_id} = await cloudinary.uploader.upload(req.file.path , { folder: `users/${req.user._id}`});

        const user = await dbService.findByIdAndUpdate({
            model: userModel,
            id: req.user._id,
            data: {
                image: {secure_url , public_id},
            },
            options: {new: false}
        })

        if(user.image?.public_id){
            await cloudinary.uploader.destroy(user.image.public_id);
        }
        
        return successResponse({ res, message: "Welcome User to your account ( Update images )" , 
            data: {
                file: req.file,
                user
            }
        });
    }
);


export const coverImages = errorAsyncHandler(
    async (req , res , next) => {

        const images = [];

        for (const file of req.files){
            const {secure_url , public_id} = await cloudinary.uploader.upload(file.path , { folder: `users/${req.user._id}/coverImages`});
            images.push({secure_url , public_id})
        }

        const user = await dbService.findByIdAndUpdate({
            model: userModel,
            id: req.user._id,
            // data: { coverImages: req.files.map(file => file.finalPath)},
            data: { coverImages: images},
            options: {new: true}
        })
        
        return successResponse({ res, message: "Welcome User to your account ( Update profile)" , 
            data: {
                file: req.files,
                user
            }
        });
    }
);

// تتمسح ملهاش لزمة بس بعد ما تعدى مرة تانية للفهم !
export const userIdentity = errorAsyncHandler(
    async (req , res , next) => {

        // const user = await dbService.findByIdAndUpdate({
        //     model: userModel,
        //     id: req.user._id,
        //     data: { coverImages: req.files.map(file => file.finalPath)},
        //     options: {new: true}
        // })
        // console.log(req.files);
        
        return successResponse({ res, message: "Welcome User to your account ( Update profile)" , 
            data: {
                file: req.files,

            }
        });
    }
);

// Admin
export const dashBoardAdmin = errorAsyncHandler(
    async (req , res , next) => {

        const data = await Promise.allSettled([
            dbService.findAll({
                model: userModel,
                filter: {}
            }),
            dbService.findAll({
                model: postModel,
                filter: {}
            })
        ])

        return successResponse({ res, message: "get all users and posts" , 
            data: {
                data
            }
        });
    }
);


export const changePrivileges = errorAsyncHandler(
    async (req, res, next) => {
        const { userId, role } = req.body;

        const owner = req.user.role === roleTypes.SuperAdmin ? {} : {
            role: {
                $nin: [roleTypes.Admin, roleTypes.SuperAdmin]
            }
        };

        if (req.user.role === roleTypes.SuperAdmin && role === roleTypes.SuperAdmin) {
            return next(new Error("SuperAdmin can not change role to SuperAdmin", { cause: 400 }));
        }

        const user = await dbService.findOne({
            model: userModel,
            filter: {
                _id: userId,
                deleted: { $exists: false },
                ...owner
            }
        });

        if (!user) {
            return next(new Error("Invalid account user Id not found", { cause: 404 }));
        }

        if (user.role === role) {
            return next(new Error(`User already has the role: ${role}`, { cause: 400 }));
        }

        const decryptedPhone = decodeEncryption({ cipherText: user.phone });

        const updatedUser = await dbService.findOneAndUpdate({
            model: userModel,
            filter: {
                _id: userId,
                deleted: { $exists: false },
                ...owner
            },
            data: {
                role,
                modifiedBy: req.user._id
            },
            options: { new: true }
        });

        return successResponse({
            res,
            message: "User role updated successfully",
            data: {
                user: {
                    ...updatedUser.toObject(),
                    phone: decryptedPhone
                }
            }
        });
    }
);




export const addFriends = errorAsyncHandler(
    async(req ,res , next) => {
        const {friendId} = req.params;

        const friend = await dbService.findOneAndUpdate({
            model: userModel,
            filter: {_id: friendId, deleted: {$exists: false} } ,
            data: {
                $addToSet: { friends: req.user._id}
            },
            options: {new: true}
        })

        if (!friend) {
            return next(new Error("User not found" , {cause: 404}));
        }

        const user = await dbService.findByIdAndUpdate({
            model: userModel,
            id: req.user._id,
            data: {
                $addToSet: { friends: friendId}
            },
            options: {new: true}
        })
        return successResponse({ res, message: "Add Friend Successfully" , 
            data: {
                user
            }
        });
    }
);