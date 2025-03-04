import { userModel} from './../DB/model/User.model.js';
import { tokenTypes, verifyToken2 } from '../utils/token/token.js';
import * as dbService from '../DB/db.service.js';



export const authenticationSocket = async({socket = {}, tokenType = tokenTypes.access} = {}) => {
    
    const [bearer , token ] = socket.handshake?.auth?.authorization?.split(" ") || [];
        if(!bearer || !token){
            return {data: {message: "Not Authorized Access or invalid token" , status: 400}};
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
            return {data: {message: "invalid token" , status: 401}};

            // throw new Error("invalid token" );
        }

        console.log("Decoded ID:", decoded.id);
        
        const user = await dbService.findOne({
            model: userModel,
            // filter: {_id: decoded.id }
            filter: {_id: decoded.id , deleted: {$exists: false}}
        });

        console.log("User found:", user);
            
        if(!user){
            return {data: {message: "In_valid account user not found" , status: 404}};
        }
    
        const tolerance = 5000; // 5 seconds
        if (user.changeCredentialsTime?.getTime() >= decoded.iat * 1000 + tolerance) {
            return {data: {message: "Expired Token: Credentials have changed" , status: 400}};
        }

        return {data: {user
            , valid: true} };
};


export const authorization = async ({accessRoles = [] , role} = {}) => {
    if(!accessRoles.includes(role)){
        throw new Error("Not Authorized Access");
    } 
    return true;
};


