import * as dbService from "../../../DB/db.service.js";
import { chatModel } from "../../../DB/model/Chat.model.js";
import { errorAsyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from './../../../utils/response/success.response.js';



export const findOneChat = errorAsyncHandler(
    async (req , res , next) => {
        const {destId} = req.params;

        const chat = await dbService.findOne({
            model: chatModel,
            filter: {
                $or: [
                    {
                        mainUser: req.user._id , 
                        subParticipant: destId
                    }, 
                    {
                        mainUser: destId , 
                        subParticipant: req.user._id
                    }
                ]
            },
            populate:[
                {
                    path: "mainUser" 
                },
                {
                    path: "subParticipant" 
                },
                {
                    path: "messages.senderId" 
                }
            ]
        })

        // if(!chat){
        //     return next(new Error("Chat not found" , {cause: 404}));
        // }

        return successResponse({
            res,
            message: "Chat data retrieved successfully.",
            status: 200,
            data: { chat }
        })
    }
)