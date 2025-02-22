import { GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";
import { imageType, userTypes } from "../../users/types/user.types.js";
import * as dbService from "../../../DB/db.service.js";
import { userModel } from "../../../DB/model/User.model.js";




export const postType = new GraphQLObjectType({
    name: "postType",
    fields: {
        _id: {type: GraphQLID},
        content: {type: GraphQLString},
        attachments: {type: new GraphQLList(
            imageType
        )},
        likes: {type: new GraphQLList(GraphQLID)},
        tags: {type: new GraphQLList(GraphQLID)},
        share: {type: new GraphQLList(GraphQLID)},
        userId: {type: GraphQLID},
        userIdInfo: {
            type: userTypes,
            resolve: async(parent, args) => {
                return await dbService.findOne({
                    model: userModel,
                    filter: {
                        _id: parent.userId , 
                        deleted: false
                    }
                })
            }
        },
        deletedBy: {type: GraphQLID},
        deleted: {type: GraphQLString},
        createdAt: {type: GraphQLString},
        updatedAt: {type: GraphQLString},
    }
})


// export const postList = new GraphQLObjectType({
//     name: "AllPosts",
//     fields: {
//         posts: { 
//             type: new GraphQLList(postType)
//         }
//     }
// }) 

export const postList = new GraphQLList( postType )


export const  postListResponse = new GraphQLObjectType({
    name: "postList",
    fields:{
        statusCode: {type: GraphQLInt},
        message: {type: GraphQLString},
        data: {type: postList}
    }
})


export const likePostResponse = new GraphQLObjectType({
    name: "likePostOrUnLikePost",
    fields: {
        statusCode: {type: GraphQLInt},
        message: {type: GraphQLString},
        data: {type: postType}
    }
})