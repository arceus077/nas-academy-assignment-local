import { Request, Response } from 'express';
// import { camelizeKeys } from 'xcase';
import * as _ from 'lodash';
import parkingSchema from '../../schema/parkings';
import { ResponseStatus } from '../../utils/ResponseStatus'

class CarParkingController {
    public async initialiseParkingSlots(req: Request, res: Response) {
        // Get total slots number from .env file
        let totalSlots = +process.env.TOTAL_SLOTS;

        // If total slots is zero by default it'll take 20 slots
        if (totalSlots === 0) {
            totalSlots = 20;
        }

        try {
            console.log('initialiseParkingSlots :: req.url', `${req.url}`, 'initialiseParkingSlots called');
            const { deletedCount } = await parkingSchema.deleteMany({}); // Delete all existing parking slots to initialise new Data

            const parkingSlots = Array.from(
                Array(totalSlots),
                (value, index) =>  ({ slotNumber: index + 1, carNumber: '' }),
            );
            const response = await parkingSchema.insertMany(parkingSlots); // Save all the parking spots for the first time server loads/reloads

            return res.status(ResponseStatus.STATUS_OK).json({
                deletedCount,
                parkingDetails: response,
                success: true,
            });
        } catch(error) {
            console.error(error);
            return res.status(ResponseStatus.INTERNAL_SERVER_ERROR).send({ message: error.message, success: false });
        }
    };

    public async parkAndGetSlotNumber(req: Request, res: Response) {
        // API 1 >  To park the car and get the slot number, if all slots occupied respective message is sent
        const { number }  = req.params;

        if (!number) { // if no params is received send appropriate response
            return res.status(ResponseStatus.BAD_REQUEST).send({ message: 'Car Number cannot be empty', success: false });
        }

        try {
            console.log('parkAndGetSlotNumber :: req.url', `${req.url}`, 'parkAndGetSlotNumber called');

            // Check if the car number already exists
            const carCheck: any = await parkingSchema.findOne({ carNumber: number });
            if (carCheck) {
                return res.status(ResponseStatus.STATUS_OK).json({
                    parkingDetails: {
                        id: carCheck._id,
                        carNumber: carCheck.carNumber,
                        slotNumber: carCheck.slotNumber,
                    },
                    message: 'Car with this number is already parked',
                    success: true,
                });
            }
            // if the car number is not already parked, then park the car
            const response: any = await parkingSchema.findOneAndUpdate({ carNumber: "" }, { carNumber: number }, { new: true });
            if (response) {
                return res.status(ResponseStatus.STATUS_OK).json({
                    parkingDetails: {
                        id: response._id,
                        carNumber: response.carNumber,
                        slotNumber: response.slotNumber,
                    },
                    message: `Successfully Parked! Your Parking No is: P- ${response.slotNumber}`,
                    success: true,
                });
            }

            // if the car was not parked due to no slots available send appropriate response
            return res.status(ResponseStatus.STATUS_OK).json({
                parkingDetails: {},
                message: 'All parking spaces are occupied, Please try again later',
                success: true,
            });
            
        } catch(error) {
            console.error(error);
            return res.status(ResponseStatus.INTERNAL_SERVER_ERROR).send({ message: error.message, success: false });
        }
    };

    public async unparkAndGetSlotNumber(req: Request, res: Response) {
        // API 2 >  To un-park the car and get the slot number, if no such car exists in parking respective message is sent
        const { number }  = req.params;

        // if no params is received send appropriate response
        if (!number) {
            return res.status(ResponseStatus.BAD_REQUEST).send({ message: 'Car Number cannot be empty', success: false });
        }

        try {
            console.log('unparkAndGetSlotNumber :: req.url', `${req.url}`, 'unparkAndGetSlotNumber called');

            // if the car number does not exists then park the car
            const response: any = await parkingSchema.findOneAndUpdate({ carNumber: number }, { carNumber: "" }, { new: true });
            if (response) {
                return res.status(ResponseStatus.STATUS_OK).json({
                    parkingDetails: {
                        id: response._id,
                        slotNumber: response.slotNumber,
                    },
                    message: `Successfully Un-Parked the car! Parking Slot: P- ${response.slotNumber} is now free`,
                    success: true,
                });
            }

            // if No such car is parked send appropriate response
            return res.status(ResponseStatus.STATUS_OK).json({
                parkingDetails: {},
                message: 'No such car is parked, Please give a correct car number',
                success: true,
            });
            
        } catch(error) {
            console.error(error);
            return res.status(ResponseStatus.INTERNAL_SERVER_ERROR).send({ message: error.message, success: false });
        }
    };

    public async getParkingDetails(req: Request, res: Response) {
        // API 3 >  To park the car and get the slot number, if all slots occupied respective message is sent
        const { number }  = req.params;

        if (number === undefined) { // if no params is received send appropriate response
            return res.status(ResponseStatus.BAD_REQUEST).send({ message: 'Car Number/Slot Number cannot be empty', success: false });
        }

        try {
            console.log('getParkingDetails :: req.url', `${req.url}`, 'getParkingDetails called');

            let response: any;
            let condition;
            // if given number is integer then add check for slot number also
            if(!isNaN(number)) {
                condition = [{ carNumber: number }, { slotNumber: +number }];
            } else {
                condition = [{ carNumber: number }];
            }

            response = await parkingSchema.findOne({ $or: condition });
            if (!response) {
                //  return data if no details are found neither for car/slot number
                return res.status(ResponseStatus.STATUS_OK).json({
                    parkingDetails: {},
                    message: `No Car/Parking Slots found for the given data`,
                    success: true,
                });
            }

            // get car parking details for the given car/slot number
            return res.status(ResponseStatus.STATUS_OK).json({
                parkingDetails: {
                    id: response._id,
                    carNumber: response.carNumber,
                    slotNumber: response.slotNumber,
                },
                message: 'Details for the given slot number/car number',
                success: true,
            });
        } catch(error) {
            console.error(error);
            return res.status(ResponseStatus.INTERNAL_SERVER_ERROR).send({ message: error.message, success: false });
        }
    };

    public async getAllParkingDetails(req: Request, res: Response) {
        // Complimentary API > Get all parking slot details
        try {
            console.log('getAllParkingDetails :: req.url', `${req.url}`, 'getAllParkingDetails called');

            const response: any = await parkingSchema.find();
            if (!response) {
                // return if no details found
                return res.status(ResponseStatus.STATUS_OK).json({
                    parkingDetails: {},
                    message: `No Parking Area Found`,
                    success: true,
                });
            }

            //  all details
            return res.status(ResponseStatus.STATUS_OK).json({
                parkingDetails: response,
                message: 'All Parking area details',
                success: true,
            });
        } catch(error) {
            console.error(error);
            return res.status(ResponseStatus.INTERNAL_SERVER_ERROR).send({ message: error.message, success: false });
        }
    };
}

export default CarParkingController;