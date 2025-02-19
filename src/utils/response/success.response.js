


// export const successResponse = ({res, message , data , status} = {}) => {
//     return res.status(status || 200).json({successMessage: message , data});
// };


export const successResponse = ({res, message = "success message", status = 200 , data = {}} = {}) => {
    return res.status(status).json({successMessage: message , data: {...data}});
};


