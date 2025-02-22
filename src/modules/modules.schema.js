import { GraphQLObjectType, GraphQLSchema } from "graphql";
import * as postQueryResolve  from "./post/resolve/query.resolve.js";
import * as postMutationResolve  from "./post/resolve/mutation.resolve.js";
import * as userQueryResolve  from "./users/resolver/user.query.resolver.js";




export const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'querySchema',
        description: "Query Schema All Project Modules",
        fields: {
            ...postQueryResolve,
            ...userQueryResolve
        }
    }),


    mutation: new GraphQLObjectType({
        name: 'mutationSchema',
        description: "Mutation Schema All Project Modules",
        fields: {
            ...postMutationResolve
        }
    }),
})