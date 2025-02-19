import multer from "multer";


export const uploadCloudinaryFile = ( fileValidation = []) => {

    const storage = multer.diskStorage({});
    
    function fileFilter(req , file , cb){
        if( fileValidation.includes(file.mimetype) ){
            cb(null , true);
        }
        else{
            cb("In-valid file format" , false);
        }
        console.log({file});
    };
    


    return multer({dest: "dest" , fileFilter , storage});
};


