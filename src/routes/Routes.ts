import { Request, Response } from 'express';
import RequestRateController from '../middleware/RequestRateController';
import CarParkingController from '../api/controllers/CarParkingController';

class Routes {
    private parkingController: CarParkingController; // Car Parking controller for parking/unparking cars
    private requestRateController: RequestRateController; // Middleware for request rate controller

    constructor() {
        this.parkingController = new CarParkingController();
        this.requestRateController = new RequestRateController();
    }

    public routes(app): void {
        app.route('/')
            .get((request: Request, response: Response) => {
                response.status(200).send("<h2>This is car parking assignment, please send api requests using postman or any other service.</h2><h5>Refer Documentation for more details</h5>");
            });
        app.route('/carpark/parkCar/:carnumber') // park the car for the given car number
            .get(this.requestRateController.checkRequestRate, this.parkingController.parkAndGetSlotNumber);
        app.route('/carpark/unparkCar/:slotnumber') // remove the car parked for the given car number
            .get(this.requestRateController.checkRequestRate, this.parkingController.unparkAndGetSlotNumber);
        app.route('/carpark/info/:number') // get details for that car number or slot number
            .get(this.requestRateController.checkRequestRate, this.parkingController.getParkingDetails);
        app.route('/carpark/alldetails') // get all details
            .get(this.requestRateController.checkRequestRate, this.parkingController.getAllParkingDetails);
    }
}

export { Routes };