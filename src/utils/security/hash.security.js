import * as bcrypt from "bcrypt";



export const generateHash = ({plainText = "", salt = parseInt(process.env.SALT_ROUND)} = {}) => {
    const hash = bcrypt.hashSync(plainText , salt)
    return hash;
};


export const compareHash = ({plainText = "", hashValue = ""} = {}) => {
    const match = bcrypt.compareSync(plainText , hashValue)
    return match;
};


