import { roleTypes } from "../../middleware/auth.middleware.js";





export const endPoint = { 
    create: [roleTypes.User],
    like: [roleTypes.User],
    freeze: [roleTypes.User , roleTypes.Admin]
};

