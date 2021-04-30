import { Request, Response } from 'express';
// import { message } from '../json/en.json';
import CarParkingController from '../api/controllers/CarParkingController';

class Routes {
    private parkingController: CarParkingController;

    constructor() {
        this.parkingController = new CarParkingController();
    }

    public routes(app): void {
        app.route('/')
            .get((request: Request, response: Response) => {
                response.status(200).send("<h2>This is car parking assignment, please send api requests using postman or any other service.</h2><h5>Refer Documentation for more details</h5>");
            });
        app.route('/carpark/delete')
            .get(this.parkingController.getAssignmentReportData);
    }
}

export { Routes };