import { Request, Response } from 'express';
import { ResponseStatus } from '../../utils/ResponseStatus';
import carParkingHelper from './helpers/carParkingHelper';

const { updateParkingValue } = carParkingHelper;

class CarParkingController {

    private parkings: Array<{
        slotNumber: number;
        carNumber: String;
    }>;

    constructor() {
        this.initialiseParkingSlots();
    }

    public initialiseParkingSlots = () => {
        // Get total slots number from .env file, If total slots is zero by default it'll take 20 slots
        let totalSlots = +process.env.TOTAL_SLOTS ? +process.env.TOTAL_SLOTS : 20;

        try {
            console.log('initialiseParkingSlots called', ' :: ', `Initialising ${totalSlots} parking spots`);

            const parkingSlots = Array.from(
                Array(totalSlots),
                (value, index) =>  ({ slotNumber: index + 1, carNumber: '' }),
            );

            // Save all the parking spots for the first time server loads/reloads
            this.parkings = [...parkingSlots];

            console.info(`${new Date().toLocaleTimeString()}: Successful :: Total Parking Spots: ${this.parkings.length}`);
        } catch(error) {
            console.error(error);
        }
    };

    public parkAndGetSlotNumber = async (req: Request, res: Response) => {
        // API 1 >  To park the car and get the slot number, if all slots occupied respective message is sent
        const { carnumber }  = req.params;

        if (!carnumber) { // if no params is received send appropriate response
            return res.status(ResponseStatus.BAD_REQUEST).send({ message: 'Car Number cannot be empty', success: false });
        }

        try {
            console.log('parkAndGetSlotNumber :: req.url', `${req.url}`, 'parkAndGetSlotNumber called');

            // Check if the car number already exists
            const carCheck = this.parkings.find(value => value.carNumber === carnumber);
            if (carCheck) {
                return res.status(ResponseStatus.STATUS_OK).json({
                    parkingDetails: {
                        carNumber: carCheck.carNumber,
                        slotNumber: carCheck.slotNumber,
                    },
                    message: 'Car with this number is already parked',
                    success: true,
                });
            }

            // if the car number is not parked, then park the car
            const index = this.parkings.findIndex(value => value.carNumber.length === 0);
            if (index !== -1) {
                const response = updateParkingValue(this.parkings, index, carnumber);
                // Set the data
                this.parkings = [...response];
                return res.status(ResponseStatus.STATUS_OK).json({
                    parkingDetails: {
                        carNumber: carnumber,
                        slotNumber: response[index].slotNumber,
                    },
                    message: `Successfully Parked! Your Parking No is: P- ${response[index].slotNumber}`,
                    success: true,
                });
            }

            // if the car was not parked due to no slots available, then send appropriate response
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

    public unparkAndGetSlotNumber = async (req: Request, res: Response) => {
        // API 2 >  To un-park the car and get the slot number, if no such car exists in parking respective message is sent
        const { slotnumber }  = req.params;

        // if no params is received, then send appropriate response
        if (!slotnumber) {
            return res.status(ResponseStatus.BAD_REQUEST).send({ message: 'Slot Number cannot be empty', success: false });
        }

        try {
            console.log('unparkAndGetSlotNumber :: req.url', `${req.url}`, 'unparkAndGetSlotNumber called');

            // find details for the given slot number
            const index = this.parkings.findIndex(value => value.slotNumber === +slotnumber);
            if (index !== -1) {
                // if the given slot number is already free then send appropriate response
                const carnumber = this.parkings[index].carNumber;
                if (carnumber.length === 0) {
                    return res.status(ResponseStatus.STATUS_OK).json({
                        parkingDetails: {
                            ...this.parkings[index],
                        },
                        message: `No car is parked in the given slot, Parking Slot: P- ${+slotnumber} is already free`,
                        success: true,
                    });
                }

                // if a car is parked in the given slot number, then un-park the car
                const response = updateParkingValue(this.parkings, index, '');
                // Set the data
                this.parkings = [...response];
                return res.status(ResponseStatus.STATUS_OK).json({
                    parkingDetails: {
                        slotNumber: response[index].slotNumber,
                        carNumber: response[index].carNumber,
                    },
                    message:
                    `Successfully Un-Parked car- ${carnumber}. Parking Slot: P- ${+slotnumber} is now free`,
                    success: true,
                });
            }

            // if slot no is invalid, then send appropriate response
            return res.status(ResponseStatus.STATUS_OK).json({
                parkingDetails: {},
                message: 'No such parking slot exists, Please give a correct slot number',
                success: true,
            });

        } catch(error) {
            console.error(error);
            return res.status(ResponseStatus.INTERNAL_SERVER_ERROR).send({ message: error.message, success: false });
        }
    };

    public getParkingDetails = async (req: Request, res: Response) => {
        // API 3 >  To park the car and get the slot number, if all slots occupied respective message is sent
        const { number }  = req.params;

        if (number === undefined) { // if no params is received send appropriate response
            return res.status(ResponseStatus.BAD_REQUEST).send({ message: 'Car Number/Slot Number cannot be empty', success: false });
        }

        try {
            console.log('getParkingDetails :: req.url', `${req.url}`, 'getParkingDetails called');

            let index;
            // if given number is integer then add check for slot number also
            if(!isNaN(number)) {
                index = this.parkings.findIndex(value => value.carNumber === number || value.slotNumber === +number);
            } else {
                index = this.parkings.findIndex(value => value.carNumber === number);
            }

            if (index === -1) {
                //  return data if no details are found neither for car/slot number
                return res.status(ResponseStatus.STATUS_OK).json({
                    parkingDetails: {},
                    message: `No Car/Parking Slots found for the given data`,
                    success: true,
                });
            }

            const { carNumber, slotNumber } = this.parkings[index];
            // get car parking details for the given car/slot number
            return res.status(ResponseStatus.STATUS_OK).json({
                parkingDetails: {
                    carNumber: carNumber,
                    slotNumber: slotNumber,
                },
                message: 'Details for the given slot number/car number',
                success: true,
            });
        } catch(error) {
            console.error(error);
            return res.status(ResponseStatus.INTERNAL_SERVER_ERROR).send({ message: error.message, success: false });
        }
    };

    public getAllParkingDetails = async (req: Request, res: Response) => {
        // Complimentary API > Get all parking slot details
        try {
            console.log('getAllParkingDetails :: req.url', `${req.url}`, 'getAllParkingDetails called');

            //  all details
            const response = [...this.parkings];

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
};

export default CarParkingController;
