import jwt from "jsonwebtoken";
import { userModel } from "../../DB/model/User.model.js";
import * as dbService from "../../DB/db.service.js";



export const tokenTypes ={
    access: "access",
    refresh: "refresh"
};


export const decodeToken = async ({authorization = "" , tokenType = tokenTypes.access , next} = {}) => {
    const [bearer , token ] = authorization?.split(" ") || [];
    if(!bearer || !token){
        return next(new Error("Not Authorized Access or invalid token" , {cause: 400}));
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
        return next(new Error("invalid token" , {cause: 401}));
    }
    
    // const user = await userModel.findOne({_id: decoded.id , deleted: false});
    const user = await dbService.findOne({
        model: userModel,
        filter: {_id: decoded.id , deleted: {$exists: false}}
    });
        
    if(!user){
        return next(new Error("In_valid account user not found" , {cause: 404}));
    }

    if(user.changeCredentialsTime?.getTime() >= decoded.iat * 1000){
        return next(new Error("Expired Token Credentials access user not found" , {cause: 400}));
    }

    return user;
};


export const generateToken2 = ({payload={} , signature = process.env.USER_ACCESS_TOKEN, expiresIn=parseInt(process.env.USER_EXPIREINTOKEN)} = {}) => {
    const token = jwt.sign(payload , signature, {expiresIn} )
    return token;
};


export const verifyToken2 = ({token = "" , signature = process.env.USER_ACCESS_TOKEN} = {}) => {
    const decoded = jwt.verify(token , signature)
    return decoded;
};


