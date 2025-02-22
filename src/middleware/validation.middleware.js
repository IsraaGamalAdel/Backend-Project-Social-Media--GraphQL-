import joi from 'joi';
import { genderTypes } from '../DB/model/User.model.js';
import { Types } from 'mongoose';



export const validationObjectId = (value , helper) => {
    return Types.ObjectId.isValid(value) ? true : helper.message('In_valid id objectId');
};


const fileObject = {
    fieldname: joi.string(),
    originalname: joi.string(),
    encoding: joi.string(),
    mimetype: joi.string(),
    destination: joi.string(),
    filename: joi.string(),
    path: joi.string(),
    size: joi.number()
};


export const generalFields = {
    userName: joi.string().min(2).max(50).trim(),
    email: joi.string().email({minDomainSegments: 2,maxDomainSegments: 3, tlds: {allow: ['com' ,'net' , 'edu']}}).messages({
        'string.email': "please enter valid email Ex: example@gmail.com",
        'string.empty': 'email cannot be empty',// not data
        'any.required': 'email is required',  //  لو متبعتش بيانات 
    }),
    password: joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z]).{8,}$/)),
    confirmPassword: joi.string(),
    phone: joi.string().pattern(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)),
    acceptLanguage: joi.string().valid('en' , 'ar').default('en'),
    // gender: joi.string().valid(genderTypes.male , genderTypes.female),
    gender: joi.string().valid(...Object.values(genderTypes)),
    DOB: joi.date().less("now"),
    id: joi.string().custom(validationObjectId),
    messages: joi.string().pattern(new RegExp(/^[a-zA-Z\u0621-\u064Aء-ئ][^#&<>\"~;$^%{}?]{2,500000}$/)), // to Arabic and English
    code: joi.string().pattern(new RegExp(/^\d{6}$/)),
    fileObject,
    files: joi.object(fileObject)
}; 





// طريقة حل تانية الطريقة دة اسرع كتير بس ليها عيب (بس استعمل الطريقة الى تريحنى )
export const validation = (scheme) => {
    return (req , res , next) => {
        
        const inputDate = {...req.body , ...req.params, ...req.query }; 

        if( req.file || req.files?.length){
            inputDate.file =  req.file || req.files ;
            // inputDate.file = { ...req.file , ...req.files };
        }
        
        const validationError = scheme.validate( inputDate , {abortEarly: false});
        if(validationError.error){
            return res.status(400).json({
                message: `Validation Error in the check input ${validationError.error.details[0].message}` , 
                validationError:validationError.error.details.message
            });
        }

        return next();
    }
};



export const validationGraphQL = async ({scheme , args={}} = {} ) => {

        const validationError = scheme.validate( args , {abortEarly: false});
        if(validationError.error){
            throw new Error(JSON.stringify({
                message:"Validation Error in the check input" ,
                details: validationError.error.details[0].message
            }));
        }
    return true;
};









// طريقة حل تانية ودة احسن  بس عيبها انها بتاخد وقت بس (بس استعمل الطريقة الى تريحنى )
export const validation_old = (scheme) => {
    return (req , res , next) => {

        const validationResult = [];

        for (const key of Object.keys(scheme)){
            const validationError = scheme[key].validate(req[key] , {abortEarly: false});
            if(validationError.error){
                validationResult.push(validationError.error.details);
            }
        }

        if(validationResult.length > 0){
            return res.status(400).json({message:"Validation Error" , validationResult});
        }


        // دة اول حل وطبعا مش احسن حاجة بس للتعليم ليكى
        // const validationError = scheme.validate(req.body , {abortEarly: false});
        // if(validationError.error){
        //     return res.status(400).json({message:"Validation Error" , validationError:validationError.error.details});
        // }

        // const validationErrorQuery = query.validate(req.query , {abortEarly: false});
        // if(validationErrorQuery.error){
        //     return res.status(400).json({message:"Validation Error Query" , validationErrorQuery:validationErrorQuery.error.details});
        // }

        return next();
    }
};


