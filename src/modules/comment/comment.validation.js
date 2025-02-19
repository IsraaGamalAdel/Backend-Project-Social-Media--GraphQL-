import joi from 'joi';
import { generalFields } from '../../middleware/validation.middleware.js';


export const createCommentValidation = joi.object().keys({
    postId: generalFields.id.required(),
    commentId: generalFields.id,
    content: joi.string().min(2).max(20000).trim(),
    file: joi.array().items(generalFields.files).max(2),
}).or('content' , 'file');

// .options({allowUnknown: true})

export const updateCommentValidation = joi.object().keys({
    postId: generalFields.id.required(),
    commentId: generalFields.id.required(),
    content: joi.string().min(2).max(20000).trim(),
    file: joi.array().items(generalFields.files).max(2),
}).or('content' , 'file');



export const freezeCommentValidation = joi.object().keys({
    postId: generalFields.id.required(),
    commentId: generalFields.id.required(),
}).required();


export const likeCommentValidation = joi.object().keys({
    commentId: generalFields.id.required(),
    action: joi.string().valid('like' , 'unlike').default('like'),
}).required();



