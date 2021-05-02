import 'dotenv/config';
import axios from 'axios';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import express from 'express';
import { listening, dbConSuccess, dbConError } from './json/en.json';
import { ResponseStatus } from './utils/ResponseStatus';
import { Routes } from './routes/Routes';
import { mongooseConnection } from './config/mongoose';

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
            console.info(`STATUS: 200 :: [info] :: nas-parking ${dbConSuccess}`);
        })
        .catch((err) => console.info(`STATUS: 500 :: [info] :: nas-parking ${dbConError}`));

        // process.on('SIGINT', closemongooseConnection()).on('SIGTERM', closemongooseConnection());
    }
}

try {
    const app = new App().app;

    // Initialise db and add parking spots automatically when the server starts
    axios.get(`${process.env.DB_API}/carpark/initialise`)
    .then(response => {
        response.data.deletedCount > 0 ?
        console.info(`Truncate car-parking database: Successful :: Total Parking Spots: ${response.data.parkingDetails.length}`)
        : console.info(`Truncate car-parking database: Database empty :: Total Parking Spots: ${response.data.parkingDetails.length}`);
    }).catch(error => {
        console.log(error);
    });

    app.listen(port, () => {
        console.info(`${listening} ${port}`);
    });
} catch (err) {
    console.info(ResponseStatus.INTERNAL_SERVER_ERROR, 'Error in starting app');
    console.error(err);
}
