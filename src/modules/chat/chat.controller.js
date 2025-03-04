import { Router } from 'express';
import { authentication, authorization } from './../../middleware/auth.middleware.js';
import * as chatService from './service/chat.service.js';
import { validation } from "../../middleware/validation.middleware.js";
import { endPoint } from './chat.endpoint.js';

// import * as validators from './user.validation.js';


const router = Router();

router.get('/:destId' , 
    authentication(),
    authorization(endPoint.profile),
    chatService.findOneChat
);



export default router;