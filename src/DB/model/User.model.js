import  mongoose, { model, Schema, Types } from "mongoose";
import { roleTypes } from "../../middleware/auth.middleware.js";



export const genderTypes = {
    male: "male",
    female: "female"
};


export const providerTypes = {
    google: "google",
    system: "system"
};


const users =  new Schema({
    userName :{     
        type: String,
        trim: true, 
        required: [true , `please enter your name`],
        minlength: [2 , `userName minimum  2 characters`],
        maxlength: 50,
        validate: {
            validator: function(v){
                if(v == "admin"){
                    return false
                }
            },
            message: "userName can't be admin"
        }
    },
    email:{
        type: String,
        required:true,
        unique: [true ,`already exist email`],
    },
    //tempEmail
    tempEmail: String,
    //OTP Email
    emailOTP: String,
    //OTP update Email
    updateEmailOTP: String,
    //password
    password:{
        type: String,
        required: true
    },
    // OTP Forgot-Password
    forgotPasswordOTP: String,
    confirmEmail: {
        type: Boolean,
        default:false,
    },
    DOB: Date,
    phone: String,
    // images
    // image: String,
    // coverImages:[String],
    image: {secure_url: String , public_id: String},
    coverImages:[{secure_url: String , public_id: String}],

    role: {
        type: String,
        enum: Object.values(roleTypes),
        default: "User",
    },
    gender: {
        type: String,
        enum: Object.values(genderTypes),
        default: genderTypes.male
    },

    provider: {
        type: String,
        enum: Object.values(providerTypes),
        default: providerTypes.system
    },

    deleted: {type: Boolean},
    changeCredentialsTime: Date,
    otpBlockedUntil: Date,

    //OTP
    otpExpiresAt: Date,
    otpAttempts: Number,
    viewers: [{ userId: {type:Types.ObjectId , ref: "User"}, time: Date }],
    // viewers: [{ userId: {type:Types.ObjectId , ref: "User"}, time: [Date] }],
    
    modifiedBy: {type:Types.ObjectId , ref: "User"},
    blockedUsers: [{type:Types.ObjectId , ref: "User"}],
},{
    timestamps:true
})


export const userModel = mongoose.models.User || model("User" , users);

