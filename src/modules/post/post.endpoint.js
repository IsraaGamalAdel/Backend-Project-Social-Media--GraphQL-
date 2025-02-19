import { roleTypes } from "../../middleware/auth.middleware.js";





export const endPoint = { 
    createPost: [roleTypes.User],
    likePost: [roleTypes.User],
    freezePost: [roleTypes.User , roleTypes.Admin]
};

