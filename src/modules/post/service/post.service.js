import { postModel } from './../../../DB/model/Post.model.js';
import * as dbService from '../../../DB/db.service.js';
import { errorAsyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from './../../../utils/response/success.response.js';
import cloudinary from './../../../utils/multer/cloudinary.js';
import { roleTypes } from '../../../middleware/auth.middleware.js';
import { commentModel } from '../../../DB/model/Comment.model.js';
import { pagination } from '../../../utils/security/pagination.security.js';
import { socketConnection } from '../../../DB/model/User.model.js';
import { getIo } from '../../chat/chat.socket.controller.js';


const populateList = [
    {path: 'userId' , select: "userName email image" },
    {
        path: 'comments' , 
        match: { commentId: {$exists: false} } ,
        populate: [
            {
                path: 'replies',
                match: { commentId: {$exists: false} } ,
                populate: [
                    {
                        path: 'replies',
                        match: { commentId: {$exists: false} } ,
                    }
                ]
            }
        ]
    },
    {path: 'likes' , select: "userName email image" },
    {path: 'share' , select: "userName email image" },
    {path: 'tags' , select: "userName email image"  }
];

// Create posts
export const createPost = errorAsyncHandler(
    async (req , res , next) => {

        if(req.files){
            const attachments = [];
            for (const file of req.files){
                const {secure_url , public_id} = await cloudinary.uploader.upload(file.path , { folder: `posts`});
                attachments.push({secure_url , public_id})
            }
            req.body.attachments = attachments
        }

        const post = await dbService.create({
            model: postModel,
            data: {
                ...req.body,
                userId: req.user._id
            }
        })

        return successResponse({ res, message: "Welcome User to your account ( Create post)" ,  status:201 , data: {post}});
    }
);

// Update posts
export const updatePost = errorAsyncHandler(
    async (req , res , next) => {

        if(req.files?.length){
            const attachments = [];
            for (const file of req.files){
                const {secure_url , public_id} = await cloudinary.uploader.upload(file.path , { folder: `posts`});
                attachments.push({secure_url , public_id})
            }
            req.body.attachments = attachments
        }

        const post = await dbService.findOneAndUpdate({
            model: postModel,
            filter: {
                _id: req.params.postId , 
                deleted: {$exists: false},
                userId: req.user._id
            },
            data: {
                ...req.body,
            },
            options: {
                new: true
            }
        })

        return post? successResponse({ res, message: " User to your account ( Update post)" ,  status:200 , data: {post}})
            : next(new Error("Post not found" , {cause: 404}))
        ;
    }
);

// Get All posts
export const getAllPost = errorAsyncHandler(
    async (req , res , next) => {
        const {page , size} = req.query;

        // const result = [];

        // const posts = await dbService.findAll({
        //     model: postModel,
        //     filter: {
        //         deleted: {$exists: false}
        //     },
        //     populate: populateList
        // })

        // for (const post of posts){
        //     const comments = await dbService.findAll({
        //         model: commentModel,
        //         filter: {
        //             postId: post._id,
        //             deleted: {$exists: false}
        //         }
        //     })
        //     result.push({
        //         post,
        //         comments
        //     })
        // }

        //******************************************************* */
        // تانى حل  child-parent دة الافضل

        // const result = [];

        // const cursor = postModel.find({ deleted: {$exists: false} }).cursor();

        // for (let post = await cursor.next(); post != null; post = await cursor.next()) {
        //     const comments = await dbService.findAll({
        //         model: commentModel,
        //         filter: {
        //             postId: post._id,
        //             deleted: {$exists: false}
        //         }
        //     })
        //     result.push({
        //         post,
        //         comments
        //     })
        // }

        //************************************************************************************************ */
        // parent-child دة طريقة برضوا ومش الاحسن ان نشتغل بيها فى cases 

        const data = await pagination({
            model: postModel,
            filter: {
                deleted: {$exists: false},
            },
            page,
            size: size,
            populate: populateList
        })

        return successResponse({ res, 
            message: "Welcome User to your account ( All posts)" ,  
            status:200 , 
            data
        });
    }
);

// Delete (freeze) Post
export const freezePost = errorAsyncHandler(
    async (req , res , next) => {

        const owner = req.user.role === roleTypes.Admin ? {} : {userId: req.user._id}

        const post = await dbService.findOneAndUpdate({
            model: postModel,
            filter: {
                _id: req.params.postId , 
                deleted: {$exists: false},
                ...owner
            },
            data: {
                deleted: Date.now(),
                deletedBy: req.user._id
            },
            options: {
                new: true
            }
        })

        return post? successResponse({ res, message: "freeze Post" ,  status:200 , data: {post}})
            : next(new Error("Post not found" , {cause: 404}))
        ;
    }
);

// Restore Post
export const restorePost = errorAsyncHandler(
    async (req , res , next) => {

        const post = await dbService.findOneAndUpdate({
            model: postModel,
            filter: {
                _id: req.params.postId , 
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

        return post? successResponse({ res, message: "freeze Post" ,  status:200 , data: {post}})
            : next(new Error("Post not found" , {cause: 404}))
        ;
    }
);

// Like Post
export const likePost = errorAsyncHandler(
    async (req , res , next) => {
        const {action} = req.query;

        const data =  action?.toLowerCase() === 'unlike' ? {$pull: {likes: req.user._id,}} : {$addToSet: {likes: req.user._id,}}

        const post = await dbService.findOneAndUpdate({
            model: postModel,
            filter: {
                _id: req.params.postId , 
                deleted: {$exists: false},
            },
            data: data,
            options: {
                new: true
            }
        })

        getIo().to(socketConnection.get( post.userId.toString() )).emit("likePost", { postId: req.params.postId , likedBy: req.user._id , action });
        
        return post? successResponse({ res, message: "freeze Post" ,  status:200 , data: {post}})
            : next(new Error("Post not found" , {cause: 404}))
        ;
    }
);


export const undoPost = errorAsyncHandler(
    async (req, res, next) => {
        const { postId } = req.params;

        const post = await postModel.findOne({
            _id: postId,
            userId: req.user._id,
        });

        if (!post) {
            return next(new Error("Post not found", { cause: 404 }));
        }

        const counterTime = Date.now();
        const postCreationTime = post.createdAt.getTime();
        const timeNew = counterTime - postCreationTime;

        if (timeNew > 20 * 60 * 1000) { 
            return next(new Error("You can only undo posts within 2 minutes", { cause: 400 }));
        }

        await postModel.deleteOne({ _id: postId });

        return successResponse({ res, message: "Post undone successfully", status: 200 });
    }
);
