import { Request, Response } from 'express';
import checkRequestRate from '../middleware/checkRequestsRate';
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
        app.route('/carpark/initialise') // Clear Db and initialise car parking spots
            .get(this.parkingController.initialiseParkingSlots);
        app.route('/carpark/parkCar/:number') // park the car for the given car number
            .get(checkRequestRate, this.parkingController.parkAndGetSlotNumber);
        app.route('/carpark/unparkCar/:number') // remove the car parked for the given car number
            .get(checkRequestRate, this.parkingController.unparkAndGetSlotNumber);
        app.route('/carpark/info/:number') // get details for that car number or slot number
            .get(checkRequestRate, this.parkingController.getParkingDetails);
        app.route('/carpark/alldetails') // get all details
            .get(checkRequestRate, this.parkingController.getAllParkingDetails);
    }
}

export { Routes };