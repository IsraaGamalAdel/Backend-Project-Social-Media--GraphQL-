import { GraphQLEnumType, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import * as dbService from "../../../DB/db.service.js";
import { postModel } from "../../../DB/model/Post.model.js";
import * as postTypes from "../types/post.types.js";
import { authentication, authorization } from "../../../middleware/auth.graphQL.middleware.js";
import { roleTypes } from "../../../middleware/auth.middleware.js";
import { validationGraphQL } from "../../../middleware/validation.middleware.js";
import { likePostQraphQLValidation } from "../post.validation.js";


export const likePost = {
    type: postTypes.likePostResponse,
    
    args: {
        postId: {type: new GraphQLNonNull( GraphQLID )},
        token: {type: new GraphQLNonNull( GraphQLString )},
        action: {type: new GraphQLNonNull(
            new GraphQLEnumType({
                name: "likeActionTypes",
                values: {
                    like: {value: 'like'},
                    unLike: {value: 'unLike'},
                }
            })
        )}
    },
    resolve: async(parent , args) => {
        const {postId , token , action} = args;

        await validationGraphQL({scheme: likePostQraphQLValidation , args});

        // authentication
        const user = await authentication({authorization: token});
        await authorization({ role: user.role , accessRoles: [roleTypes.User] });

        const data =  action === 'unlike' ? {$pull: {likes: user._id,}} : {$addToSet: {likes: user._id,}}
        
        const post = await dbService.findOneAndUpdate({
            model: postModel,
            filter: {
                _id: postId , 
                deleted: {$exists: false},
            },
            data: data,
            options: {
                new: true
            }
        })
        return {
            statusCode: 200,
            message: "Success",
            data: {post}
        }
    }
}
