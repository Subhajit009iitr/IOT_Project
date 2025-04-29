import mongoose from "mongoose";
var Schema = mongoose.Schema;
const sensorData = new Schema({
    device_id: String,
    lat: Number,
    lon: Number,
    alt: Number,
    temperature: Number,
    pressure: Number,
    ax: Number,
    ay: Number,
    az: Number,
    gx: Number,
    gy: Number,
    gz: Number,
    time: Date,
}, {
    collection: 'data'
});

const userData = new Schema({
    name: String,
    email: String,
    password: String,
}, {
    collection: 'admin'
});

const deviceData = new Schema({
    device_id: String,
    device_name: {type: String, default: "Heltec CubeCell"},
    device_status: {type: String, default: "active"},
    device_user: {type: String, default: "admin"}
}, {
    collection: 'devices'
});

const messageData = new Schema({
    device_id: String,
    message_id: String,
    message_data: String
}, {
    collection: 'messages'
});

export const sensorDataModel = mongoose.model("sensorData", sensorData);
export const deviceDataModel = mongoose.model("deviceData", deviceData);
export const userDataModel = mongoose.model("userData", userData);
export const messageDataModel = mongoose.model("messageData", messageData);

mongoose.connect(process.env.MONGO_URI);
