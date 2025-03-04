import { roleTypes } from "../../middleware/auth.middleware.js";




export const endPoint = { 
    profile: Object.values(roleTypes),

    admin: [roleTypes.Admin , roleTypes.SuperAdmin , roleTypes.HR] ,

    // profile: [roleTypes.User , roleTypes.Admin]
};

