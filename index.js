import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({path:(path.resolve('./config/.env.dev'))});



import bootstrap from './src/app.controller.js';
import express from'express';
import chalk from 'chalk';

const app = express()
const port = process.env.PORT || 5000 ;

bootstrap(app , express);


app.listen(port, () => 
    console.log(chalk.bgBlue(`Example app listening on PORT ${port}!`))
);

app.on('error', (err) => {
    console.error(`Error app listening on PORT : ${err}`);
});


// dotenv.config({path:(path.resolve('./src/config/.env.dev'))});

// dotenv.config({path:(path.resolve('./src/config/.env.prod'))});
