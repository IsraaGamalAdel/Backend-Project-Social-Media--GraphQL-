
import CryptoJS from "crypto-js";



export const generateEncryption = ({plainText = "", signature = process.env.ENCRYPTION_PHONE_SIGNATURE} = {}) => {
    const encryption = CryptoJS.AES.encrypt(plainText , signature).toString();
    return encryption;
};
export const decodeEncryption = ({cipherText = "", signature = process.env.ENCRYPTION_PHONE_SIGNATURE} = {}) => {
    const decrypt = CryptoJS.AES.decrypt(cipherText , signature).toString(CryptoJS.enc.Utf8);
    return decrypt;
};


