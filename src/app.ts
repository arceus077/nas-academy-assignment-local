import 'dotenv/config';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import express from 'express';
import { listening, dbConSuccess, dbConError } from './json/en.json';
import { ResponseStatus } from './utils/ResponseStatus';
import { Routes } from './routes/Routes';
import { mongooseConnection, closemongooseConnection } from './config/mongoose';
// oF8TAAWIcTVKjx1X
const port = process.env.PORT;

class App {
    public app: express.Application;
    public routePrv: Routes;

    constructor() {
        this.app = express();
        this.app.use(helmet());
        this.routePrv = new Routes();
        this.routePrv.routes(this.app);
        this.app.use(cookieParser());

        this.app.use((request, response) => {
            return response.status(ResponseStatus.REQUEST_NOT_FOUND)
            .send({ message: `${request.url}: Route Not Found` });
        });
        mongooseConnection
        .then((mongo) => {
            console.info(`STATUS: 200; nas-parking ${dbConSuccess}`);
        })
        .catch((err) => console.info(`STATUS: 500; nas-parking ${dbConError}`));

        process.on('SIGINT', closemongooseConnection).on('SIGTERM', closemongooseConnection);
    }
}

try {
    const app = new App().app;

    app.listen(port, () => {
        console.info(`${listening} ${port}`);
    });
} catch (err) {
    console.info(ResponseStatus.INTERNAL_SERVER_ERROR, 'Error in starting app');
    console.error(err);
}
