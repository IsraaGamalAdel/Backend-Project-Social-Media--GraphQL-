import { Router } from "express";
import * as userService from './service/user.service.js'
import { authentication, authorization, roleTypes } from "../../middleware/auth.middleware.js";
import { endPoint } from "./user.endpoint.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from './user.validation.js';
import { fileValidationTypes, uploadDiskFile } from "../../utils/multer/local.multer.js";
import { uploadCloudinaryFile } from "../../utils/multer/cloudinary.multer.js";



const router = Router();

// userProfile
router.get('/profile' , authentication() , authorization(endPoint.profile) ,userService.userProfile);

// UpdateUserProfile
router.patch('/profile' ,
    validation(validators.updateProfileValidation), 
    authentication(), authorization(endPoint.profile) ,  
    userService.UpdateUserProfile
);

// UpdatePassword
router.patch('/profile/password', 
    validation(validators.updatePasswordValidation), 
    authentication(), authorization(endPoint.profile), 
    userService.UpdatePassword
);

// Email
router.patch('/profile/email' , validation(validators.updateEmailValidation) ,authentication() , userService.UpdateEmail);
router.patch('/profile/replace-email' , validation(validators.replaceEmailValidation) ,authentication() , userService.replaceEmail);

// Block User
router.patch('/profile/block' , 
    authentication() , authorization(endPoint.profile) , 
    userService.blockUser
);

router.patch('/profile/unBlock' , 
    authentication() , authorization(endPoint.profile) ,
    userService.unBlockUser
);

// Images
router.patch('/profile/image', 
    authentication() , 
    // uploadDiskFile("users/profile" , fileValidationTypes.image).single('image') , 
    uploadCloudinaryFile( fileValidationTypes.image).single('image') , 
    // uploadCloudinaryFile( fileValidationTypes.image).any() , 
    userService.updateImages
);

router.patch('/profile/image/cover',authentication() , 
    // uploadDiskFile("users/profile/cover" , fileValidationTypes.image).array('image' , 10) , 
    uploadCloudinaryFile(fileValidationTypes.image).array('image' , 5) , 
    userService.coverImages
);

router.patch('/profile/identity',authentication() , 
    uploadDiskFile("users/profile/identity" , [...fileValidationTypes.image , fileValidationTypes.document[1]]).fields([
        { name: 'image' , maxCount:2},
        { name: 'document' , maxCount:1}
    ]) , 
    userService.userIdentity
);

// admin
router.get('/profile/admin/dashboard',authentication() , 
    authorization(endPoint.admin),
    userService.dashBoardAdmin
);


router.post('/profile/admin/roles',authentication() , 
    authorization(endPoint.admin),
    userService.changePrivileges
);


router.delete('/profile',authentication(), authorization(endPoint.profile), userService.freezeAccount)
router.get('/profile/:userId', validation(validators.shareProfileValidation) , authentication() ,userService.shareProfile);




export default router;


