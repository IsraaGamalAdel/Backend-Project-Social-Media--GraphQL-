import path from 'node:path';
import connectDB from './DB/connection.js';
import authController from'./modules/auth/auth.controller.js';
import usersController from './modules/users/user.controller.js';
import postController from './modules/post/post.controller.js';
import { globalErrorHandling } from './utils/response/error.response.js';
import cors from 'cors'; // upload Deployment 
import helmet from 'helmet';
import morgan from 'morgan';
import { createHandler } from 'graphql-http/lib/use/express';
import { schema } from './modules/modules.schema.js';
import chatController from './modules/chat/chat.controller.js';


const bootstrap = async (app , express) => {
    // console.log(path.resolve('./src/uploads'));
    
    // app.use(morgan('short')); // prediction
    app.use(morgan('dev')); // development
    app.use(helmet());
    app.use(cors());
    app.use(express.json());
    app.use('/uploads' , express.static(path.resolve('./src/uploads')));

    app.get('/' , (req , res ,next) => {
        return res.status(200).json({
            message : "hello world"
        })
    });

    app.use('/graphql' , createHandler({schema}));
    app.use('/auth' , authController);
    app.use('/users' , usersController);
    app.use('/posts' , postController)
    app.use('/chat' , chatController);

    app.use(globalErrorHandling);

    app.all('*' , (req , res , next) => {
        return res.status(404).json({
            message : "In-valid routing"
        });
    });

    connectDB();
};


export default bootstrap;
