import 'dotenv/config';
import express from 'express';
import { listening } from './json/en.json';
import { ResponseStatus } from './utils/ResponseStatus';
import { Routes } from './routes/Routes';

const port = process.env.PORT;

class App {
    public app: express.Application;
    public routePrv: Routes;

    constructor() {
        this.app = express();
        this.routePrv = new Routes();
        this.routePrv.routes(this.app);

        this.app.use((request, response) => {
            return response.status(ResponseStatus.REQUEST_NOT_FOUND)
            .send({ message: `${request.url}: Route Not Found` });
        });
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
