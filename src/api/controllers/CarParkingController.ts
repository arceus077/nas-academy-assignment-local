import { Request, Response } from 'express';
// import { camelizeKeys } from 'xcase';
import * as _ from 'lodash';
import parkingSchema from '../../schema/parkings';
import { ResponseStatus } from '../../utils/ResponseStatus'

class CarParkingController {
    public async getAssignmentReportData(req: Request, res: Response) {

        const response = await parkingSchema.deleteMany();
        console.log(response);

        return res.status(ResponseStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Done',
            success: true,
        });
    }
}

export default CarParkingController;