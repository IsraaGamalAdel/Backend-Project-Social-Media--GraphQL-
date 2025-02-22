import { GraphQLBoolean, GraphQLEnumType, GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";
import { genderTypes, providerTypes } from "../../../DB/model/User.model.js";
import { roleTypes } from "../../../middleware/auth.middleware.js";





export const imageType =new GraphQLObjectType({
    name: "attachmentType",
    fields: {
        secure_url: {type: GraphQLString},
        public_id: {type: GraphQLString},
    }
})


export const userTypes = new GraphQLObjectType({
    name:"userType" ,
    fields: {
        _id: {type: GraphQLID},
        userName: {type: GraphQLString},
        email: {type: GraphQLString},
        tempEmail: {type: GraphQLString},
        emailOTP: {type: GraphQLString},
        confirmEmail: {type: GraphQLBoolean},
        updateEmailOTP: {type: GraphQLString},
        password: {type: GraphQLString},
        forgotPasswordOTP: {type: GraphQLString},
        phone: {type: GraphQLString},
        gender: {type: new GraphQLEnumType({
            name: "genderTypes",
            values: {
                male: {value: genderTypes.male},
                female: {value: genderTypes.female}
            }
        })},
        DOB: {type: GraphQLString},
        role:  {type: new GraphQLEnumType({
            name: "roleTypes",
            values: {
                admin: {value: roleTypes.Admin},
                user: {value: roleTypes.User},
                superAdmin: {value: roleTypes.SuperAdmin},
            }
        })},
        provider:  {type: new GraphQLEnumType({
            name: "providerTypes",
            values: {
                google: {value: providerTypes.google},
                system: {value: providerTypes.system},
            }
        })},
        image: {type:imageType},
        
        coverImages: {type: new GraphQLList(
            imageType
        )},
        deleted: {type: GraphQLString},
        changeCredentialsTime: {type: GraphQLString},
        otpBlockedUntil: {type: GraphQLString},
        otpExpiresAt: {type: GraphQLString},
        otpAttempts: {type: GraphQLInt},
        blockedUsers: {type: new GraphQLList(GraphQLID)},
        createdAt: {type: GraphQLString},
        updatedAt: {type: GraphQLString},
    }
})


export const usersList = new GraphQLList( userTypes )



export const userProfileResponse = new GraphQLObjectType({
    name: "userProfile",
    fields: {
        statusCode: {type: GraphQLInt},
        message: {type: GraphQLString},
        data: {type: userTypes}
    }
})


