import path from "node:path";
import fs from "node:fs";
import multer from "multer";

export const fileValidationTypes = {
    image : ['image/png' , 'image/jpg' , 'image/jpeg'],
    video : ['video/mp4' , 'video/mkv'],
    document : ['application/json' , 'application/pdf' ],
    text: ['text/plain']
};


export const uploadDiskFile = ( customPath= "general" , fileValidation) => {

    const basePath = `uploads/${customPath}`;
    const fullPath = path.resolve(`./src/${basePath}`);
    if(!fs.existsSync(fullPath)){
        fs.mkdirSync(fullPath , { recursive: true});
    }


    const storage = multer.diskStorage({
        destination: ( req , file , cb) => {
            cb(null , fullPath);
        },
        filename: ( req , file , cb) => {
            console.log({file});
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            file.finalPath = basePath+ "/" + uniqueSuffix + "_" + file.originalname;
            cb(null , uniqueSuffix + "_" + file.originalname);
        }
    });

    function fileFilter(req , file , cb){
        if( fileValidation.includes(file.mimetype) ){
            cb(null , true);
        }
        else{
            cb("In-valid file format" , false);
        }
    };


    return multer({dest: "defaultUpload" , fileFilter , storage});
};