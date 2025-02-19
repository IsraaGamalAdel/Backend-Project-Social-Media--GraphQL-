import {Router} from "express";
import * as commentService from './service/comment.service.js';
import { authentication, authorization } from './../../middleware/auth.middleware.js';
import { uploadCloudinaryFile } from './../../utils/multer/cloudinary.multer.js';
import { fileValidationTypes } from './../../utils/multer/local.multer.js';
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from './comment.validation.js';
import { endPoint } from "./comment.endpoint.js";


const router = Router({mergeParams: true , caseSensitive: true , strict: false});

router.post("/:commentId?" , 
    authentication(),
    authorization(endPoint.create),
    uploadCloudinaryFile(fileValidationTypes.image).array('images' , 2),
    validation(validators.createCommentValidation),
    commentService.createComment
);


router.patch("/:commentId" , 
    authentication(),
    authorization(endPoint.create),
    uploadCloudinaryFile(fileValidationTypes.image).array('images' , 2),
    validation(validators.updateCommentValidation),
    commentService.updateComment
);


router.delete("/:commentId/freeze" , 
    authentication(),
    authorization(endPoint.freeze),
    validation(validators.freezeCommentValidation),
    commentService.freezeComment
);


router.patch("/:commentId/restore" , 
    authentication(),
    authorization(endPoint.freeze),
    validation(validators.freezeCommentValidation),
    commentService.unFreezeComment
);



export default router;


