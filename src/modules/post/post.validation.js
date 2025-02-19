import joi from 'joi';
import { generalFields } from '../../middleware/validation.middleware.js';

export const createPostValidation = joi.object().keys({
    content: joi.string().min(2).max(20000).trim(),
    file: joi.array().items(generalFields.files).max(2),
}).or('content' , 'file');



export const updatePostValidation = joi.object().keys({
    postId: generalFields.id.required(),
    content: joi.string().min(2).max(20000).trim(),
    file: joi.array().items(generalFields.files).max(2),
}).or('content' , 'file');



export const freezePostValidation = joi.object().keys({
    postId: generalFields.id.required(),
}).required();


export const likePostValidation = joi.object().keys({
    postId: generalFields.id.required(),
    action: joi.string().valid('like' , 'unlike').default('like'),
}).required();


export const undoPostValidation = joi.object().keys({
    postId: generalFields.id.required(),
}).required();



