import { Router } from "express";
import * as postService from './service/post.service.js';
import commentController from '../comment/comment.controller.js';
import { authentication, authorization } from "../../middleware/auth.middleware.js";
import { validation } from '../../middleware/validation.middleware.js';
import * as validators from './post.validation.js';
import { endPoint } from "./post.endpoint.js";
import { uploadCloudinaryFile } from './../../utils/multer/cloudinary.multer.js';
import { fileValidationTypes } from './../../utils/multer/local.multer.js';


const router = Router({caseSensitive: true , strict: true});

router.use("/:postId/comment" , commentController);

router.post('/' , authentication() , authorization(endPoint.createPost) , 
    uploadCloudinaryFile(fileValidationTypes.image).array('image' , 2),
    validation(validators.createPostValidation) ,
    postService.createPost
);

router.patch('/:postId' , authentication() , authorization(endPoint.createPost) , 
    uploadCloudinaryFile(fileValidationTypes.image).array('image' , 2),
    validation(validators.updatePostValidation) ,
    postService.updatePost
);


router.get('/' , authentication() ,
    postService.getAllPost
);


router.delete('/freeze/:postId' , authentication() , authorization(endPoint.freezePost) , 
    validation(validators.freezePostValidation) ,
    postService.freezePost
);


router.patch('/restorePost/:postId' , authentication() , authorization(endPoint.freezePost) , 
    validation(validators.freezePostValidation) ,
    postService.restorePost
);


router.patch('/:postId/like' , authentication() , authorization(endPoint.likePost) , 
    validation(validators.likePostValidation) ,
    postService.likePost
);


router.delete('/:postId/undoPost' , 
    authentication() , authorization(endPoint.freezePost) ,
    validation(validators.undoPostValidation),
    postService.undoPost
);


export default router;