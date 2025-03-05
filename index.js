import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({path:(path.resolve('./config/.env.dev'))});


    
import bootstrap from './src/app.controller.js';
import express from'express';
import chalk from 'chalk';
import { runIo } from './src/modules/chat/chat.socket.controller.js';

const app = express()
const port = process.env.PORT || 5000 ;

bootstrap(app , express);


const httpServer = app.listen(port, () => {
    console.log(chalk.bgBlue(`Example app listening on PORT ${port}!`))
});

// Socket.io
runIo(httpServer);

app.on('error', (err) => {
    console.error(`Error app listening on PORT : ${err}`);
});


// dotenv.config({path:(path.resolve('./src/config/.env.dev'))});

// dotenv.config({path:(path.resolve('./src/config/.env.prod'))});
