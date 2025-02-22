import { GraphQLEnumType, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import * as dbService from "../../../DB/db.service.js";
import { postModel } from "../../../DB/model/Post.model.js";
import * as postTypes from "../types/post.types.js";




export const postList = {
    type: postTypes.postListResponse , 
    resolve: async (parent , args) =>  {
        const posts = await dbService.findAll({model: postModel })
        return { statusCode: 200 , message: "Success" , data: posts};
    }
};



