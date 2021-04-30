import mongoose from 'mongoose';
import { dbConDisconnect } from '../json/en.json';

const mongoPath = 'mongodb+srv://bruce_wayne:oF8TAAWIcTVKjx1X@nasacademy-cluster.bpblm.mongodb.net/nas-parking?retryWrites=true&w=majority'

const mongooseConfig = async () => {
    return await mongoose.connect(mongoPath, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: true,
    })
};

const mongooseConnection = mongooseConfig();

const closemongooseConnection = async () => {
    await mongooseConnection.then((mongo) => mongo.connection.close());
    console.info(`>> nas-parking ${dbConDisconnect}`);
}

export { mongooseConnection, closemongooseConnection };
