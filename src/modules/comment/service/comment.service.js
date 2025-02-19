import { errorAsyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from './../../../utils/response/success.response.js';
import * as dbService from '../../../DB/db.service.js';
import { postModel } from './../../../DB/model/Post.model.js';
import { commentModel } from './../../../DB/model/Comment.model.js';
import cloudinary from './../../../utils/multer/cloudinary.js';
import { roleTypes } from './../../../middleware/auth.middleware.js';



export const createComment = errorAsyncHandler(
    async (req , res ,next) => {
        console.log(req.files);
        const {postId , commentId} = req.params;

        if(commentId){
            const checkComment = await dbService.findOne({
                model: commentModel,
                filter: {
                    _id: commentId,
                    postId: postId,
                    deleted: {$exists: false}
                }
            })
            if(!checkComment){
                return next(new Error("Can not reply , Comment not found" , {cause: 404}))
            }
            req.body.commentId = commentId
        }

        const post = await dbService.findOne({
            model: postModel,
            filter: {
                _id: postId ,
                deleted: {$exists: false}
            }
        })

        if(!post){
            return next(new Error("Post not found" , {cause: 404}))
        }

        if(req.files?.length){
            const attachments = [];
            for (const file of req.files){
                const {secure_url , public_id} = await cloudinary.uploader.upload(file.path ,
                        { folder: `${process.env.APP_NAME}/user/${post.userId}/post/comment`}
                    );
                attachments.push({secure_url , public_id})
            }
            req.body.attachments = attachments
        }

        const comment = await dbService.create({
            model: commentModel,
            data: {
                ...req.body,
                postId: postId,
                userId: req.user._id
            }
        })

        return successResponse({res ,message: 'deno' , status: 201 , data: {comment , files:req.files} });
        
    }
);


export const updateComment = errorAsyncHandler(
    async (req , res ,next) => {
        const {postId ,commentId} = req.params;

        const comment = await dbService.findOne({
            model: commentModel,
            filter: {
                _id: commentId ,
                postId: postId,
                deleted: {$exists: false}
            },
            populate: [{
                path: "postId",
            }]
        }) 

        if(!comment || comment.postId.deleted){
            return next(new Error("Comment not found" , {cause: 404}));
        }

        if(req.files?.length){
            const attachments = [];
            for (const file of req.files){
                const {secure_url , public_id} = await cloudinary.uploader.upload(file.path ,
                        { folder: `${process.env.APP_NAME}/user/${comment.postId.userId}/post/comment`}
                    );
                attachments.push({secure_url , public_id})
            }
            req.body.attachments = attachments
        }
        
        const updateComment = await dbService.findOneAndUpdate({
            model: commentModel,
            filter: {
                _id: commentId ,
                postId: postId,
                deleted: {$exists: false}
            },
            data: req.body,
            options: {
                new: true
            }
        })



        return successResponse({res ,message: 'Comment updated successfully' , status: 201 , data: {comment: updateComment} });
        
    }
);


export const freezeComment = errorAsyncHandler(
    async (req , res ,next) => {
        const {postId ,commentId} = req.params;

        const comment = await dbService.findOne({
            model: commentModel,
            filter: {
                _id: commentId ,
                postId: postId,
                deleted: {$exists: false}
            },
            populate: [{
                path: "postId",
            }]
        }) 

        if( !comment 
            ||
            (   req.user.role != roleTypes.Admin
                &&
                req.user._id.toString() != comment
                &&
                req.user._id.toString() != comment.postId.userId.toString()
            )
        ) {
            return next(new Error("In-valid Comment or not Authorized " , {cause: 404}));
        }

        const updateComment = await dbService.findOneAndUpdate({
            model: commentModel,
            filter: {
                _id: commentId ,
                postId: postId,
                deleted: {$exists: false}
            },
            data: {
                deleted: Date.now(),
                deletedBy: req.user._id
            },
            options: {
                new: true
            }
        })


        return successResponse({res ,message: 'Comment freezed successfully' , status: 200 , data: {comment: updateComment} });
        
    }
);


export const unFreezeComment = errorAsyncHandler(
    async (req , res ,next) => {
        const {postId ,commentId} = req.params;

        const updateComment = await dbService.findOneAndUpdate({
            model: commentModel,
            filter: {
                _id: commentId ,
                postId: postId,
                deleted: {$exists: true},
                deletedBy: req.user._id
            },
            data: {
                $unset: {
                    deleted: 0,
                    deletedBy: 0
                }
            },
            options: {
                new: true
            }
        })

        return successResponse({res ,message: 'Comment unFreezed successfully' , status: 200 , data: {comment: updateComment} });
    }
);


