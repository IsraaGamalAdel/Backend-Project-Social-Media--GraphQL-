import {userModel} from './../DB/model/User.model.js';
import { decodeToken, tokenTypes, verifyToken2 } from '../utils/token/token.js';
import { errorAsyncHandler } from './../utils/response/error.response.js';
import * as dbService from '../DB/db.service.js';


export const authentication = async({authorization , tokenType = tokenTypes.access} = {}) => {
    
    const [bearer , token ] = authorization?.split(" ") || [];
        if(!bearer || !token){
            throw new Error("Not Authorized Access or invalid token" , {cause: 400});
        }
            
        let accessSignature = "";
        let refreshSignature = "";
        switch (bearer) {
            case "System": 
                accessSignature = process.env.SYSTEM_ACCESS_TOKEN
                refreshSignature = process.env.SYSTEM_REFRESH_TOKEN
                break;
            case "Bearer":
                accessSignature = process.env.USER_ACCESS_TOKEN
                refreshSignature = process.env.USER_REFRESH_TOKEN
                break;
            default:
                break;
        }
        const decoded = verifyToken2({ token , signature : tokenType === tokenTypes.access ? accessSignature : refreshSignature });
        if(!decoded?.id){
            throw new Error("invalid token" );
            // return next(new Error("invalid token" , {cause: 401}));
        }
        
        // const user = await userModel.findOne({_id: decoded.id , deleted: false});
        const user = await dbService.findOne({
            model: userModel,
            filter: {_id: decoded.id , deleted: false}
        });
            
        if(!user){
            throw new Error("In_valid account user not found");
            // return next(new Error("In_valid account user not found" , {cause: 404}));
        }
    
        if(user.changeCredentialsTime?.getTime() >= decoded.iat * 1000){
            throw new Error("Expired Token Credentials access user not found");
            // return next(new Error("Expired Token Credentials access user not found" , {cause: 400}));
        }
    
        return user;
};


export const authorization = async ({accessRoles = [] , role} = {}) => {
            
            if(!accessRoles.includes(role)){
                throw new Error("Not Authorized Access");
                // return next(new Error("Not Authorized Access" , {cause: 403}));
            } 
            return true;
};


