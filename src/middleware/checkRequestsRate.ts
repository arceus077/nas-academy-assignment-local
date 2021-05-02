import { ResponseStatus } from '../utils/ResponseStatus'
import userSchema from '../schema/users';

// middleware for request rate checker
const checkRequestRate = async (req, res, next) => {
    try {
        console.log('checkRequestRate for ip address: ', `${req.ip}`, 'checkRequestRate called')
        const { ip } = req;
        const user: any = await userSchema.findOne({ ip });
        const currentDate =  new Date().toLocaleDateString('en', { year: 'numeric', month: '2-digit', }); // take the current date of the request
        const time =  new Date().toLocaleTimeString('it-IT'); // take the current time of the request in DD/MM/YYYY
        const currentHour = time.substring(0, 2); // take current hours only
        const currentMinute = +time.substring(3, time.length - 3); // take current minutes only
        const currentSeconds = +time.substring(time.length - 2, time.length); // take current seconds only

        // check if the user is sending the request first time
        if (!user) { 
            await new userSchema({
                ip,
                prevTime: null,
                currentTime: `${currentDate},${time}`,
                count: 1,
            }).save();
            next();
        } else {
            const prevDateTime = user?.currentTime.split(','); // get date since the last time request was sent
            const prevDate = prevDateTime[0]; // get time since the last time request was sent
            const prevHour = prevDateTime[1].substring(0, 2); // take previous hours only
            const prevMinute = +prevDateTime[1].substring(3, prevDateTime[1].length - 3); // take previous minutes only
            const prevSeconds = +prevDateTime[1].substring(prevDateTime[1].length - 2, prevDateTime[1].length); // take previous seconds only
            // check the difference in seconds between the last and current request
            const secondsDifference = prevSeconds > currentSeconds ? (60 - prevSeconds) + currentSeconds : Math.abs(currentSeconds - prevSeconds);
            // check the difference in mintues between the last and current request
            const minutuesDifference = Math.abs(currentMinute - prevMinute);

            if (prevDate !== currentDate || currentHour !== prevHour || minutuesDifference > 1 || (secondsDifference > 10)) {
                // if last req was sent before after 10 seconds set count to 1
                await userSchema.findOneAndUpdate({ ip }, {
                    ip,
                    prevTime: null,
                    currentTime: `${currentDate},${time}`,
                    count: 1,
                });
                next();
            } else if (user?.count < 10) {
                // if last req was sent again in between last 10 seconds increment count
                const { count, currentTime } = user;
                await userSchema.findOneAndUpdate({ ip }, {
                    count: count + 1,
                    prevTime: currentTime,
                    currentTime: `${currentDate},${time}`,
                });
                next();
            } else {
                // if last req was sent again in last 10 seconds for the 11th time, ignore the req
                return res.status(ResponseStatus.INVALID_REQUEST).json({
                    message: 'Too many requests',
                    success: false,
                });
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(ResponseStatus.INTERNAL_SERVER_ERROR).send('Invalid Request');
    }
};

export default checkRequestRate;
