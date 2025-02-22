import { GraphQLNonNull, GraphQLString } from "graphql";
import { userProfileResponse } from "../types/user.types.js";
import { authentication } from './../../../middleware/auth.graphQL.middleware.js';




export const profile = {
    type:  userProfileResponse ,
    args: {
        token: {type: new GraphQLNonNull( GraphQLString )}
    },

    resolve: async (parent , args ) => {

        const user = await authentication({authorization: args.token});

        return {
            statusCode: 200,
            message: "Success",
            data: user
        };
    }
}